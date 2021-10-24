/* global ChatMessage, Roll, game */
function healthModifier (healthGeneral) {
  // pick health value from ordered key (see health.html for the order)
  let health = healthGeneral.lethal!==0 ?  healthGeneral.lethal : healthGeneral.aggravated!==0 ? healthGeneral.aggravated : healthGeneral.superficial
  console.log("current health value", health)
  switch(true) {
    case health==2: 
      return -1
    case health==3: 
      return -1
    case health==4: 
      return -2
    case health==5: 
      return -2 
    case health==6: 
      return -5
    case health>=6:
      return -5
    default: 
      return 0
  }
}
// Function to roll dice
export function rollDice(
  numDice,
  actor,
  label = "",
  difficulty = 0,
  useHunger, 
  specialty
  ) {
  
  const health = Math.max(...Object.values(actor.data.data.health).splice(0,3))
  let chanceDie = numDice + healthModifier(actor.data.data.health) <= 0
  let dice = chanceDie ? 1 : numDice + healthModifier(actor.data.data.health);
  if (chanceDie) difficulty=10;
  console.log("actor", actor.data.data.health)
  console.log("health", health)
  console.log("numDice", numDice)
  console.log("difficulty", difficulty)
  console.log("health modifier", healthModifier(health))
  
  const roll = new Roll(dice + "dvcs>11 + " + 0 + "dhcs>11", actor.data.data);
  const rollResult = roll.evaluate();
  let difficultyResult = "<span></span>";
  let success = 0;
  let critSuccess = 0;
  let hungerCritSuccess = 0;
  let fail = 0;
  let hungerFail = 0;
  let hungerCritFail = 0;
  let chanceDieSuccess = false; 
  rollResult.terms[0].results.forEach((dice) => {
    if (numDice+healthModifier(health) <= 0 && dice.result===10)
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
    successRoll = totalSuccess >= difficulty || chanceDieSuccess;

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
  if ( chanceDie )  {
    label = label + 
    `<p class="roll-content result-bestial"> Chance die </p>`;
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
