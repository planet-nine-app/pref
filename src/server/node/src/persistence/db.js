import config from '../../config/local.js';
import { createClient } from 'redis';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getPreferences: async (uuid, hash) => {
    const preferences = await client.get(`preferences:${uuid}:${hash}`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putPreferences: async (uuid, preferences, hash) => {
    await client.set(`preferences:${uuid}:${hash}`, JSON.stringify(preferences));
    return uuid;
  },

  getGlobalPreferences: async (uuid, hash) => {
    const preferences = await client.get(`preferences:${uuid}:Earth`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putGlobalPreferences: async (uuid, preferences, hash) => {
    await client.set(`preferences:${uuid}:Earth`, JSON.stringify(preferences));
    return uuid;
  },

  deletePreferences: async (uuid, hash) => {
    const resp = await client.sendCommand(['DEL', `preferences:${uuid}:${hash}`]);

    return true;
  },
};

export default db;
