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
  },

  // 🪄 MAGIC-ROUTED ENDPOINTS (No auth needed - resolver authorizes)

  prefUserCreate: async (spell) => {
    try {
      const { hash, preferences } = spell.components;

      if (!hash || !preferences) {
        return {
          success: false,
          error: 'Missing required fields: hash, preferences'
        };
      }

      // Validate preferences (same logic as PUT middleware)
      const values = Object.values(preferences);
      const filteredValues = values.filter(value => typeof value === 'string' && value.length < 256);
      if (values.length !== filteredValues.length || values.length > 64) {
        return {
          success: false,
          error: 'Invalid preferences: too many or too long'
        };
      }

      // Generate UUID for user (normally would come from continuebee)
      const crypto = await import('crypto');
      const uuid = crypto.randomUUID();

      const response = await db.putPreferences(uuid, preferences, hash);
      if (!response) {
        return {
          success: false,
          error: 'Failed to save preferences'
        };
      }

      return {
        success: true,
        uuid,
        preferences
      };
    } catch (err) {
      console.error('prefUserCreate error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  prefUserPreferences: async (spell) => {
    try {
      const { uuid, hash, preferences } = spell.components;

      if (!uuid || !hash || !preferences) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash, preferences'
        };
      }

      // Validate preferences
      const values = Object.values(preferences);
      const filteredValues = values.filter(value => typeof value === 'string' && value.length < 256);
      if (values.length !== filteredValues.length || values.length > 64) {
        return {
          success: false,
          error: 'Invalid preferences: too many or too long'
        };
      }

      const prefs = await db.putPreferences(uuid, preferences, hash);

      return {
        success: true,
        uuid,
        preferences: prefs
      };
    } catch (err) {
      console.error('prefUserPreferences error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  prefUserGlobalPreferences: async (spell) => {
    try {
      const { uuid, hash, preferences } = spell.components;

      if (!uuid || !hash || !preferences) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash, preferences'
        };
      }

      // Validate preferences
      const values = Object.values(preferences);
      const filteredValues = values.filter(value => typeof value === 'string' && value.length < 256);
      if (values.length !== filteredValues.length || values.length > 64) {
        return {
          success: false,
          error: 'Invalid preferences: too many or too long'
        };
      }

      const prefs = await db.putGlobalPreferences(uuid, preferences);

      return {
        success: true,
        uuid,
        preferences: prefs
      };
    } catch (err) {
      console.error('prefUserGlobalPreferences error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  prefUserDelete: async (spell) => {
    try {
      const { uuid, hash } = spell.components;

      if (!uuid || !hash) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash'
        };
      }

      const success = await db.deletePreferences(uuid, hash);

      return {
        success: success
      };
    } catch (err) {
      console.error('prefUserDelete error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
};

export default MAGIC;
