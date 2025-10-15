# Pref MAGIC-Routed Endpoints

## Overview

Pref now supports MAGIC-routed versions of all POST, PUT, and DELETE operations. These spells route through Fount (the resolver) for centralized authentication, eliminating the need for continuebee verification in Pref.

## Converted Routes

### 1. User Creation with Preferences
**Direct Route**: `PUT /user/create`
**MAGIC Spell**: `prefUserCreate`
**Cost**: 50 MP

**Components**:
```javascript
{
  hash: "password-hash",
  preferences: {
    theme: "dark",
    language: "en",
    // ... up to 64 key-value pairs, each value max 256 chars
  }
}
```

**Returns**:
```javascript
{
  success: true,
  uuid: "user-uuid",
  preferences: {
    theme: "dark",
    language: "en"
  }
}
```

**Validation**:
- Maximum 64 preference keys
- Each string value max 256 characters
- Only string values allowed

---

### 2. Update User Preferences
**Direct Route**: `PUT /user/:uuid/preferences`
**MAGIC Spell**: `prefUserPreferences`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash",
  preferences: {
    theme: "light",
    language: "es",
    notifications: "disabled"
  }
}
```

**Returns**:
```javascript
{
  success: true,
  uuid: "user-uuid",
  preferences: {
    theme: "light",
    language: "es",
    notifications: "disabled"
  }
}
```

---

### 3. Update Global Preferences
**Direct Route**: `PUT /user/:uuid/global/preferences`
**MAGIC Spell**: `prefUserGlobalPreferences`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash",
  preferences: {
    globalTheme: "system",
    globalLanguage: "en-US"
  }
}
```

**Returns**:
```javascript
{
  success: true,
  uuid: "user-uuid",
  preferences: {
    globalTheme: "system",
    globalLanguage: "en-US"
  }
}
```

**Note**: Global preferences are shared across all clients for a user.

---

### 4. Delete User Preferences
**Direct Route**: `DELETE /user/delete`
**MAGIC Spell**: `prefUserDelete`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash"
}
```

**Returns**:
```javascript
{
  success: true
}
```

---

## Implementation Details

### File Changes

1. **`/src/magic/magic.js`** - Added four new spell handlers:
   - `prefUserCreate(spell)`
   - `prefUserPreferences(spell)`
   - `prefUserGlobalPreferences(spell)`
   - `prefUserDelete(spell)`

2. **`/fount/src/server/node/spellbooks/spellbook.js`** - Added spell definitions with destinations and costs

3. **`/test/mocha/magic-spells.js`** - New test file with comprehensive spell tests

4. **`/test/mocha/package.json`** - Added `fount-js` dependency

### Authentication Flow

```
Client → Fount (resolver) → Pref MAGIC handler → Business logic
           ↓
    Verifies signature
    Deducts MP
    Grants experience
    Grants nineum
```

**Before (Direct REST)**:
- Client signs request
- Pref calls continuebee for auth
- Pref executes business logic

**After (MAGIC Spell)**:
- Client signs spell
- Fount verifies signature & deducts MP
- Fount grants experience & nineum to caster
- Fount forwards to Pref
- Pref executes business logic (no auth needed)

### Naming Convention

Route path → Spell name transformation:
```
/user/create                     → prefUserCreate
/user/:uuid/preferences          → prefUserPreferences
/user/:uuid/global/preferences   → prefUserGlobalPreferences
/user/delete                     → prefUserDelete
```

Pattern: `[service][PathWithoutSlashesAndParams]`

### Validation Logic

All spell handlers include the same validation as the REST endpoints:

```javascript
// Validate preferences
const values = Object.values(preferences);
const filteredValues = values.filter(value =>
  typeof value === 'string' && value.length < 256
);

if (values.length !== filteredValues.length || values.length > 64) {
  return { success: false, error: 'Invalid preferences' };
}
```

### Error Handling

All spell handlers return consistent error format:
```javascript
{
  success: false,
  error: "Error description"
}
```

## Testing

Run MAGIC spell tests:
```bash
cd pref/test/mocha
npm install
npm test magic-spells.js
```

Test coverage:
- ✅ User creation with preferences via spell
- ✅ Preference update via spell
- ✅ Global preference update via spell
- ✅ User deletion via spell
- ✅ Invalid preferences validation (too long)
- ✅ Too many preferences validation (>64)
- ✅ Missing fields validation

## Benefits

1. **No Continuebee Dependency**: Pref handlers don't need to call continuebee for auth
2. **Centralized Auth**: All signature verification in one place (Fount)
3. **Automatic Rewards**: Every spell grants experience + nineum
4. **Gateway Rewards**: Gateway participants get 10% of rewards
5. **Reduced Code**: Pref handlers simplified without auth logic
6. **Consistent Pattern**: Same flow across all services

## Differences from Direct REST

### UUID Generation
- **REST**: Gets UUID from continuebee
- **MAGIC**: Generates UUID directly (users don't need continuebee account first)

### Global vs User Preferences
- **User Preferences**: Tied to hash, local to device
- **Global Preferences**: Shared across all devices for a user

## Next Steps

Progress on MAGIC route conversion:
- ✅ Joan (3 routes complete)
- ✅ Pref (4 routes complete)
- ⏳ Aretha
- ⏳ Continuebee
- ⏳ BDO
- ⏳ Julia
- ⏳ Dolores
- ⏳ Sanora
- ⏳ Addie
- ⏳ Covenant
- ⏳ Prof
- ⏳ Fount (internal routes)

## Last Updated
January 14, 2025
