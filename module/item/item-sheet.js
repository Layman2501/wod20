/* global ItemSheet, mergeObject */

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class VampireItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vtm5e", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/wod20/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable Checkbox Handler.
    const rollCheckbox = document.querySelector(
      'input[type="checkbox"][name="data.rollable"]'
    );

    if (rollCheckbox != null) {
      rollCheckbox.addEventListener("change", () => {
        if (rollCheckbox.checked) {
          this.item.update({ "data.rollable": true });
        } else {
          this.item.update({ "data.rollable": false });
        }
      });
    }

    // Skill Checkbox Handler.
    const skillCheckbox = document.querySelector(
      'input[type="checkbox"][name="data.skill"]'
    );

    if (skillCheckbox != null) {
      skillCheckbox.addEventListener("change", () => {
        if (skillCheckbox.checked) {
          this.item.update({ "data.skill": true });
        } else {
          this.item.update({ "data.skill": false });
        }
      });
    }

    // Apply Wounds Checkbox Handler.
    const applyWoundsCheckbox = document.querySelector(
      'input[type="checkbox"][name="data.applywounds"]'
    );

    if (applyWoundsCheckbox != null) {
      applyWoundsCheckbox.addEventListener("change", () => {
        if (applyWoundsCheckbox.checked) {
          this.item.update({ "data.applywounds": true });
        } else {
          this.item.update({ "data.applywounds": false });
        }
      });
    }

    // Skill Checkbox Handler.
    const useSkillCheckbox = document.querySelector(
      'input[type="checkbox"][name="data.useskills"]'
    );

    if (useSkillCheckbox != null) {
      useSkillCheckbox.addEventListener("change", () => {
        if (useSkillCheckbox.checked) {
          this.item.update({ "data.useskills": true });
        } else {
          this.item.update({ "data.useskills": false });
        }
      });
    }

    // Skill Checkbox Handler.
    const useAttributesCheckbox = document.querySelector(
      'input[type="checkbox"][name="data.useattributes"]'
    );

    if (useAttributesCheckbox != null) {
      useAttributesCheckbox.addEventListener("change", () => {
        if (useAttributesCheckbox.checked) {
          this.item.update({ "data.useattributes": true });
        } else {
          this.item.update({ "data.useattributes": false });
        }
      });
    }

    // Difficulty Input Handler.
    const difficultyInput = document.querySelector(
      'input[type="number"][name="data.difficulty"]'
    );

    if (difficultyInput != null) {
      difficultyInput.addEventListener("change", () => {
        this.item.update({ "data.difficulty": difficultyInput.value });
      });
    }
  }
}
