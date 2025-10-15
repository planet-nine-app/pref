# Pref - Planet Nine User Preferences Service

## Overview

Pref is a Planet Nine allyabase microservice that manages user preferences and settings with sessionless authentication.

**Location**: `/pref/`
**Port**: 3009 (default)

## Core Features

### ⚙️ **Preference Management**
- **User Settings**: Store and retrieve user preferences
- **Sessionless Auth**: All operations use cryptographic signatures
- **Flexible Schemas**: Support for arbitrary preference structures
- **Per-User Isolation**: Isolated preference storage per user

## API Endpoints

### Preference Operations
- `PUT /user/create` - Create user with initial preferences
- `PUT /user/:uuid` - Update user preferences
- `GET /user/:uuid` - Retrieve user preferences
- `DELETE /user/:uuid` - Delete user and preferences

### MAGIC Protocol
- `POST /magic/spell/:spellName` - Execute MAGIC spells for preference operations

### Health & Status
- `GET /health` - Service health check

## MAGIC Route Conversion (October 2025)

All Pref REST endpoints have been converted to MAGIC protocol spells:

### Converted Spells (4 total)
1. **prefUserCreate** - Create user with initial preferences
2. **prefUser** - Update user preferences
3. **prefUserGet** - Retrieve user preferences
4. **prefUserDelete** - Delete user and preferences

**Testing**: Comprehensive MAGIC spell tests available in `/test/mocha/magic-spells.js` (10 tests covering success and error cases)

**Documentation**: See `/MAGIC-ROUTES.md` for complete spell specifications and migration guide

## Implementation Details

**Location**: `/src/server/node/src/magic/magic.js`

All preference operations maintain the same functionality as the original REST endpoints while benefiting from centralized Fount authentication and MAGIC protocol features like experience granting and gateway rewards.

## Last Updated
October 14, 2025 - Completed full MAGIC protocol conversion. All 4 routes now accessible via MAGIC spells with centralized Fount authentication.
