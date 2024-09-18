import config from '../../config/local.js';
import { createClient } from './client.js';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getPreferences: async (uuid, hash) => {
console.log(uuid, hash);
    const preferences = await client.get(`preferences:${uuid}_${hash}`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putPreferences: async (uuid, preferences, hash) => {
console.log(uuid, preferences, hash);
    await client.set(`preferences:${uuid}_${hash}`, JSON.stringify(preferences));
    return preferences;
  },

  getGlobalPreferences: async (uuid) => {
    const preferences = await client.get(`preferences:${uuid}_Earth`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putGlobalPreferences: async (uuid, preferences, hash) => {
    await client.set(`preferences:${uuid}_Earth`, JSON.stringify(preferences));
    return preferences;
  },

  deletePreferences: async (uuid, hash) => {
    const resp = await client.del(`preferences:${uuid}_${hash}`);

    return true;
  },

  saveKeys: async (keys) => {
    await client.set(`keys`, JSON.stringify(keys));
  },

  getKeys: async () => {
    const keyString = await client.get('keys');
    return JSON.parse(keyString);
  }

};

export default db;
