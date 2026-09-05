import sessionless from 'sessionless-node';

// esbuild's CJS output target (used by Netlify's function bundler) doesn't
// support top-level await, so the client is now a lazily-resolved promise -
// call sites now do `(await client).get(...)` instead of `client.get(...)`.
const client = (async () => {
  const { createClient } = process.env.PERSISTENCE_BACKEND === 'netlify-blobs'
    ? await import('./client.netlify-blobs.js')
    : await import('./client.js');

  return createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
})();

const db = {
  getPreferences: async (uuid, hash) => {
console.log(uuid, hash);
    const preferences = await (await client).get(`preferences:${uuid}_${hash}`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putPreferences: async (uuid, preferences, hash) => {
console.log(uuid, preferences, hash);
    await (await client).set(`preferences:${uuid}_${hash}`, JSON.stringify(preferences));
    return preferences;
  },

  getGlobalPreferences: async (uuid) => {
    const preferences = await (await client).get(`preferences:${uuid}_Earth`);
    const parsedPreferences = JSON.parse(preferences);
console.log(`parsedPreferences: ${JSON.stringify(parsedPreferences)}`);
console.log(uuid);
    return parsedPreferences;
  },

  putGlobalPreferences: async (uuid, preferences, hash) => {
    await (await client).set(`preferences:${uuid}_Earth`, JSON.stringify(preferences));
    return preferences;
  },

  deletePreferences: async (uuid, hash) => {
    const resp = await (await client).del(`preferences:${uuid}_${hash}`);

    return true;
  },

  saveKeys: async (keys) => {
    await (await client).set(`keys`, JSON.stringify(keys));
  },

  getKeys: async () => {
    const keyString = await (await client).get('keys');
    return JSON.parse(keyString);
  }

};

export default db;
