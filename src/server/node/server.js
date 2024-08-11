import config from './config/local.js';
import express from 'express';
import preferences from './src/preferences/preferences.js';
import fetch from 'node-fetch';
import sessionless from 'sessionless-node';

const sk = (keys) => {
  global.keys = keys;
};

const gk = () => {
  return keys;
};

const continuebeeURL = 'https://thirsty-gnu-80.deno.dev/';

sessionless.generateKeys(sk, gk);

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > config.allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.put('/user/create', async (req, res) => {
  try {
    const body = req.body;
    const hash = body.hash;
    
    const res = await fetch(`${continuebeeURL}user/create`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
    if(res.status !== 200) {
      res.status = 403;
      res.send({error: 'Auth error'});
    }
    const user = await res.json();

    const resp = await preferences.putPreferences(user.uuid, body.preferences, hash);
    if(!resp) {
      res.status = 404;
      return res.send({error: 'not found'});
    }
    res.send({
      uuid,
      prefs
    });
  } catch {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    
    const res = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
    if(res.status !== 200) {
      res.status = 403;
      res.send({error: 'Auth error'});
    }

    const prefs = await preferences.putPreferences(user.uuid, body.preferences, hash);
    res.send({
      uuid,
      prefs
    });
  } catch {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;

    const res = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&signature=${signature}`);
    if(res.status !== 200) {
      res.status = 403;
      res.send({error: 'Auth error'});
    }

    const prefs = await preferences.getPreferences(uuid);
    res.send({
      uuid, 
      prefs
    });
  } catch {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/global/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    
    const res = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
    if(res.status !== 200) {
      res.status = 403;
      res.send({error: 'Auth error'});
    }

    const prefs = await preferences.putGlobalPreferences(user.uuid, body.preferences);
    res.send({
      uuid,
      prefs
    });
  } catch {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/preferences', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;

    const res = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&signature=${signature}`);
    if(res.status !== 200) {
      res.status = 403;
      res.send({error: 'Auth error'});
    }

    const prefs = await preferences.getGlobalPreferences(uuid);
    res.send({
      uuid, 
      prefs
    });
  } catch {
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

    const res = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&signature=${signature}`);
    if(res.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    res.status = 202;
    res.send();
  } catch {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.listen(3000);
