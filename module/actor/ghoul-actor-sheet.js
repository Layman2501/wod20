/* global Dialog, game, mergeObject */

import { MortalActorSheet } from "./mortal-actor-sheet.js";

import { rollDice } from "./roll-dice.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class GhoulActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vtm5e", "sheet", "actor", "ghoul"],
      template: "systems/wod20/templates/actor/ghoul-sheet.html",
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

  /** @override */
  get template() {
    if (!game.user.isGM && this.actor.limited)
      return "systems/wod20/templates/actor/limited-sheet.html";
    return "systems/wod20/templates/actor/ghoul-sheet.html";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    data.sheetType = `${game.i18n.localize("VTM5E.Ghoul")}`;

    // Prepare items.
    if (this.actor.data.type === "ghoul") {
      this._prepareItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Disciplines for Vampire & Ghoul sheets.
   *
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   * @override
   */
  _prepareItems(sheetData) {
    super._prepareItems(sheetData);
    const actorData = sheetData.actor;

    const disciplines = {
      abombwe: [],
      animalism: [],
      auspex: [],
      bardo: [],
      celerity: [],
      chimerstry:[],
      daimonion: [],
      dementation: [],
      dominate: [],
      flight: [],
      fortitude: [],
      melpominee: [],
      mytherceria: [],
      obeah: [],
      obfuscate: [],
      obtenebration: [],
      potence: [],
      presence: [],
      protean: [],
      quietus: [],
      sanguinus: [],
      serpentis: [],
      spiritus: [],
      temporis: [],
      thanatosis: [],
      valeren: [],
      vicissitude: [],
      visceratika: [],
      oblivion: [],
      rituals: [],
      ceremonies: [],
      thaumaturgy: [],
      necromancy: [],
    };

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i?.type === "power") {
        // Append to disciplines.
        if (i.data.discipline !== undefined && i.data.discipline !== '') {
//          console.log("that's the discipline", i.data.discipline);
          if(!disciplines[i.data.discipline]) {
            disciplines[i.data.discipline] = []
          }
          disciplines[i.data.discipline].push(i);
//          console.log(i.data.discipline, this.actor.data.data.disciplines[i.data.discipline], this.actor.data.data.disciplines[i.data.discipline] && !this.actor.data.data.disciplines[i.data.discipline].visible)
          if (this.actor.data.data.disciplines[i.data.discipline] && !this.actor.data.data.disciplines[i.data.discipline].visible) {
//            console.log("set it to visible", i.data.discipline)
            this.actor.update({
              [`data.disciplines.${i.data.discipline}.visible`]: true,
            });
          }
        }
      }
    }

    // Assign and return
    actorData.disciplines_list = disciplines;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Make Discipline visible or create custom ones
    html.find(".discipline-create").click(this._onShowDiscipline.bind(this));

    // Make Discipline hidden or delete custom ones
    html.find(".discipline-delete").click(this._deleteDisciplineButton.bind(this));

    // Rollable Vampire/Ghouls powers
    html.find(".power-rollable").click(this._onVampireRoll.bind(this));
  }

  /**
   * Handle making a discipline visible
   * @param {Event} event   The originating click event
   * @private
   */
  _onShowDiscipline(event) {
    event.preventDefault();
    let options = "";
    for (const [key, value] of Object.entries(
      this.actor.data.data.disciplines
    )) {
      let localizedName = game.i18n.localize(value.name)
      if(value.isCustom) {
        localizedName = value.name
      }
      options = options.concat(
        `<option value="${key}">${localizedName}</option>`
      );
    }
    options += `<option value="custom-discipline">${game.i18n.localize('VTM5E.CustomDiscipline')}</option>`

    const template = 'systems/wod20/templates/dialogs/add-discipline.html'

    let buttons = {};
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("VTM5E.Add"),
        callback: async (html) => {
          const discipline = html.find("#disciplineSelect")[0].value;
          if(discipline === 'custom-discipline') {
            //const createdItem = this._onDisciplineCreate(event)
            this._onCreateAndNameDiscipline(event)
            //console.log(createdItem)
            //console.log(this.actor)
            //console.log(this.actor.data)
          } else {
            this.actor.update({
              [`data.disciplines.${discipline}.visible`]: true,
            });
          }
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("VTM5E.Cancel"),
      },
    };

    super._onRenderDialog(template, {options}, game.i18n.localize("VTM5E.AddDiscipline"), buttons)    
  }

  /**
   * Name and create discipline
   * @param {Event} event   The originating click event
   * @private
   */
   _onCreateAndNameDiscipline(event) {
      event.preventDefault();
      const template = 'systems/wod20/templates/dialogs/name-discipline.html'

      let buttons = {};
      buttons = {
        draw: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("VTM5E.Add"),
          callback: async (html) => {
            const name = html.find("#nameDiscipline")[0].value;
            const createdItem = this._onDisciplineCreate(event, name)
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("VTM5E.Cancel"),
        },
      };

      super._onRenderDialog(template, {}, game.i18n.localize("VTM5E.SelectNameDiscipline"), buttons) 
   }

  _onDisciplineCreate(event, disciplineName) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = "customDiscipline"
    const sheettype = header.dataset.sheettype;
    // Grab any data associated with this control.

    // Initialize a default name.
    const name = disciplineName ? disciplineName : "New Discipline"
    // Prepare the item object.
    
    const data = {
      name: name,
      powers:[],
      value: 0,
      visible: true,
      isCustom: true
    };

    const itemData = {
      name: name,
      type: type,
      data: data,
      sheettype: sheettype
    };

    // Finally, create the item!
    // console.log(itemData)
    return this.actor.createEmbeddedDocuments('Item', [(itemData)]);
  }
  
  _deleteDisciplineButton(ev) {
    ev.preventDefault()
    const data = $(ev.currentTarget)[0].dataset
    if(data.custom && data.custom === 'true') {
      let stillHaveChildren = false
      const disciplineList = this.actor.disciplines_list
      if(data.customname && 
        disciplineList &&
        disciplineList[data.customname] && 
        disciplineList[data.customname].length > 0) {
        stillHaveChildren = true
      }
      if(!stillHaveChildren) {
        const li = $(ev.currentTarget).parents(".item-header")
        this.actor.deleteEmbeddedDocuments('Item', [(li.data("itemId"))])
        li.slideUp(200, () => this.render(false))
      } else {
        alert("You can't remove custom disciplines that still have powers on them")
      }
    } else {
      this.actor.update({
        [`data.disciplines.${data.discipline}.visible`]: false,
      })
    }
    this._render();
  }

  _onVampireRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const item = this.actor.items.get(dataset.id);
    let disciplineValue = 0
    if(this.actor.data.data.disciplines[item.data.data.discipline]) {
      disciplineValue = this.actor.data.data.disciplines[item.data.data.discipline].value
    } else {
      let i
      for(i = 0; i < this.actor.customDisciplines.length > 0; i++) {
        if(this.actor.customDisciplines[i]?.data?.name === item.data.data.discipline) {
          disciplineValue = this.actor.customDisciplines[i].data.value
          break
        }
      }
    }
    const dice1 =
      item.data.data.dice1 === "discipline"
        ? disciplineValue : item.data.data.dice1 === "thaumaturgy" ?
        this.actor.data.data.disciplines["thaumaturgy"]?.value !== undefined ? this.actor.data.data.disciplines["thaumaturgy"].value : 0
        : (this.actor.data.data.abilities[item.data.data.dice1]?.value !== undefined ? this.actor.data.data.abilities[item.data.data.dice1].value : 0) + 
        (this.actor.data.data.abilities[item.data.data.dice1]?.buff !== undefined ? this.actor.data.data.abilities[item.data.data.dice1].buff : 0)

    let dice2;
    if (item.data.data.dice2 === "discipline") {
      dice2 = disciplineValue
    } else if (item.data.data.dice1 === "thaumaturgy") {      
      dice2 = this.actor.data.data.disciplines["thaumaturgy"]?.value !== undefined ? this.actor.data.data.disciplines["thaumaturgy"].value : 0
    } else if (item.data.data.skill) {
      dice2 = (this.actor.data.data.skills[item.data.data.dice2]?.value !== undefined ? this.actor.data.data.skills[item.data.data.dice2].value : 0);
    } else {
      dice2 = (this.actor.data.data.abilities[item.data.data.dice2]?.value !== undefined ? this.actor.data.data.abilities[item.data.data.dice2].value : 0) + 
      (this.actor.data.data.abilities[item.data.data.dice2]?.buff !== undefined ? this.actor.data.data.abilities[item.data.data.dice2].buff : 0)
    }

    const dicePool = dice1 + dice2;
    const difficulty = item.data.data.difficulty ? parseInt(item.data.data.difficulty) : 6
    rollDice(dicePool, this.actor, `${item.data.name}`, Number.isNaN(difficulty) ? 6 : difficulty, false, this.actor.data.data.health.state, item.data.data.applywounds);
  }
}
