import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import fount from 'fount-js';
import { createHash } from 'crypto';

const baseURL = process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.fount.allyabase.com/` : 'http://127.0.0.1:3006/';
fount.baseURL = baseURL;

const hash = createHash('sha256');
hash.update('magic-pref-test@foo.bar:PASSWORD');
const digest = hash.digest('hex');

let savedUser = {};
let keys = {};
let fountUser = {};

describe('Pref MAGIC Spell Tests', () => {

  before(async () => {
    // Generate keys for testing
    keys = await sessionless.generateKeys(() => { return keys; }, () => { return keys; });

    // Create fount user for spell casting
    fountUser = await fount.createUser(() => keys, () => keys);
    console.log('Created fount user:', fountUser.uuid);
  });

  it('should create user with preferences via prefUserCreate spell', async () => {
    const timestamp = Date.now().toString();

    const testPreferences = {
      theme: 'dark',
      language: 'en',
      notifications: 'enabled'
    };

    const spell = {
      spell: 'prefUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 0,
      components: {
        hash: digest,
        preferences: testPreferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserCreate', spell);

    console.log('prefUserCreate result:', result);

    result.should.have.property('success', true);
    result.should.have.property('uuid');
    result.should.have.property('preferences');
    result.preferences.should.have.property('theme', 'dark');
    result.uuid.length.should.equal(36);

    savedUser = { uuid: result.uuid };
  });

  it('should update preferences via prefUserPreferences spell', async () => {
    const timestamp = Date.now().toString();

    const updatedPreferences = {
      theme: 'light',
      language: 'es',
      notifications: 'disabled'
    };

    const spell = {
      spell: 'prefUserPreferences',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 1,
      components: {
        uuid: savedUser.uuid,
        hash: digest,
        preferences: updatedPreferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserPreferences', spell);

    console.log('prefUserPreferences result:', result);

    result.should.have.property('success', true);
    result.should.have.property('uuid', savedUser.uuid);
    result.should.have.property('preferences');
    result.preferences.should.have.property('theme', 'light');
  });

  it('should update global preferences via prefUserGlobalPreferences spell', async () => {
    const timestamp = Date.now().toString();

    const globalPreferences = {
      globalTheme: 'system',
      globalLanguage: 'en-US'
    };

    const spell = {
      spell: 'prefUserGlobalPreferences',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 2,
      components: {
        uuid: savedUser.uuid,
        hash: digest,
        preferences: globalPreferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserGlobalPreferences', spell);

    console.log('prefUserGlobalPreferences result:', result);

    result.should.have.property('success', true);
    result.should.have.property('uuid', savedUser.uuid);
    result.should.have.property('preferences');
    result.preferences.should.have.property('globalTheme', 'system');
  });

  it('should delete user preferences via prefUserDelete spell', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'prefUserDelete',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 3,
      components: {
        uuid: savedUser.uuid,
        hash: digest
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserDelete', spell);

    console.log('prefUserDelete result:', result);

    result.should.have.property('success', true);
  });

  it('should fail to create user with invalid preferences (too long)', async () => {
    const timestamp = Date.now().toString();

    const invalidPreferences = {
      longValue: 'x'.repeat(300) // Over 256 character limit
    };

    const spell = {
      spell: 'prefUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 4,
      components: {
        hash: digest,
        preferences: invalidPreferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserCreate', spell);

    console.log('prefUserCreate (invalid) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to create user with too many preferences', async () => {
    const timestamp = Date.now().toString();

    // Create 70 preferences (over the 64 limit)
    const tooManyPreferences = {};
    for (let i = 0; i < 70; i++) {
      tooManyPreferences[`pref${i}`] = `value${i}`;
    }

    const spell = {
      spell: 'prefUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 5,
      components: {
        hash: digest,
        preferences: tooManyPreferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserCreate', spell);

    console.log('prefUserCreate (too many) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to update preferences with missing fields', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'prefUserPreferences',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 6,
      components: {
        // Missing uuid, hash, and preferences
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('prefUserPreferences', spell);

    console.log('prefUserPreferences (missing fields) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

});
