# Pref

This is the JavaScript client SDK for the Pref miniservice. 

### Usage

```javascript
import pref from 'pref-js';

const saveKeys = (keys) => { /* handle persisting keys here */ };
const getKeys = () => { /* return keys here. Can be async */ };

const hash = 'this hash describes the context for this pref';

const newPref = {
  youc: 'an',
  put: 'whatever',
  you: 'want',
  so: 'long',
  as: 'it\'s',
  a: 'flat',
  object: ''
};

const uuid = await pref.createUser(hash, newPref, saveKeys, getKeys);

newPref.put = 'something else';

const user = await pref.updatePreferences(uuid, hash, newPref); 

const userAgain = await pref.getPreferences(uuid, hash); 

const userWithGlobalPreferences = await pref.updateGlobalPreferences(uuid, hash, newPref); 

const userWithGlobalPreferencesAgain = await pref.getGlobalPreferences(uuid, hash); 

const deleted = await pref.deleteUser(uuid, hash); // returns true on success
```
