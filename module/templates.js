/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log('Schrecknet : loading subroutines')
  // Define template paths to load
  
  const templatePaths = [
    // Actor Sheet Partials
    'systems/wod20/templates/actor/parts/biography.html',
    'systems/wod20/templates/actor/parts/disciplines.html',
    'systems/wod20/templates/actor/parts/exp.html',
    'systems/wod20/templates/actor/parts/dividedExp.html',
    'systems/wod20/templates/actor/parts/features.html',
    'systems/wod20/templates/actor/parts/frenzy.html',
    'systems/wod20/templates/actor/parts/health.html',
    'systems/wod20/templates/actor/parts/humanity.html',
    'systems/wod20/templates/actor/parts/bloodpool.html',
    'systems/wod20/templates/actor/parts/profile-img.html',
    'systems/wod20/templates/actor/parts/other.html',
    'systems/wod20/templates/actor/parts/rotschreck.html',
    'systems/wod20/templates/actor/parts/stats.html',
    'systems/wod20/templates/actor/parts/willpower.html',
    'systems/wod20/templates/actor/parts/combat.html',
    'systems/wod20/templates/actor/parts/frenzy-rot-combined.html',
    'systems/wod20/templates/actor/parts/soak-init-combined.html',

    // Item Sheet Partials
    'systems/wod20/templates/item/parts/skills.html',
    'systems/wod20/templates/item/parts/skills-da.html',
    'systems/wod20/templates/item/parts/skills-wild.html',
    'systems/wod20/templates/item/parts/disciplines.html',
    'systems/wod20/templates/item/parts/attributes.html',
    'systems/wod20/templates/item/parts/virtues.html',

    // Dialogs
    'systems/wod20/templates/dialogs/custom-roll.html',
    'systems/wod20/templates/dialogs/damage-roll.html',
    'systems/wod20/templates/dialogs/init-roll.html',
    'systems/wod20/templates/dialogs/soak-roll.html',
    'systems/wod20/templates/dialogs/weapon-roll.html'
  ]

  /* Load the template parts
     That function is part of foundry, not founding it here is normal
  */
  return loadTemplates(templatePaths) // eslint-disable-line no-undef
}
