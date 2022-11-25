/* global CONFIG, Handlebars, Hooks, Actors, ActorSheet, ChatMessage, Dialog, Items, ItemSheet, Macro, game, ui */

// Import Modules
import { preloadHandlebarsTemplates } from "./templates.js";
import { migrateWorld } from "./migration.js";
import { VampireActor } from "./actor/actor.js";
import { VampireItem } from "./item/item.js";
import { VampireItemSheet } from "./item/item-sheet.js";
import { VampireDie, VampireHungerDie } from "./dice/dice.js";
import { rollDice } from "./actor/roll-dice.js";
import { CoterieActorSheet } from "./actor/coterie-actor-sheet.js";
import { MortalActorSheet } from "./actor/mortal-actor-sheet.js";
import { GhoulActorSheet } from "./actor/ghoul-actor-sheet.js";
import { VampireActorSheet } from "./actor/vampire-actor-sheet.js";
import { VampireDarkAgesSheet } from "./actor/vampire-da-actor-sheet.js";

Hooks.once("init", async function () {
  console.log("Initializing Schrecknet...");

  game.settings.register("vtm5e", "worldVersion", {
    name: "World Version",
    hint: "Automatically upgrades data when the system.json is upgraded.",
    scope: "world",
    config: true,
    default: "1.5",
    type: String,
  });

  game.settings.register("wod20", "useDividedExp", {
      name: "Use divided experience fields",
      hint: "Enable this if you want to divide your experience assigned to different pools",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
  });

  game.vtm5e = {
    VampireActor,
    VampireItem,
    rollItemMacro,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10",
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = VampireActor;
  CONFIG.Item.documentClass = VampireItem;
  CONFIG.Dice.terms.v = VampireDie;
  CONFIG.Dice.terms.h = VampireHungerDie;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);

  Actors.registerSheet("vtm5e", VampireActorSheet, {
    label: "Vampire Sheet",
    types: ["vampire", "character"],
    makeDefault: true,
  });
  Actors.registerSheet("vtm5e", VampireDarkAgesSheet, {
    label: "Vampire Dark Ages Sheet",
    types: ["vampire-da", "character"],
    makeDefault: true,
  });
  Actors.registerSheet("vtm5e", GhoulActorSheet, {
    label: "Ghoul Sheet",
    types: ["ghoul"],
    makeDefault: true,
  });
  Actors.registerSheet("vtm5e", MortalActorSheet, {
    label: "Mortal Sheet",
    types: ["mortal"],
    makeDefault: true,
  });
  Actors.registerSheet("vtm5e", CoterieActorSheet, {
    label: "Coterie Sheet",
    types: ["coterie"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("vtm5e", VampireItemSheet, {
    label: "Item Sheet",
    makeDefault: true,
  });

  preloadHandlebarsTemplates();

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper("concat", function () {
    let outStr = "";
    for (const arg in arguments) {
      if (typeof arguments[arg] !== "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("or", function (bool1, bool2) {
    return bool1 || bool2;
  });

  Handlebars.registerHelper("and", function (bool1, bool2) {
    return bool1 && bool2;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("toUpperCaseFirstLetter", function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper('ge', function( a, b ){
    var next =  arguments[arguments.length-1];
    return (a >= b) ? next.fn(this) : next.inverse(this);
  });
  Handlebars.registerHelper('le', function( a, b ){
    var next =  arguments[arguments.length-1];
    return (a <= b) ? next.fn(this) : next.inverse(this);
  });
  Handlebars.registerHelper("setDividedExp", function(options) {
    options.data.root['isDividedExp'] =  game.settings.get('wod20', 'useDividedExp')
  });
  Handlebars.registerHelper("setVar", function(varName, varValue, options) {
    options.data.root[varName] = varValue;
  });
  
  Handlebars.registerHelper("setSkillsArray", function(varName, sheetsystem, skillsModern, skillsDa, skillsWild, options) {
    if(sheetsystem === 'darkages') {
      options.data.root[varName] = skillsDa;
    } else if(sheetsystem === 'wildwest') {
      options.data.root[varName] = skillsWild;
    } else {
      options.data.root[varName] = skillsModern;
    }
  });
  Handlebars.registerHelper("setDotsFromGen", function(varName, varValue, options) {
    var valString = varValue ? varValue.replace(/\D/g, '') : ''
    var val = parseInt(valString);
    options.data.root[varName] = Number.isNaN(val) || val <= 0 ? 5 : Math.max(Math.min(13 - val, 10), 5);
  });
  Handlebars.registerHelper("setBloodFromGen", function(varName, varValue, options) {
    var valString = varValue ? varValue.replace(/\D/g, '') : ''
    var gen = parseInt(valString);
    var bloodPool = 10
    switch(gen) {
      case 12:
        bloodPool = 11
        break;
      case 11:
        bloodPool = 12
        break;
      case 10:
        bloodPool = 13
        break;
      case 9:
        bloodPool = 14
        break;
      case 8:
        bloodPool = 15
        break;
      case 7:
        bloodPool = 20
        break;
      case 6:
        bloodPool = 30
        break;
      case 5:
        bloodPool = 40
        break;
      case 4:
        bloodPool = 50
        break;
      case 3:
      case 2:
      case 1:
        bloodPool = "??"
        break;
    }
    options.data.root[varName] = bloodPool;
  });
  Handlebars.registerHelper("setBloodPerTurnFromGen", function(varName, varValue, options) {
    var valString = varValue ? varValue.replace(/\D/g, '') : ''
    var gen = parseInt(valString);
    var blood = 1
    switch(gen) {
      case 9:
        blood = 2
        break;
      case 8:
        blood = 3
        break;
      case 7:
        blood = 4
        break;
      case 6:
        blood = 6
        break;
      case 5:
        blood = 8
        break;
      case 4:
        blood = 10
        break;
      case 3:
      case 2:
      case 1:
        blood = "??"
        break;
    }
    options.data.root[varName] = blood;
  });
  Handlebars.registerHelper("setGenLabelFromGen", function(varName, varValue, options) {
    var valString = varValue ? varValue.replace(/\D/g, '') : ''
    var gen = parseInt(valString);
    var genLabel = Number.isNaN(gen) ? '' : gen
    switch(gen) {
      case 1:
        genLabel += 'st'
        break;
      case 2:
        genLabel += 'nd'
        break;
      case 3:
        genLabel += 'rd'
        break;
      default:
        genLabel += Number.isNaN(gen) ? '' : 'th'
        break;
    }
    genLabel += Number.isNaN(gen) ? '' : ' Gen:'
    options.data.root[varName] = genLabel;
  });
  Handlebars.registerHelper("setAuraStrength", function(varName, varValue, options) {
    var road = parseInt(varValue);
    var auraVal = ""
    switch(road) {
      case 10:
        auraVal += "(-2)"
        break;
      case 9:
      case 8:
        auraVal += "(-1)"
        break;
      case 3:
      case 2:
        auraVal += '(+1)'
        break;
      case 1:
        auraVal += "(+2)"
        break;
      default:
        auraVal += "(±0)"
    }
    options.data.root[varName] = auraVal;
  });
  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  Handlebars.registerHelper("generateFeatureLabel", function (str) {
    return "VTM5E.".concat(capitalize(str));
  });

  Handlebars.registerHelper("generateSkillLabel", function (str) {
    return "VTM5E.".concat(
      str
        .split(" ")
        .flatMap((word) => capitalize(word))
        .join("")
    );
  });
  /*
  Handlebars.registerHelper('select', function(value, options) {
    // Create a select element 
    var select = document.createElement('select');

    // Populate it with the option HTML
    select.innerHTML = options.fn(this);

    // Set the value
    select.value = value;

    console.log(select.value)
    // Find the selected node, if it exists, add the selected attribute to it
    if (select.children[select.selectedIndex])
        select.children[select.selectedIndex].setAttribute('selected', 'selected');

    console.log(select.innerHTML)
    return select.innerHTML;
  });
  */
  Handlebars.registerHelper("getSkillValue", function(skillName, skillList, options) {
    var value = 0

    if(skillList && skillList[skillName]) {
      value = skillList[skillName].value
    }

    return value
  });
  
  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper(
    "frenzy",
    function (willpowerMax, willpowerAgg, willpowerSup, humanity) {
      return (
        willpowerMax - willpowerAgg - willpowerSup + Math.floor(humanity / 3)
      );
    }
  );

  Handlebars.registerHelper(
    "willpower",
    function (willpowerMax, willpowerAgg, willpowerSup) {
      return willpowerMax - willpowerAgg - willpowerSup;
    }
  );

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper("remorse", function (humanity, stain) {
    return 10 - humanity - stain;
  });

  Handlebars.registerHelper('if_eq', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
      const options = arguments[arguments.length - 1];
    const allEqual = args.every(function (expression) {
        return args[0] === expression;
      });
      
      return allEqual ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("numLoop", function (num, options) {
    let ret = "";

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i);
    }

    return ret;
  });
  Handlebars.registerHelper("minus", function (a, b) {
    return a - b;
  });
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("equal", function (a, b, label) {
    return a == b ? label : "";
  });
  Handlebars.registerHelper("notequal", function (a, b, label) {
    return a == b ? "" : label;
  });
  Handlebars.registerHelper("notequalarray", function (a, b, label) {
    var splitted = b.split(',')
    var foundMatch = false

    splitted.forEach((item) => {
      if(item === a) {
        foundMatch = true
      }
    })
    return foundMatch ? "" : label;
  });
  Handlebars.registerHelper("getDisciplineName", function (key, roll = false, disciplineList) {
    return disciplineList && disciplineList[key] ? disciplineList[key].name : key;
  });
});

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createVampireMacro(data, slot));
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem({ id: "vtm5e", name: "VtM5e" }, true);
  dice3d.addDicePreset({
    type: "dv",
    labels: [
      "systems/wod20/assets/images/normal-fail-dsn.png",
      "systems/wod20/assets/images/normal-fail-dsn.png",
      "systems/wod20/assets/images/normal-fail-dsn.png",
      "systems/wod20/assets/images/normal-fail-dsn.png",
      "systems/wod20/assets/images/normal-fail-dsn.png",
      "systems/wod20/assets/images/normal-success-dsn.png",
      "systems/wod20/assets/images/normal-success-dsn.png",
      "systems/wod20/assets/images/normal-success-dsn.png",
      "systems/wod20/assets/images/normal-success-dsn.png",
      "systems/wod20/assets/images/normal-crit-dsn.png",
    ],
    colorset: "black",
    fontScale: 0.5,
    system: "vtm5e",
  });
  dice3d.addColorset(
    {
      name: "hunger",
      description: "V5 Hunger Dice",
      category: "V5",
      foreground: "#fff",
      background: "#450000",
      texture: "none",
      edge: "#450000",
      material: "plastic",
      font: "Arial Black",
      fontScale: {
        d6: 1.1,
        df: 2.5,
      },
    },
    "default"
  );
  dice3d.addDicePreset({
    type: "dh",
    labels: [
      "systems/wod20/assets/images/bestial-fail-dsn.png",
      "systems/wod20/assets/images/red-fail-dsn.png",
      "systems/wod20/assets/images/red-fail-dsn.png",
      "systems/wod20/assets/images/red-fail-dsn.png",
      "systems/wod20/assets/images/red-fail-dsn.png",
      "systems/wod20/assets/images/red-success-dsn.png",
      "systems/wod20/assets/images/red-success-dsn.png",
      "systems/wod20/assets/images/red-success-dsn.png",
      "systems/wod20/assets/images/red-success-dsn.png",
      "systems/wod20/assets/images/red-crit-dsn.png",
    ],
    colorset: "hunger",
    system: "vtm5e",
  });
});

/* -------------------------------------------- */
/*  Add willpower reroll                        */
/* -------------------------------------------- */

// Create context menu option on selection
// TODO: Add condition that it only shows up on willpower-able rolls
Hooks.on("getChatLogEntryContext", function (html, options) {
  options.push({
    name: game.i18n.localize("VTM5E.WillpowerReroll"),
    icon: '<i class="fas fa-redo"></i>',
    condition: (li) => {
      // Only show this context menu if the person is GM or author of the message
      const message = game.messages.get(li.attr("data-message-id"));

      return game.user.isGM || message.isAuthor;
    },
    callback: (li) => willpowerReroll(li),
  });
});

Hooks.once("ready", function () {
  migrateWorld();
});

async function willpowerReroll(roll) {
  const dice = roll.find(".normal-dice");
  const diceRolls = [];

  // Go through the message's dice and add them to the diceRolls array
  Object.keys(dice).forEach(function (i) {
    // This for some reason returns "prevObject" and "length"
    // Fixes will be attempted, but for now solved by just ensuring the index is a number
    if (i > -1) {
      diceRolls.push(`<div class="die">${dice[i].outerHTML}</div>`);
    }
  });

  // Create dialog for rerolling dice
  const template = `
    <form>
        <div class="window-content">
            <label><b>Select dice to reroll (Max 3)</b></label>
            <hr>
            <span class="dice-tooltip">
              <div class="dice-rolls willpowerReroll flexrow">
                ${diceRolls.reverse().join("")}
              </div>
            </span>
        </div>
    </form>`;

  let buttons = {};
  buttons = {
    draw: {
      icon: '<i class="fas fa-check"></i>',
      label: "Reroll",
      callback: (roll) => rerollDie(roll),
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
    },
  };

  new Dialog({
    title: "Willpower Reroll",
    content: template,
    buttons: buttons,
    render: function () {
      $(".willpowerReroll .die").on("click", dieSelect);
    },
    default: "draw",
  }).render(true);
}

// Handles selecting and de-selecting the die
function dieSelect() {
  // If the die isn't already selected and there aren't 3 already selected, add selected to the die
  if (
    !$(this).hasClass("selected") &&
    $(".willpowerReroll .selected").length < 3
  ) {
    $(this).addClass("selected");
  } else {
    $(this).removeClass("selected");
  }
}

// Handles rerolling the number of dice selected
// TODO: Make this function duplicate/replace the previous roll with the new results
// TODO: Make this function able to tick superficial willpower damage
// For now this works well enough as "roll three new dice"
function rerollDie(actor) {
  const diceSelected = $(".willpowerReroll .selected").length;

  // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
  if (diceSelected > 0 && diceSelected < 4) {
    rollDice(diceSelected, actor, "Willpower Reroll", 6, false, false);
  }
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createVampireMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data))
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  const item = data.data;

  // Create the macro command
  const command = `game.vtm5e.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "vtm5e.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );

  // Trigger the item roll
  return item.roll();
}
