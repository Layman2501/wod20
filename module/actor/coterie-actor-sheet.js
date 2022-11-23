/* global DEFAULT_TOKEN, ActorSheet, game, mergeObject, duplicate, renderTemplate, ChatMessage */

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { skillsModern, skillsDa, skillsWild} from "../../assets/skills/skills.js";

export class CoterieActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vtm5e", "sheet", "actor", "coterie"],
      template: "systems/wod20/templates/actor/coterie-sheet.html",
      width: 800,
      height: 700,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  constructor(actor, options) {
    super(actor, options);
    this.locked = true;
    this.isCharacter = false;
  }

  /** @override */
  get template() {
    if (!game.user.isGM && this.actor.limited)
      return "systems/wod20/templates/actor/limited-sheet.html";
    return "systems/wod20/templates/actor/coterie-sheet.html";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.locked = this.locked;
    data.isCharacter = this.isCharacter;
    data.sheetType = `${game.i18n.localize("VTM5E.Coterie")}`;

    data.dtypes = ["String", "Number", "Boolean"];
    data.skillsModern = skillsModern
    data.skillsDa = skillsDa
    data.skillsWild = skillsWild

    // Prepare items.
    if (this.actor.type === "coterie") {
      this._prepareItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Disciplines for Vampire & Ghoul sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(sheetData) {
    const actorData = sheetData.actor;

    const features = {
      background: [],
      merit: [],
      flaw: [],
    };

    const gear = [];

    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === "item") {
        // Append to gear.
        gear.push(i);
      } else if (i.type === "feature") {
        // Append to features.
        features[i.data.featuretype].push(i);
      }
    }

    actorData.gear = gear;
    actorData.features = features;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    this._setupDotCounters(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // lock button
    html.find(".lock-btn").click(this._onToggleLocked.bind(this));

    html.find(".sheet-system").select(this._onSheetSystemSelect.bind(this))

    // ressource dots
    html
      .find(".resource-value > .resource-value-step")
      .click(this._onDotCounterChange.bind(this));
    html
      .find(".resource-value > .resource-value-empty")
      .click(this._onDotCounterEmpty.bind(this));

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Send Inventory Item to Chat
    html.find(".item-chat").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getEmbeddedDocument('Item',li.data("itemId"));
      renderTemplate(
        "systems/wod20/templates/actor/parts/chat-message.html",
        {
          name: item.data.name,
          img: item.data.img,
          description: item.data.data.description,
        }
      ).then((html) => {
        ChatMessage.create({
          content: html,
        });
      });
    });

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getEmbeddedDocument('Item', li.data("itemId"));

      item.skillsArray = this._getSkillArray() 
      item.disciplines = this._getDisciplines() 
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments('Item', [(li.data("itemId"))]);
      li.slideUp(200, () => this.render(false));
    });

    // Collapsible Features and Powers
    const coll = document.getElementsByClassName("collapsible");
    let i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        const content = this.parentElement.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
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

  _getDisciplines() {
    let customDisciplines = {}
    let i
    for(i = 0; i < this.actor.customDisciplines.length; i++) {
      if( this.actor.customDisciplines[i]) {
        customDisciplines[this.actor.customDisciplines[i].name] = this.actor.customDisciplines[i].data
      }
    }
    return {...this.actor.system.disciplines, ...customDisciplines}
  }

  _setupDotCounters(html) {
    html.find(".resource-value").each(function () {
      const value = Number(this.dataset.value);
      $(this)
        .find(".resource-value-step")
        .each(function (i) {
          if (i + 1 <= value) {
            $(this).addClass("active");
          }
        });
    });
    html.find(".resource-value-static").each(function () {
      const value = Number(this.dataset.value);
      $(this)
        .find(".resource-value-static-step")
        .each(function (i) {
          if (i + 1 <= value) {
            $(this).addClass("active");
          }
        });
    });
  }

  _onToggleLocked(event) {
    event.preventDefault();
    this.locked = !this.locked;
    this._render();
  }

  _onSheetSystemSelect(event) {
    event.preventDefault();
    this._render();
  }

  _onDotCounterChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const index = Number(dataset.index);
    const parent = $(element.parentNode);
    const fieldStrings = parent[0].dataset.name;
    const fields = fieldStrings.split(".");
    const steps = parent.find(".resource-value-step");

    if (this.locked && !parent.has(".hunger-value").length) return;

    if (index < 0 || index > steps.length) {
      return;
    }

    steps.removeClass("active");
    steps.each(function (i) {
      if (i <= index) {
        $(this).addClass("active");
      }
    });
    this._assignToActorField(fields, index + 1);
  }

  _onDotCounterEmpty(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const parent = $(element.parentNode);
    const fieldStrings = parent[0].dataset.name;
    const fields = fieldStrings.split(".");
    const steps = parent.find(".resource-value-empty");

    if (this.locked && !parent.has(".hunger-value").length) return;

    steps.removeClass("active");
    this._assignToActorField(fields, 0);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @protected
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    const sheettype = header.dataset.sheettype;
    // Grab any data associated with this control.

    const data = duplicate(header.dataset);
    if (type === "specialty") {
      data.skill = "alertness";
    }
    if (type === "boon") {
      data.boontype = "Trivial";
    }
    if (type === "customRoll") {
      data.dice1 = "strength";
      data.dice2 = "athletics";
    }
  
    // Initialize a default name.
    const name = header.dataset.customname ? header.dataset.customname : this.getItemDefaultName(type, data)
    // console.log(header, type, sheettype, data, name)
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
      sheettype: sheettype
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type;

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments('Item', [(itemData)]);
  }

  getItemDefaultName(type, data) {
    if (type === "feature") {
      return `${game.i18n.localize("VTM5E." + data.featuretype.capitalize())}`;
    }
    if (type === "power") {
      return `${game.i18n.localize("VTM5E." + data.discipline.capitalize())}`;
    }
    return `${game.i18n.localize("VTM5E." + type.capitalize())}`;
  }

  // There's gotta be a better way to do this but for the life of me I can't figure it out
  _assignToActorField(fields, value) {
    const actorData = duplicate(this.actor);
    const newFieldNames = [];
    fields.forEach((field) =>  {
      newFieldNames.push(field === 'data' ? 'system' : field)
    })

    fields = newFieldNames;

    // update actor owned items
    if (fields.length === 2 && fields[0] === "items") {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.system.points = value;
          break;
        }
      }
    } else if (fields.length === 3 && fields[0] === "items" && fields[1] === "disciplines") {
      for (const i of actorData.items) {
        if (fields[2] === i._id) {
          i.data.value = value;
          break;
        }
      }
    } else if (fields.length >= 2 && fields[1] === "skills") {
      let foundSkill = false
      for (const skillKey of Object.keys(actorData.system.skills)) {
        if (fields[2] === skillKey) {
          actorData.system.skills[skillKey].value = value;
          foundSkill = true
          break;
        }
      }
      if(!foundSkill) {
        actorData.system.skills[fields[2]] = this._getNewSkillDefinition(fields[2], value)
      }
    } else {
      const lastField = fields.pop();
      fields.reduce((data, field) => data[field], actorData)[lastField] = value;
    }
    this.actor.update(actorData);
  }

  _getNewSkillDefinition(skillName, skillValue) {
    let localization = ''
    skillsModern.forEach((skill) => {
      if(skill && skill.name === skillName) {
        localization = skill.loc
      }
    })

    if(localization === '') {
      skillsDa.forEach((skill) => {
        if(skill && skill.name === skillName) {
          localization = skill.loc
        }
      })    
      
      if(localization === '') {
        skillsWild.forEach((skill) => {
          if(skill && skill.name === skillName) {
            localization = skill.loc
          }
        })
      }
    }

    return {value: skillValue, name: localization}
  }

  _onRenderDialog(template, extraFields, title, buttons) {
    renderTemplate(template, extraFields).then((content) => {
      new Dialog({
        title:title,
        content,
        buttons: buttons,
        default: 'draw'
      }).render(true)
    })
  }
}
