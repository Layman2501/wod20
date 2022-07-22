/* global Actor, game, renderTemplate, Dialog, FormDataExtended, foundry */

/**
 * Extend the base Actor type by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
const WoundLevels = [
  "Healthy",
  "Bruised",
  "Hurt",
  "Injured",
  "Wounded",
  "Mauled",
  "Crippled",
  "Incapacitated",
]

const WoundModifierText = [
  "",
  "",
  " (-1)",
  " (-1)",
  " (-2)",
  " (-2)",
  " (-5)",
  "",
]

export class VampireActor extends Actor {

  prepareData () {
    super.prepareData()

    const actorData = this.data.data

    if(actorData.health) {
      // Perform migration to new wound format
      if (actorData.health.max === 5) {
        actorData.health.max = 7
      }
  
      const allDamage = actorData.health.superficial + actorData.health.aggravated + actorData.health.lethal;
      const dmgSum = Math.max(allDamage - (actorData.health.max - 7), 0)
      // console.log(dmgSum, WoundLevels[dmgSum])
      if (dmgSum === 0 && allDamage !== 0) {
        /* Forced bruised */
        actorData.health.state = WoundLevels[1]
      } else {
        /* "Outside Bounds" should never happen */
        actorData.health.state = WoundLevels[dmgSum] ? WoundLevels[dmgSum] + WoundModifierText[dmgSum] : 'Outside Bounds'
      }
    }
  }

  /**
     * Prepare Character type specific data
     */
  // _prepareCharacterData(actorData) {
  //     const data = actorData.data;

  //     // Make modifications to data here. For example:

  //     // Loop through ability scores, and add their modifiers to our sheet output.
  //     for (let [key, ability] of Object.entries(data.abilities)) {
  //         // Calculate the modifier using d20 rules.
  //         ability.mod = Math.floor((ability.value - 10) / 2);
  //     }
  // }

  /**
   * Redefines the create "actor" type with translations :)
   * @param {object} data         Initial data with which to populate the creation form
   * @param {object} [options]    Positioning and sizing options for the resulting dialog
   * @return {Promise<Document>}  A Promise which resolves to the created Document
   * @memberof ClientDocumentMixin
   */
  static async createDialog (data = {}, options = {}) {
    // Collect data
    const documentName = this.metadata.name
    console.log("game.system.documentTypes", game.system.documentTypes)
    console.log('documentName', documentName)
    const types = game.system.documentTypes[documentName]
    const folders = game.folders.filter(f => (f.data.type === documentName) && f.displayed)
    const label = game.i18n.localize(this.metadata.label)
    const title = game.i18n.format('DOCUMENT.Create', { type: label })

    const index = types.indexOf('character')
    if (index !== -1) {
      types.splice(index, 1)
    }

    // Render the type creation form
    const html = await renderTemplate('templates/sidebar/document-create.html', {
      name: data.name || game.i18n.format('DOCUMENT.New', { type: label }),
      folder: data.folder,
      folders: folders,
      hasFolders: folders.length > 1,
      type: data.type || types[0],
      types: types.reduce((obj, t) => {
        const VTM5ELabel = 'VTM5E.' + t[0].toUpperCase() + t.substring(1)
        obj[t] = game.i18n.has(VTM5ELabel) ? game.i18n.localize(VTM5ELabel) : t
        return obj
      }, {}),
      hasTypes: types.length > 1
    })

    // Render the confirmation dialog window
    return Dialog.prompt({
      title: title,
      content: html,
      label: title,
      callback: html => {
        const form = html[0].querySelector('form')
        const fd = new FormDataExtended(form)
        data = foundry.utils.mergeObject(data, fd.toObject())
        if (!data.folder) delete data.folder
        if (types.length === 1) data.type = types[0]
        return this.create(data, { renderSheet: true })
      },
      rejectClose: false,
      options: options
    })
  }
}
