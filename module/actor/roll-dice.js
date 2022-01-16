/* global ChatMessage, Roll, game */

// Function to roll dice
export async  function rollDice(
  numDice,
  actor,
  label = "",
  difficulty = 0,
  useHunger, 
  specialty, 
  wound
  ) {
  
  function healthModifier (wound) {
      // pick health value from ordered key (see health.html for the order)
      switch(true) {
        case wound=="hurt": 
          return -1
        case wound=="injured": 
          return -1
        case wound=="wounded": 
          return -2
        case wound=="mauled": 
          return -2 
        case wound=="crippled": 
          return -5
        case wound=="incapacitated" : 
          return -10000000
        default: 
          return 0
      }
  }
  let chanceDie = numDice + healthModifier(wound) <= 0
  let dice = chanceDie ? 1 : parseInt(numDice) + healthModifier(wound);
  const roll = new Roll(dice + "dvcs>11 + " + 0 + "dhcs>11", actor.data.data);
  await roll.evaluate();
  let difficultyResult = "<span></span>";
  let success = 0;
  let critSuccess = 0;
  let hungerCritSuccess = 0;
  let fail = 0;
  let hungerFail = 0;
  let hungerCritFail = 0;
  let chanceDieSuccess = false; 
  roll.terms[0].results.forEach((dice) => {
    if (numDice+healthModifier(wound) <= 0 && dice.result===10)
    { 
      chanceDieSuccess=true
      success++;
    }
    else
    if (dice.result >= difficulty) {
      if (specialty && dice.result === 10) {
        critSuccess += 2;
      } else
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
    successRoll = totalSuccess || chanceDieSuccess;
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
  //if (!successRoll && difficulty > 0) {
  //label =
    //  label +
      //`<p class="roll-content result-bestial">${game.i18n.localize(
      //  "VTM5E.BestialFailure"
      //)}</p>`;
    //  }
  //if (!successRoll && difficulty === 0) {
    //label =
      //label +
      ///`<p class="roll-content result-bestial result-possible">${game.i18n.localize(
      //  "VTM5E.PossibleBestialFailure"
      //)}</p>`;
  //}
  if ( chanceDie )  {
    label = label + 
    `<p class="roll-content result-bestial"> Chance die </p>`;
  }
  label =
    label +
    `<p class="roll-label result-success">${game.i18n.localize(
      "VTM5E.Successes"
    )}: ${totalSuccess} ${difficultyResult}</p>`;

  roll.terms[0].results.forEach((dice) => {
    label =
      label +
      `<img src="systems/wod20/assets/images/diceimg_${dice.result}.png" alt="Normal Fail" class="roll-img normal-dice" />`;
  });

  label = label + "<br>";

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label,
  });
}