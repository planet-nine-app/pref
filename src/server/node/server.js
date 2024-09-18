import config from './config/local.js';
import express from 'express';
import cors from 'cors';
import preferences from './src/preferences/preferences.js';
import MAGIC from './src/magic/magic.js';
import fetch from 'node-fetch';
import fount from 'fount-js';
import sessionless from 'sessionless-node';

const sk = (keys) => {
  global.keys = keys;
};

const gk = () => {
  return keys;
};

sessionless.generateKeys(sk, gk);

const app = express();
app.use(cors());
app.use(express.json());

const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';
const continuebeeURL = `https://${SUBDOMAIN}.continuebee.allyabase.com/`;
fount.baseURL = `${SUBDOMAIN}.fount.allyabase.com`;

const repeat = (func) => {
  setTimeout(func, 2000);
};

const bootstrap = async () => {
  try {
    await user.getUserByUUID('pref');
    sessionless.getKeys = db.getKeys;
  } catch(err) {
    const fountUUID = await fount.createUser(db.saveKeys, db.getKeys);
    const pref = {
      uuid: 'pref',
      fountUUID
    };
    await db.saveUser(pref);
    repeat(bootstrap);
  }
};

repeat(bootstrap);

app.use((req, res, next) => {
console.log('got request');
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > config.allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.put('*', (req, res, next) => {
  if(!res.body) {
    return next();
  }
  const values = Object.values(req.body.preferences);
  const filteredValues = values.filter(value => typeof value === 'string' && value.length < 256); // 256 is an arbitrary placeholder value
  if(values.length !== filteredValues.length || values.length > 64) { // 64 is another arbitrary placeholder value
    res.status(404);
    return res.send({error: 'Not found'});
  }
console.log('about to next');
  next();
});

app.put('/user/create', async (req, res) => {
  try {
    const body = req.body;
    const hash = body.hash;
    const prefs = body.preferences;
    
console.log(`${continuebeeURL}user/create`);
console.log(body);

    const resp = await fetch(`${continuebeeURL}user/create`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }
    const user = await resp.json();
    const uuid = user.userUUID;

    const response = await preferences.putPreferences(uuid, prefs, hash);
    if(!response) {
      res.status = 404;
      return res.send({error: 'not found'});
    }
    return res.send({
      uuid,
      preferences: prefs
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/preferences', async (req, res) => {
console.log('putting preferences');
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    const signature = body.signature;
    
    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const prefs = await preferences.putPreferences(uuid, body.preferences, hash);
    return res.send({
      uuid,
      preferences: prefs
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/preferences', async (req, res) => {
console.log('get preferences');
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const hash = req.query.hash;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const prefs = await preferences.getPreferences(uuid, hash);
    return res.send({
      uuid, 
      preferences: prefs
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/global/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    const signature = body.signature;
    
    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const prefs = await preferences.putGlobalPreferences(uuid, body.preferences);
    return res.send({
      uuid,
      preferences: prefs
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/global/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const hash = req.query.hash;
    const signature = req.query.signature;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const prefs = await preferences.getGlobalPreferences(uuid);
    return res.send({
      uuid, 
      preferences: prefs
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.post('/magic/spell/:spellName', async (req, res) => {
  try {
    const spellName = req.params.spell;
    const spell = req.body.spell;
    
    switch(spellName) {
      case 'joinup': const resp = await MAGIC.joinup(spell);
        return res.send(resp);
        break;
      case 'linkup': const resp = await MAGIC.linkup(spell);
        return res.send(resp);
        break;
    }
  
    res.status(404);
    res.send({error: 'spell not found'});
  } catch(err) {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.delete('/user/delete', async (req, res) => {
  try {
    const body = req.body;
    const timestamp = body.timestamp;
    const uuid = body.uuid;
    const hash = body.hash;
    const signature = body.signature;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    res.status = 202;
    return res.send();
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.listen(3002);
console.log('give me your preferences');
