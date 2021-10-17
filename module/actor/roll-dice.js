/* global ChatMessage, Roll, game */

// Function to roll dice
export function rollDice(
  numDice,
  actor,
  label = "",
  difficulty = 0,
  useHunger, 
  ) {
  const dice = numDice;
  console.log(dice);
  const roll = new Roll(dice + "dvcs>11 + " + 0 + "dhcs>11", actor.data.data);
  const rollResult = roll.evaluate();
  console.log(rollResult.terms[0].results);
  let difficultyResult = "<span></span>";
  let success = 0;
  let critSuccess = 0;
  let hungerCritSuccess = 0;
  let fail = 0;
  let hungerFail = 0;
  let hungerCritFail = 0;
  
  rollResult.terms[0].results.forEach((dice) => {
    if (dice.result >= difficulty) {
      // if (dice.result === 10) {
      //   critSuccess += 2;
      // } else
      if (dice.result===1) {
        success==success-1
      }
      else {
        success++;
      }

    } else {
      fail++;
    }
  });

  const totalSuccess = critSuccess + success;

  let successRoll = false;
  if (difficulty !== 0) {
    successRoll = totalSuccess >= difficulty;
    difficultyResult = `( <span class="danger">${game.i18n.localize(
      "VTM5E.Fail"
    )}</span> )`;
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize(
        "VTM5E.Success"
      )}</span> )`;
    }
  }

  label = `<p class="roll-label uppercase">${label}</p>`;

  if (critSuccess > 0) {
    label =
      label +
      `<p class="roll-content result-critical">${game.i18n.localize(
        "VTM5E.CriticalSuccess"
      )}</p>`;
  }
  if (!successRoll && difficulty > 0) {
    label =
      label +
      `<p class="roll-content result-bestial">${game.i18n.localize(
        "VTM5E.BestialFailure"
      )}</p>`;
  }
  if (!successRoll && difficulty === 0) {
    label =
      label +
      `<p class="roll-content result-bestial result-possible">${game.i18n.localize(
        "VTM5E.PossibleBestialFailure"
      )}</p>`;
  }

  label =
    label +
    `<p class="roll-label result-success">${game.i18n.localize(
      "VTM5E.Successes"
    )}: ${totalSuccess} ${difficultyResult}</p>`;

  rollResult.terms[0].results.forEach((dice) => {
    label =
      label +
      `<img src="systems/vtm5e-clone/assets/images/diceimg_${dice.result}.png" alt="Normal Fail" class="roll-img normal-dice" />`;
  });

  label = label + "<br>";

  rollResult.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label,
  });
}
