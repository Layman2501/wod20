/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log("Schrecknet : loading subroutines");
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/vtm5e-clone/templates/actor/parts/biography.html",
    "systems/vtm5e-clone/templates/actor/parts/disciplines.html",
    "systems/vtm5e-clone/templates/actor/parts/exp.html",
    "systems/vtm5e-clone/templates/actor/parts/features.html",
    "systems/vtm5e-clone/templates/actor/parts/frenzy.html",
    "systems/vtm5e-clone/templates/actor/parts/health.html",
    "systems/vtm5e-clone/templates/actor/parts/humanity.html",
    "systems/vtm5e-clone/templates/actor/parts/bloodpool.html",
    "systems/vtm5e-clone/templates/actor/parts/profile-img.html",
    "systems/vtm5e-clone/templates/actor/parts/other.html",
    "systems/vtm5e-clone/templates/actor/parts/rouse.html",
    "systems/vtm5e-clone/templates/actor/parts/stats.html",
    "systems/vtm5e-clone/templates/actor/parts/willpower.html",

    // Item Sheet Partials
    "systems/vtm5e-clone/templates/item/parts/skills.html",
    "systems/vtm5e-clone/templates/item/parts/disciplines.html",
    "systems/vtm5e-clone/templates/item/parts/attributes.html",
    "systems/vtm5e-clone/templates/item/parts/virtues.html",
  ];

  /* Load the template parts
     That function is part of foundry, not founding it here is normal
  */
  return loadTemplates(templatePaths); // eslint-disable-line no-undef
};
