# Validator Update Tracking System

This system tracks validator updates across the Splendor blockchain network, showing which validators have completed updates and which are still pending.

## Features

- **Persistent Data Storage**: All data persists across PM2 restarts
- **Pre-populated Updates**: Automatically includes already completed validator updates
- **Real-time Dashboard**: Beautiful web interface showing update progress
- **Tier-based Tracking**: Groups validators by tier (Platinum, Gold, Silver, Bronze)
- **Update History**: Complete history of all validator updates
- **API Endpoints**: RESTful API for programmatic access

## Files

- `enode-server.js` - Main server application
- `all-validators-list.json` - Complete list of network validators
- `pre-populate-updates.cjs` - Script to pre-populate completed updates
- `validators-data.json` - Persistent validator data (auto-generated)
- `update-history.json` - Update history data (auto-generated)
- `enodes-data.json` - Enode data (auto-generated)

## Quick Start

1. **Start the server:**
   ```bash
   cd Core-Blockchain/plugins/sync-helper
   node enode-server.js
   ```

2. **Access the dashboard:**
   - Open http://localhost:3000/api/dashboard in your browser
   - View real-time validator update status

3. **API Endpoints:**
   - `GET /api/status` - Overall validator status
   - `GET /api/pending` - Validators that haven't updated
   - `GET /api/completed` - Validators that have updated
   - `GET /api/history` - Update history
   - `GET /health` - System health check

## Current Status

✅ **53 validators completed** (out of 56 total)
⏳ **3 validators pending**
📊 **94.6% progress**

### Completed Validators Include:
- **Platinum Tier**: Richtofen, Vitamin
- **Gold Tier**: Titan, Sentinal, OnChainBrian, Cleetus42069, Obsidian, When Doves Cry, Purple Rain, Darling Nikki, Oasis, 100x, AI SLAYER, Onyx, Esq1, Esq2, Magsari 1, Egghead
- **Silver Tier**: Multiple validators including Kenjilla1, Kenjilla2, ZMSS Supporters, ZMSS Haters, Splendor A-D, and many others
- **Bronze Tier**: Validator 1

### Pending Validators:
- 3 validators still need to complete their updates

## For Validators

To report an update completion, send a POST request to `/api/update-complete`:

```bash
curl -X POST http://localhost:3000/api/update-complete \
  -H "Content-Type: application/json" \
  -H "Authorization: private-network-1757346718388-suqw4gu5e" \
  -d '{
    "validator_address": "0x...",
    "validator_ip": "1.2.3.4",
    "commit_hash": "1efe73e8",
    "timestamp": "2025-11-11T01:00:00.000Z",
    "node_type": "validator"
  }'
```

## Data Persistence

- All data automatically saves every 5 minutes
- Graceful shutdown handling preserves data
- No data loss on PM2 restart
- Pre-population script runs on startup to include historical updates

## Dashboard Features

- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Filter Options**: View by status (All/Updated/Pending) or tier
- **Copy Functionality**: Click to copy validator addresses and IPs
- **Progress Tracking**: Visual progress bar and statistics
- **Tier Breakdown**: Statistics grouped by validator tier

## Monitoring

The system provides comprehensive monitoring through:
- Web dashboard at `/api/dashboard`
- Health check endpoint at `/health`
- JSON API endpoints for programmatic access
- Console logging for all validator updates

## Architecture

The system uses:
- **Express.js** for the web server
- **File-based persistence** for data storage
- **In-memory caching** for fast access
- **Graceful shutdown** handling
- **Auto-cleanup** of old enode data
