import sessionless from 'sessionless-node';
import fetch from 'node-fetch';

const get = async (url) => {
  return await fetch(url);
};

const post = async (url, payload) => {
  return await fetch(url, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const put = async (url, payload) => {
  return await fetch(url, {
    method: 'put',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const _delete = async (url, payload) => {
  return await fetch(url, {
    method: 'delete',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const pref = {
  baseURL: 'https://dev.pref.allyabase.com/',

  createUser: async (hash, newPreferences, saveKeys, getKeys) => {
    const keys = (await getKeys()) || (await sessionless.generateKeys(saveKeys, getKeys))
    sessionless.getKeys = getKeys;

    const payload = {
      timestamp: new Date().getTime() + '',
      pubKey: keys.pubKey,
      hash,
      pref: newPreferences
    };

    payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + payload.hash);

    const res = await put(`${pref.baseURL}user/create`, payload);
    const user = await res.json();
console.log(user);
    const uuid = user.uuid;

    return uuid;
  },

  updatePreferences: async (uuid, hash, newPreferences) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);
    const payload = {timestamp, uuid, hash, Preferences, signature};

    const res = await put(`${pref.baseURL}user/${uuid}/preferences`, payload);
    const user = res.json();
        
    return user;
  },

  getPreferences: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    const res = await get(`${pref.baseURL}user/${uuid}/preferences?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
    const user = res.json();
   
    return user;
  },

  updateGlobalPreferences: async (uuid, hash, newPreferences) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);
    const payload = {timestamp, uuid, hash, Preferences, signature};

    const res = await put(`${pref.baseURL}user/${uuid}/global/preferences`, payload);
    const user = res.json();
        
    return user;
  },

  getGlobalPreferences: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    const res = await get(`${pref.baseURL}user/${uuid}/global/preferences?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
    const user = res.json();
   
    return user;
  },

  deleteUser: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);
    const payload = {timestamp, uuid, hash, signature};


    const res = await _delete(`${pref.baseURL}user/delete`, payload);
    return res.status === 200;
  }
};

export default pref;
