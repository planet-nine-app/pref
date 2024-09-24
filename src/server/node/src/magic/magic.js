import sessionless from 'sessionless-node';
import db from '../persistence/db.js';

sessionless.generateKeys(() => {}, db.getKeys);
    
const fountURL = 'http://localhost:3006/';

const MAGIC = {
  joinup: async (spell) => {
    const gateway = await MAGIC.gatewayForSpell(spell.spellName);
    spell.gateways.push(gateway);
    const spellName = spell.spell;

    const pref = await db.getPreferences('pref', 'pref');
    const spellbooks = pref.spellbooks;
    const spellbook = spellbooks.filter(spellbook => spellbook[spellName]).pop();
    if(!spellbook) {
      throw new Error('spellbook not found');
    }

    const spellEntry = spellbook[spellName];
    const currentIndex = spellEntry.destinations.indexOf(spellEntry.destinations.find(($) => $.stopName === 'pref'));
    const nextDestination = spellEntry.destinations[currentIndex + 1].stopURL + spellName;

    const res = await MAGIC.forwardSpell(spell, nextDestination);
    const body = await res.json();

    if(!body.success) {
      return body;
    }

    if(!body.uuids) {
      body.uuids = [];
    }
    body.uuids.push({
      service: 'pref',
      uuid: 'continuebee'
    });

    return body;
  },

  linkup: async (spell) => {
    const gateway = await MAGIC.gatewayForSpell(spell.spellName);
    spell.gateways.push(gateway);

    const res = await MAGIC.forwardSpell(spell, fountURL);
    const body = await res.json();
    return body;
  },

  gatewayForSpell: async (spellName) => {
    const pref = await db.getPreferences('pref', 'pref');
    const gateway = {
      timestamp: new Date().getTime() + '',
      uuid: pref.fountUUID, 
      minimumCost: 20,
      ordinal: pref.ordinal
    };      

    const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

    gateway.signature = await sessionless.sign(message);

    return gateway;
  },

  forwardSpell: async (spell, destination) => {
    return await fetch(destination, {
      method: 'post',
      body: JSON.stringify(spell),
      headers: {'Content-Type': 'application/json'}
    });
  }
};

export default MAGIC;
