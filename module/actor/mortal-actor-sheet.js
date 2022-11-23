/* global DEFAULT_TOKEN, Dialog, duplicate, game, mergeObject */

// Export this function to be used in other scripts
import { skillsDa, skillsModern, skillsWild } from "../../assets/skills/skills.js";
import { CoterieActorSheet } from "./coterie-actor-sheet.js";
import { rollDice, rollInit } from "./roll-dice.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CoterieActorSheet}
 */

export class MortalActorSheet extends CoterieActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vtm5e", "sheet", "actor", "mortal"],
      template: "systems/wod20/templates/actor/mortal-sheet.html",
      width: 800,
      height: 700,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats",
        },
      ],
    });
  }

  constructor(actor, options) {
    super(actor, options);
    this.isCharacter = true;
    this.hunger = false;
  }

  /** @override */
  get template() {
    if (!game.user.isGM && this.actor.limited)
      return "systems/wod20/templates/actor/limited-sheet.html";
    return "systems/wod20/templates/actor/mortal-sheet.html";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    // TODO: confirm that I can finish and use this list
    data.sheetType = `${game.i18n.localize("VTM5E.Mortal")}`;
    if(this.actor.type !== "vampire-da" && 
      (data?.data?.data?.headers?.sheetsystem === undefined || data.data.data.headers.sheetsystem === "")
    ) {
      data.data.data.headers.sheetsystem = "modern"
    }

    // Prepare items.
    if (this.actor.type === "mortal") {
      this._prepareItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for all sheets.
   *
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   * @override
   */
  _prepareItems(sheetData) {
    super._prepareItems(sheetData);
    const actorData = sheetData.actor;

    // Initialize containers.
    const specialties = [];
    const boons = [];
    const customRolls = [];
    const customDisciplines = [];

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === "specialty") {
        // Append to specialties.
        specialties.push(i);
      } else if (i.type === "boon") {
        // Append to boons.
        boons.push(i);
      } else if (i.type === "customRoll") {
        // Append to custom rolls.
        customRolls.push(i);
      } else if (i.type === "customDiscipline") {
        customDisciplines.push(i)
      }
    }
    // Assign and return
    actorData.specialties = specialties;
    actorData.boons = boons;
    actorData.customRolls = customRolls;
    actorData.customDisciplines = customDisciplines;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html);
    this._setupSquareCounters(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Ressource squares (Health, Willpower)
    html
      .find(".resource-counter > .resource-counter-step")
      .click(this._onSquareCounterChange.bind(this));
    html.find(".resource-plus").click(this._onResourceChange.bind(this));
    html.find(".resource-minus").click(this._onResourceChange.bind(this));

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));
    html.find(".custom-rollable").click(this._onCustomVampireRoll.bind(this));
    html.find(".specialty-rollable").click(this._onCustomVampireRoll.bind(this));
    html.find(".vrollable").click(this._onRollDialog.bind(this));
    html.find(".soakrollable").click(this._onSoakRollDialog.bind(this));
    html.find(".initrollable").click(this._onInitRollDialog.bind(this));
    html.find(".weapon-rollable").click(this._onWeaponRollDialog.bind(this));
    html.find(".damage-rollable").click(this._onDamageRollDialog.bind(this));
  }
  
  
  /**   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
   _onDamageRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log("damage dataset", dataset)

    const template = 'systems/wod20/templates/dialogs/damage-roll.html'

    let buttons = {};
    buttons = {
      
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Roll"),
        callback: async (html) => {

          const rollStrength = html.find("#rollstrength")[0]?.checked || false
          const rollPotence = html.find("#rollpotence")[0]?.checked || false
          let numDice = 0

          if(rollStrength) {
            let strength = this.actor.system.abilities['strength']?.value + (this.actor.system.abilities['strength']?.buff ? 
              this.actor.system.abilities['strength']?.buff : 0)

            if(Number.isNaN(strength)) {
              strength = 0
            }
            numDice += strength
          }

          if(rollPotence) {
            let potence = this.actor.system.disciplines && this.actor.system.disciplines['potence'] ? this.actor.system.disciplines['potence']?.value : 0
            if(Number.isNaN(potence)) {
              potence = 0
            }

            numDice += potence
          }

          let weaponDamage = parseInt(html.find("#weaponDamage")[0].value || 0) 
          if(Number.isNaN(weaponDamage)) {
            weaponDamage = 0
          }
          numDice += weaponDamage

          const name = game.i18n.localize("VTM5E.Damage")
          let modifier = parseInt(html.find("#inputMod")[0].value || 0) 
          if(Number.isNaN(modifier)) {
            modifier = 0
          }

          let difficulty = parseInt(html.find("#inputDif")[0].value || 6)
          if(Number.isNaN(difficulty)) {
            difficulty = 6
          }
          const specialty = html.find("#specialty")[0]?.checked || false
          const applyWounds = html.find("#applyWounds")[0]?.checked || false

          numDice += modifier

          const specialtyLabel = this._getSpecialityLabel(this.actor.specialties, 'strength')

          rollDice(
            numDice,
            this.actor,
            name,
            difficulty,
            specialty,
            this.actor.system.health.state,
            applyWounds,
            specialtyLabel
          )
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    let damageNumber = dataset.dmg ? parseInt(dataset.dmg.replace(/\D/g, '')) : '0'
    if(Number.isNaN(damageNumber)) {
      damageNumber = 0
    }

    this._onRenderDialogInternal(template, {damage: damageNumber, skillsArray: this._getSkillArray() }, dataset, buttons)
  }

  /**   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
   _onWeaponRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log("weapon dataset", dataset)

    const template = 'systems/wod20/templates/dialogs/weapon-roll.html'

    let buttons = {};
    buttons = {
      
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Roll"),
        callback: async (html) => {

          const attribute = html.find("#attributesSelect")[0]?.value
          let attributesVal = parseInt(!attribute || attribute === 'null' || attribute === '' ? '0' : 
            this.actor.system.abilities[attribute]?.value + (this.actor.system.abilities[attribute]?.buff ? 
            this.actor.system.abilities[attribute]?.buff : 
          0))
          if(Number.isNaN(attributesVal)) {
            attributesVal = 0
          }

          const ability = html.find("#abilitySelect")[0]?.value
          let abilityVal = parseInt(!ability || ability === 'null'|| ability === ''  ? '0' : 
            this.actor.system.skills[ability]?.value)
          if(Number.isNaN(abilityVal)) {
            abilityVal = 0
          }

          const attributesLabel = game.i18n.localize(this.actor.system.abilities[attribute]?.name) 
          const abilitiesLabel = game.i18n.localize(this.actor.system.skills[ability]?.name)

          let modifier = parseInt(html.find("#inputMod")[0].value || 0) 
          if(Number.isNaN(modifier)) {
            modifier = 0
          }

          let difficulty = parseInt(html.find("#inputDif")[0].value || 6)
          if(Number.isNaN(difficulty)) {
            difficulty = 6
          }

          const specialty = html.find("#specialty")[0]?.checked || false
          const applyWounds = html.find("#applyWounds")[0]?.checked || false

          const numDice = abilityVal + attributesVal + modifier

          const specialtyLabel = this._getSpecialityLabel(this.actor.specialties, attribute, ability)

          rollDice(
            numDice,
            this.actor,
            `${attributesLabel} + ${abilitiesLabel}`,
            difficulty,
            specialty,
            this.actor.system.health.state,
            applyWounds,
            specialtyLabel
          )

        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    let difficultyNumber = dataset.diff ? parseInt(dataset.diff.replace(/\D/g, '')) : '6'
    if(Number.isNaN(difficultyNumber)) {
      difficultyNumber = 6
    }

    this._onRenderDialogInternal(template, {difficulty: difficultyNumber, skillsArray: this._getSkillArray() }, dataset, buttons)
  }

  /**   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
   _onInitRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log("init dataset", dataset)

    const template = 'systems/wod20/templates/dialogs/init-roll.html'

    let buttons = {};
    buttons = {
      
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Roll"),
        callback: async (html) => {
          let dexterity = this.actor.system.abilities['dexterity']?.value + (this.actor.system.abilities['dexterity']?.buff ? 
          this.actor.system.abilities['dexterity']?.buff :  0)
          if(Number.isNaN(dexterity)) {
            dexterity = 0
          }

          let wits = parseInt(this.actor.system.abilities['wits']?.value);
          if(Number.isNaN(wits)) {
            wits = 0
          }

          let modifier = dexterity + wits + parseInt(html.find("#inputMod")[0].value || 0)
          const specialty = html.find("#specialty")[0]?.checked || false
          const specialty2 = html.find("#specialty2")[0]?.checked || false

          modifier += (specialty ? 1 : 0) + (specialty2 ? 1 : 0)

          rollInit(
            modifier,
            this.actor,
          )
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    this._onRenderDialogInternal(template, {sheettype: dataset.sheettype}, dataset, buttons)
  }

  /**   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
   _onSoakRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log("soak dataset", dataset)

    const template = 'systems/wod20/templates/dialogs/soak-roll.html'

    let buttons = {};
    buttons = {
      
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Roll"),
        callback: async (html) => {

          const rollStamina = html.find("#rollstamina")[0]?.checked || false
          const rollFortitude = html.find("#rollfortitude")[0]?.checked || false
          const rollArmor = html.find("#rollarmor")[0]?.checked || false
          let numDice = 0

          if(rollStamina) {
            let stamina = this.actor.system.abilities['stamina']?.value + (this.actor.system.abilities['stamina']?.buff ? 
              this.actor.system.abilities['stamina']?.buff : 0)

            if(Number.isNaN(stamina)) {
              stamina = 0
            }
            numDice += stamina
          }

          if(rollFortitude) {
            let fortitude = this.actor.system.disciplines && this.actor.system.disciplines['fortitude'] ? this.actor.system.disciplines['fortitude']?.value : 0
            if(Number.isNaN(fortitude)) {
              fortitude = 0
            }

            numDice += fortitude
          }

          if(rollArmor) {
            let armor = this.actor.system.armor.rating ? parseInt(this.actor.system.armor.rating) : 0
            if(Number.isNaN(armor)) {
              armor = 0
            }

            numDice += armor
          }

          const name = game.i18n.localize("VTM5E.Soak")
          const modifier = parseInt(html.find("#inputMod")[0].value || 0)
          const difficulty = parseInt(html.find("#inputDif")[0].value || 6)
          const specialty = html.find("#specialty")[0]?.checked || false

          numDice += modifier

          const specialtyLabel = this._getSpecialityLabel(this.actor.specialties, 'stamina')

          rollDice(
            numDice,
            this.actor,
            name,
            difficulty,
            specialty,
            this.actor.system.health.state,
            false,
            specialtyLabel
          )
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    this._onRenderDialogInternal(template, {sheettype: dataset.sheettype}, dataset, buttons)
  }

  /**   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollDialog(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const template = 'systems/wod20/templates/dialogs/custom-roll.html'

    let buttons = {};
    buttons = {
      
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Roll"),
        callback: async (html) => {
          const ability = html.find("#abilitySelect")[0]?.value
          let abilityVal = parseInt(!ability || ability === 'null'|| ability === ''  ? '0' : 
            this.actor.system.skills[ability]?.value)
          if(Number.isNaN(abilityVal)) {
            abilityVal = 0
          }

          const attribute = html.find("#attributesSelect")[0]?.value
          let attributesVal = parseInt(!attribute || attribute === 'null' || attribute === '' ? '0' : 
            this.actor.system.abilities[attribute]?.value + (this.actor.system.abilities[attribute]?.buff ? 
            this.actor.system.abilities[attribute]?.buff : 
          0))
          if(Number.isNaN(attributesVal)) {
            attributesVal = 0
          }
          const clickedRollName = dataset.label.toLowerCase()

          let actorsOwnBuff = parseInt(dataset.ability && this.actor.system.abilities[clickedRollName]?.buff ? this.actor.system.abilities[clickedRollName]?.buff : '0')
          if(Number.isNaN(actorsOwnBuff)) {
            actorsOwnBuff = 0
          }

          const name = attribute ? game.i18n.localize(this.actor.system.abilities[attribute]?.name) : game.i18n.localize(this.actor.system.skills[ability]?.name)
          const modifier = parseInt(html.find("#inputMod")[0].value || 0)
          const difficulty = parseInt(html.find("#inputDif")[0].value || 6)
          const specialty = html.find("#specialty")[0]?.checked || false
          const applyWounds = html.find("#applyWounds")[0]?.checked || false
          let roll = dataset.roll && dataset.roll !== '' ? parseInt(dataset.roll) : 0
          if(Number.isNaN(roll)) {
            roll = 0
          }

          const numDice = dataset.noability!=="true" ? abilityVal + attributesVal + roll + actorsOwnBuff + modifier : roll + modifier
          const specialtyLabel = this._getSpecialityLabel(this.actor.specialties, attribute, ability, clickedRollName)

          rollDice(
            numDice,
            this.actor,
            dataset.noability !== 'true'
              ? `${dataset.label} + ${name}`
              : `${dataset.label}`,
            difficulty,
            specialty,
            this.actor.system.health.state,
            applyWounds,
            specialtyLabel
          )
          // this._vampireRoll(numDice, this.actor, `${dataset.label} + ${abilityName}`, difficulty)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    const abilities = Object.keys(this.actor.system.abilities, dataset, buttons)
    this._onRenderDialogInternal(template, { noability: dataset.noability, rollingattributes: dataset.ability, skillsArray: this._getSkillArray(), abilities }, dataset, buttons)
  }

  _getSpecialityLabel(specialities, attibuteValue, abilityValue, wildcardValue) {
    let returnLabel = ''
    specialities.forEach((specialty) => {
      let foundMatch = false
      let specialitySource = ''
      if (specialty.data.useattributes) {
        foundMatch = specialty.data.attribute === attibuteValue || specialty.data.attribute === wildcardValue
        if(foundMatch) {
          specialitySource = game.i18n.localize(this.actor.system.abilities[specialty.data.attribute === attibuteValue ? attibuteValue : wildcardValue]?.name)
        }
      } else {
        foundMatch = specialty.data.skill === abilityValue || specialty.data.skill === wildcardValue
        if(foundMatch) {
          specialitySource = game.i18n.localize(this.actor.system.skills[specialty.data.skill === abilityValue ? abilityValue : wildcardValue]?.name)
        }
      }
      if (foundMatch) {
        if(returnLabel !== '') {
          returnLabel += ', '
        }                  
        returnLabel += specialty.name
        if(specialitySource && specialitySource !== '') {
          returnLabel += ' (' + specialitySource + ')'
        }
      }
    })

    return returnLabel
  }

  _getSkillArray() {
    let skillsArray = skillsModern
    switch(this.actor.system.headers.sheetsystem) {
      case "darkages":
        skillsArray = skillsDa
        break;
      case "wildwest":
        skillsArray = skillsWild
        break;
    }
    return skillsArray
  }

  _onRenderDialogInternal(template, extraFields, dataset, buttons) {
    super._onRenderDialog(template, extraFields, game.i18n.localize('VTM5E.Rolling') + ` ${dataset.label}...`, buttons);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const useHunger = this.hunger && dataset.useHunger === "1";
    const numDice = dataset.roll;
    // console.log(dataset.roll);
    rollDice(numDice, this.actor, `${dataset.label}`, 6);
  }

  _onCustomVampireRoll(event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const attributes = this.actor.system.abilities
    const skills = this.actor.system.skills

    if (dataset.dice1 === "") {
      const dice2 =
        this.actor.system.skills[dataset.dice2.toLowerCase()].value;
      dataset.roll = dice2
      dataset.label = dataset.name;
      this._onRollDialog(event);
    } else {
      const dice1 = (attributes[dataset.dice1.toLowerCase()]?.value !== undefined ? attributes[dataset.dice1.toLowerCase()].value : 0) + 
        (attributes[dataset.dice1.toLowerCase()]?.buff !== undefined ? attributes[dataset.dice1.toLowerCase()].buff : 0)

      const dice2 = skills[dataset.dice2.toLowerCase()]?.value !== undefined ? skills[dataset.dice2.toLowerCase()].value : 0;
      const dicePool = dice1 + dice2;

      const difficulty = dataset.difficulty ? parseInt(dataset.difficulty) : 6

      rollDice(dicePool, this.actor, `${dataset.name}`, Number.isNaN(difficulty) ? 6 : difficulty, dataset.specialty, this.actor.system.health.state, dataset.applywounds);
    }
  }

  _onSquareCounterChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const index = Number(element.dataset.index);
    const oldState = element.dataset.state || "";
    const parent = $(element.parentNode);
    const data = parent[0].dataset;
    const states = parseCounterStates(data.states);
    const fields = data.name.split(".");
    const steps = parent.find(".resource-counter-step");
    const humanity = data.name === "data.humanity";
    const fulls = Number(data[states["-"]]) || 0;
    const halfs = Number(data[states["/"]]) || 0;
    const crossed = Number(data[states.x]) || 0;
    const star = Number(data[states["*"]]) || 0;
    if (index < 0 || index > steps.length) {
      return;
    }
  
    const allStates = ["", ...Object.keys(states)];
    const currentState = allStates.indexOf(oldState);
    if (currentState < 0) {
      return;
    }
    // console.log(currentState)
    const newState = allStates[(currentState + 1) % allStates.length];
    steps[index].dataset.state = newState;

    if (
      (oldState !== "" && oldState !== "-") ||
      (oldState !== "" && humanity)
    ) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1;
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== "" && newState === "" && !humanity) {
      data[states["-"]] = Number(data[states["-"]]) - 1;
    }

    if (newState !== "") {
      data[states[newState]] =
        Number(data[states[newState]]) +
        Math.max(index + 1 - fulls - halfs - crossed, 1);
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0;
      return obj;
    }, {});
    this._assignToActorField(fields, newValue);
  }

  _setupSquareCounters(html) {
    html.find(".resource-counter").each(function () {
      const data = this.dataset;
      const states = parseCounterStates(data.states);
      const humanity = data.name === "data.humanity";

      const fulls = Math.max(Number(data[states["-"]]) || 0,0);
      const halfs = Math.max(Number(data[states["/"]]) || 0);
      const crossed = Math.max(Number(data[states.x]) || 0);

      const values = humanity
        ? new Array(fulls + halfs)
        : new Array(halfs + crossed + fulls );

      if (humanity) {
        values.fill("-", 0, fulls);
        values.fill("/", fulls, fulls + halfs);
      } else {
        /*
        values.fill("/", 0, halfs);
        values.fill("-", halfs, halfs + fulls )
        values.fill("x", halfs + fulls, halfs + fulls + crossed);
        */
       
        values.fill("-", 0, fulls);
        values.fill("x", fulls, fulls + crossed )
        values.fill("/", fulls + crossed, fulls + crossed + halfs);
      }

      $(this)
        .find(".resource-counter-step")
        .each(function () {
          this.dataset.state = "";
          if (this.dataset.index < values.length) {
            this.dataset.state = values[this.dataset.index];
          }
        });
    });
  }

  _onResourceChange(event) {
    event.preventDefault();
    const actorData = duplicate(this.actor);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const resource = dataset.resource;
    if (dataset.action === "plus") {
      actorData.data[resource].max++;
    } else if (dataset.action === "minus") {
      actorData.data[resource].max = Math.max(
        actorData.data[resource].max - 1,
        0
      );
    }

    if (
      actorData.data[resource].aggravated +
        actorData.data[resource].superficial >
      actorData.data[resource].max
    ) {
      actorData.data[resource].aggravated =
        actorData.data[resource].max - actorData.data[resource].superficial;
      if (actorData.data[resource].aggravated <= 0) {
        actorData.data[resource].aggravated = 0;
        actorData.data[resource].superficial = actorData.data[resource].max;
      }
    }
    this.actor.update(actorData);
  }
}

function parseCounterStates(states) {
  return states.split(",").reduce((obj, state) => {
    const [k, v] = state.split(":");
    obj[k] = v;
    return obj;
  }, {});
}
