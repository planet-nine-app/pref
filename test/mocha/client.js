import preferences from '../../src/client/javascript/pref.js';
import { should } from 'chai';
should();

console.log(preferences);

const savedUser = {};
let keys = {};
const hash = 'firstHash';

it('should register a user', async () => {
  const newPreferences = {
    foo: 'bar',
    baz: 'new'
  };
  const uuid = await preferences.createUser(hash, newPreferences, (k) => { keys = k; }, () => { return keys; });
console.log(uuid);
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should save preferences', async () => {
  const newPreferences = {
    foo: 'bar',
    baz: 'updated'
  };
  const res = await preferences.updatePreferences(savedUser.uuid, hash, bdo);
  res.preferences.baz.should.equal('updated');
});

it('should get preferences', async () => {
  const res = await preferences.getPreferences(savedUser.uuid, hash);
  res.preferences.baz.should.equal('updated');
});

it('should save global preferences', async () => {
  const newPreferences = {
    foo: 'bar',
    baz: 'updated globally'
  };
  const res = await preferences.updatePreferences(savedUser.uuid, hash, bdo);
  res.globalPreferences.baz.should.equal('updated');
});

it('should get global preferences', async () => {
  const res = await preferences.getPreferences(savedUser.uuid, hash);
  res.globalPreferences.baz.should.equal('updated');
});

it('should delete a user', async () => {
  const res = await preferences.deleteUser(savedUser.uuid, hash);
  res.should.equal(true);
});
