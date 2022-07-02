/* global ChatMessage, Roll, game */

// Function to roll dice
export async function rollDice (
  numDice,
  actor,
  label = '',
  difficulty = 0,
  specialty,
  useWound,
  wound
) {
  console.log(wound)
  function healthModifier (useWound, wound) {
    if (!useWound) {
      return 0
    }
    // pick health value from ordered key (see health.html for the order)
    if (wound === 'hurt') {
      return -1
    } else if (wound === 'injured') {
      return -1
    } else if (wound === 'wounded') {
      return -2
    } else if (wound === 'mauled') {
      return -2
    } else if (wound === 'crippled') {
      return -5
    } else if (wound === 'incapacitated') {
      return -10000000
    } else {
      return 0
    }
  }
  const chanceDie = numDice + healthModifier(useWound, wound) <= 0
  const dice = chanceDie ? 1 : parseInt(numDice) + healthModifier(useWound, wound)
  const roll = new Roll(dice + 'dvcs>11 + ' + 0 + 'dhcs>11', actor.data.data)
  await roll.evaluate()
  let difficultyResult = '<span></span>'
  let success = 0
  let chanceDieSuccess = false
  console.log(dice, numDice, healthModifier(wound))
  roll.terms[0].results.forEach((dice) => {
    if (numDice + healthModifier(wound) <= 0 && dice.result === 10) {
      chanceDieSuccess = true
      success++
    } else {
      if (dice.result >= difficulty && dice.result > 1) {
        if (specialty && dice.result === 10) {
          success += 2
        } else {
          success++
        }
      } else {
        if (dice.result === 1) {
          success--
        }
      }
    }
  })

  let successRoll = false
  if (difficulty !== 0) {
    successRoll = (success > 0) || chanceDieSuccess
    difficultyResult = `( <span class="danger">${game.i18n.localize(
      'VTM5E.Fail'
    )}</span> )`
    if (successRoll) {
      difficultyResult = `( <span class="success">${game.i18n.localize(
        'VTM5E.Success'
      )}</span> )`
    }
  }

  label = `<p class="roll-label uppercase">${label}</p>`

  if (chanceDie) {
    label = label +
    '<p class="roll-content result-bestial"> Chance die </p>'
  }
  label =
    label +
    `<p class="roll-label result-success">${game.i18n.localize(
      'VTM5E.Successes'
    )}: ${success} ${difficultyResult}</p>`

  roll.terms[0].results.forEach((dice) => {
    label =
      label +
      `<img src="systems/wod20/assets/images/diceimg_${dice.result}.png" alt="Normal Fail" class="roll-img normal-dice" />`
  })

  label = label + '<br>'

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: label,
  })
}
