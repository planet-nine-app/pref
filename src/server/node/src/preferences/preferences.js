import db from '../persistence/db.js';

const prefs = {
  getPreferences: async (uuid, hash) => {
    const preferences = await db.getPreferences(uuid, hash);
    return preferences;
  },

  putPreferences: async (uuid, newPreferences, hash) => {
    const resp = await db.putPreferences(uuid, newPreferences, hash);

    return resp;
  },

  getGlobalPreferences: async (uuid) => {
    const preferences = await db.getGlobalPreferences(uuid);
    return preferences;
  },

  putGlobalPreferences: async (uuid, newPreferences) => {
    const resp = await db.putGlobalPreferences(uuid, newPreferences);

    return resp;
  },

  deletePreferences: async (uuid, hash) => {
    return (await db.deletePreferences(uuid, hash));
  }
};

export default prefs;
