/* global Die */

/**
 * Extend the basic Die to show custom vampire icons on a d10.
 * @extends {Die}
 */
export class VampireDie extends Die {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }

  /** @override */
  static DENOMINATION = "v";

  /** @override */
  static getResultLabel(result) {
    return {
      1: '<img src="systems/vtm5e-clone/assets/images/normal-fail.png" />',
      2: '<img src="systems/vtm5e-clone/assets/images/diceimg_2.png" />',
      3: '<img src="systems/vtm5e-clone/assets/images/normal-fail.png" />',
      4: '<img src="systems/vtm5e-clone/assets/images/normal-fail.png" />',
      5: '<img src="systems/vtm5e-clone/assets/images/diceimg_5.png" />',
      6: '<img src="systems/vtm5e-clone/assets/images/normal-success.png" />',
      7: '<img src="systems/vtm5e-clone/assets/images/normal-success.png" />',
      8: '<img src="systems/vtm5e-clone/assets/images/normal-success.png" />',
      9: '<img src="systems/vtm5e-clone/assets/images/normal-success.png" />',
      10: '<img src="systems/vtm5e-clone/assets/images/normal-crit.png" />',
    }[result];
  }
}

/**
 * Extend the basic Die to show custom vampire icons on a d10.
 * @extends {Die}
 */
export class VampireHungerDie extends Die {
  constructor(termData) {
    termData.faces = 10;
    super(termData);
  }

  /** @override */
  static DENOMINATION = "h";

  /** @override */
  static getResultLabel(result) {
    return {
      1: '<img src="systems/vtm5e-clone/assets/images/bestial-fail.png" />',
      2: '<img src="systems/vtm5e-clone/assets/images/red-fail.png" />',
      3: '<img src="systems/vtm5e-clone/assets/images/red-fail.png" />',
      4: '<img src="systems/vtm5e-clone/assets/images/red-fail.png" />',
      5: '<img src="systems/vtm5e-clone/assets/images/diceimg_5.png" />',
      6: '<img src="systems/vtm5e-clone/assets/images/red-success.png" />',
      7: '<img src="systems/vtm5e-clone/assets/images/red-success.png" />',
      8: '<img src="systems/vtm5e-clone/assets/images/red-success.png" />',
      9: '<img src="systems/vtm5e-clone/assets/images/red-success.png" />',
      10: '<img src="systems/vtm5e-clone/assets/images/red-crit.png" />',
    }[result];
  }
}
