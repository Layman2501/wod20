/* global ChatMessage, Roll, game */

// Function to roll dice
export async function rollDice (
  numDice,
  actor,
  label = '',
  difficulty = 6,
  specialty,
  wound,
  applyWounds,
  specialtyLabel,
) {
  // console.log(wound, applyWounds)
  function healthModifier (wound) {
    if(applyWounds) {   
      if(wound.includes('-1'))
        return -1
      else if(wound.includes('-2'))
        return -2
      else if(wound.includes('-5'))
        return -5
      else if(wound.includes('Incapacitated'))
        return -10000
    }

    return 0
  }
  const chanceDie = numDice + healthModifier(wound) <= 0
  const dice = chanceDie ? 1 : parseInt(numDice) + healthModifier(wound)
  const roll = new Roll(dice + 'dvcs>11 + ' + 0 + 'dhcs>11', actor.data.data)
  await roll.evaluate()
  let difficultyResult = '<span></span>'
  let success = 0
  let hadASuccess = false
  let hadAOne = false
  let chanceDieSuccess = false
  roll.terms[0].results.forEach((dice) => {
    if (numDice + healthModifier(wound) <= 0 && dice.result === 10) {
      chanceDieSuccess = true
      success++
      hadASuccess = true
    } else {
      if (dice.result >= difficulty && dice.result > 1) {
        if (specialty && dice.result === 10) {
          success += 2
        } else {
          success++
        }
        hadASuccess = true
      } else {
        if (dice.result === 1) {
          success--
          hadAOne = true
        }
      }
    }
  })

  let successRoll = false
  if (difficulty !== 0) {
    successRoll = success > 0 || chanceDieSuccess
    difficultyResult = `( <span class="danger">${game.i18n.localize(
      'VTM5E.Fail'
    )}</span> )`
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize(
        'VTM5E.Success'
      )}</span> )`
    } else if(!hadASuccess && hadAOne) {
      difficultyResult = `( <span class="danger">${game.i18n.localize(
        'VTM5E.BestialFailure'
      )}</span> )`
    }
  }

  label = `<p class="roll-label uppercase">${label}</p>`

  if(specialtyLabel && specialtyLabel !== '') {
    label += `<p class="roll-speciality-label ${specialty ? 'roll-speciality-label-applied' : ''}">${specialtyLabel}</p>`
  }

  if (chanceDie) {
    label +=
    '<p class="roll-content result-bestial"> Chance die </p>'
  }
  
  label += _getRollContentStyle(game.i18n.localize('VTM5E.Successes'), success + ' ' + difficultyResult, roll)

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label,
  })
}

// Function to roll dice
export async function rollInit (
  modifier,
  actor,
) {

  const dice = 1
  const roll = new Roll(dice + 'dvcs>11 + ' + 0 + 'dhcs>11', actor.data.data)
  await roll.evaluate()

  let finalValue = modifier
  roll.terms[0].results.forEach((dice) => {
    finalValue += dice.result
  })

  let label = _getRollContentStyle(game.i18n.localize('VTM5E.Initiative'), finalValue, roll)

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label,
  })
  
  let foundToken = false
  let foundEncounter = true
  let rolledInitiative = false;

  let token = await canvas.tokens.placeables.find(t => t.data.actorId === actor.id);
  if (token) {
   foundToken = true
  }

  if (game.combat == null) {
    foundEncounter = false
  }

  if (foundToken && foundEncounter) {
    if (!_inTurn(token)) {
      await token.toggleCombat();
    }
    if (token.combatant && token.combatant.data.initiative == undefined) {
      await token.combatant.update({initiative: finalValue});
      rolledInitiative = true;
    }
  }		
}

function _getRollContentStyle (header, finalValue, roll) {
  let label = `<p class="roll-label result-success">${header}: ${finalValue}</p>`

  label +=  `<div class="roll-group">`
  roll.terms[0].results.forEach((dice) => {
    label +=
      `<div class="roll-die">
        <img src="icons/svg/d10-grey.svg" alt="none" class="roll-die-background" />
        <img src="systems/wod20/assets/images/diceimg_${dice.result}.png" alt="Normal Fail" class="roll-img normal-dice" />
      </div>`
  })

  label +=  `</div>`

  return label
}

function _inTurn(token) {
  for (let count = 0; count < game.combat.combatants.size; count++) {
    if (token.id == game.combat.combatants.contents[count].token.id) {
      return true;
    }
  }

  return false;
}