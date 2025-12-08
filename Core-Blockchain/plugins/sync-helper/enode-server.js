const express = require("express")
const fs = require("fs")
const path = require("path")
const app = express()
const port = 3000

// Middleware
app.use(express.json())

// File paths for persistence
const DATA_DIR = __dirname
const ENODES_FILE = path.join(DATA_DIR, 'enodes-data.json')
const VALIDATORS_FILE = path.join(DATA_DIR, 'validators-data.json')
const HISTORY_FILE = path.join(DATA_DIR, 'update-history.json')
const NETWORK_VALIDATORS_FILE = path.join(DATA_DIR, 'all-validators-list.json')

// In-memory storage for enodes
let enodes = []

// In-memory storage for validator updates
let validators = new Map() // Map<validatorAddress, validatorInfo>
let updateHistory = [] // Array of update events
let networkValidators = [] // All validators from the network list

// Authentication token - Updated for private network
const ACCESS_TOKEN = 'private-network-1757346718388-suqw4gu5e'
console.log("New Access Token:", ACCESS_TOKEN)

// Load data from files on startup
function loadPersistedData() {
  try {
    // Load enodes
    if (fs.existsSync(ENODES_FILE)) {
      const enodesData = JSON.parse(fs.readFileSync(ENODES_FILE, 'utf8'))
      enodes = enodesData || []
      console.log(`Loaded ${enodes.length} enodes from persistent storage`)
    }

    // Load validators
    if (fs.existsSync(VALIDATORS_FILE)) {
      const validatorsData = JSON.parse(fs.readFileSync(VALIDATORS_FILE, 'utf8'))
      validators = new Map(validatorsData || [])
      console.log(`Loaded ${validators.size} validators from persistent storage`)
    }

    // Load update history
    if (fs.existsSync(HISTORY_FILE)) {
      const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
      updateHistory = historyData || []
      console.log(`Loaded ${updateHistory.length} update history entries from persistent storage`)
    }

    // Load network validators list
    if (fs.existsSync(NETWORK_VALIDATORS_FILE)) {
      const networkData = JSON.parse(fs.readFileSync(NETWORK_VALIDATORS_FILE, 'utf8'))
      networkValidators = networkData.validators || []
      console.log(`Loaded ${networkValidators.length} network validators from list`)
      
      // Initialize validators from network list if not already present
      initializeNetworkValidators()
    }
  } catch (error) {
    console.error('Error loading persisted data:', error)
  }
}

// Save data to files
function savePersistedData() {
  try {
    // Save enodes
    fs.writeFileSync(ENODES_FILE, JSON.stringify(enodes, null, 2))
    
    // Save validators (convert Map to Array for JSON serialization)
    const validatorsArray = Array.from(validators.entries())
    fs.writeFileSync(VALIDATORS_FILE, JSON.stringify(validatorsArray, null, 2))
    
    // Save update history
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(updateHistory, null, 2))
    
    console.log('Data persisted to files successfully')
  } catch (error) {
    console.error('Error saving persisted data:', error)
  }
}

// Initialize validators from network list
function initializeNetworkValidators() {
  let newValidatorsCount = 0
  
  networkValidators.forEach(networkValidator => {
    if (!validators.has(networkValidator.address)) {
      const validator = {
        address: networkValidator.address,
        name: networkValidator.name,
        tier: networkValidator.tier,
        stakedAmount: networkValidator.stakedAmount,
        networkStatus: networkValidator.status,
        statusCode: networkValidator.statusCode,
        website: networkValidator.website,
        number: networkValidator.number,
        ip: 'unknown',
        status: 'PENDING',
        registeredAt: new Date().toISOString(),
        lastUpdate: null,
        commitHash: null,
        nodeType: null
      }
      validators.set(networkValidator.address, validator)
      newValidatorsCount++
    } else {
      // Update existing validator with network info
      const existingValidator = validators.get(networkValidator.address)
      existingValidator.name = networkValidator.name
      existingValidator.tier = networkValidator.tier
      existingValidator.stakedAmount = networkValidator.stakedAmount
      existingValidator.networkStatus = networkValidator.status
      existingValidator.statusCode = networkValidator.statusCode
      existingValidator.website = networkValidator.website
      existingValidator.number = networkValidator.number
    }
  })
  
  if (newValidatorsCount > 0) {
    console.log(`Initialized ${newValidatorsCount} new validators from network list`)
    savePersistedData()
  }
}

// Load persisted data on startup
loadPersistedData()

// Pre-populate with already completed validators
try {
  const { prePopulateValidators } = require('./pre-populate-updates.cjs')
  prePopulateValidators()
  console.log('Pre-population of completed validators executed')
} catch (error) {
  console.log('Pre-population script not found or failed:', error.message)
}

// Auto-save data every 5 minutes
setInterval(() => {
  savePersistedData()
}, 300000)

// Middleware to check authorization
function authenticate(req, res, next) {
  const token = req.headers.authorization
  if (token !== ACCESS_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

// POST endpoint to add enode
app.post("/post-enode", authenticate, (req, res) => {
  const { enode } = req.body

  if (!enode) {
    return res.status(400).json({ error: "Enode is required" })
  }

  if (!enode.startsWith("enode://") && !enode.startsWith("enr:-")) {
    return res.status(400).json({
      error: "Invalid enode format. Must start with 'enode://' or 'enr:-'",
    })
  }

  // Add enode if not already present
  if (!enodes.includes(enode)) {
    enodes.push(enode)
    console.log(`Added enode: ${enode}`)
    savePersistedData()
  }

  res.json({ success: true, message: "Enode added successfully" })
})

// GET endpoint to retrieve all enodes
app.get("/get-enode", (req, res) => {
  res.json(enodes)
})

// GET endpoint to retrieve all enodes without authentication
app.get("/get-enodes-public", (req, res) => {
  res.json(enodes)
})

// ============= VALIDATOR UPDATE TRACKING ENDPOINTS =============

// POST endpoint for validators to report update completion
app.post("/api/update-complete", authenticate, (req, res) => {
  const { validator_address, validator_ip, commit_hash, timestamp, node_type } = req.body

  // Validate required fields
  if (!validator_address || !commit_hash || !timestamp) {
    return res.status(400).json({ 
      error: "Missing required fields: validator_address, commit_hash, timestamp" 
    })
  }

  // Check if validator exists or create new one
  let validator = validators.get(validator_address)
  if (!validator) {
    // Try to find in network validators
    const networkValidator = networkValidators.find(v => v.address === validator_address)
    validator = {
      address: validator_address,
      name: networkValidator?.name || 'Unknown',
      tier: networkValidator?.tier || 'UNKNOWN',
      stakedAmount: networkValidator?.stakedAmount || '0.0',
      networkStatus: networkValidator?.status || 'Unknown',
      statusCode: networkValidator?.statusCode || 0,
      website: networkValidator?.website || 'N/A',
      number: networkValidator?.number || 0,
      ip: validator_ip || 'unknown',
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
      lastUpdate: null,
      commitHash: null,
      nodeType: null
    }
    validators.set(validator_address, validator)
  }

  // Update validator status
  validator.status = 'COMPLETED'
  validator.lastUpdate = timestamp
  validator.commitHash = commit_hash
  validator.nodeType = node_type || 'unknown'
  if (validator_ip) validator.ip = validator_ip

  // Add to update history
  const updateEvent = {
    validator_address,
    validator_name: validator.name,
    validator_ip: validator.ip,
    commit_hash,
    timestamp,
    node_type,
    eventTime: new Date().toISOString()
  }
  updateHistory.push(updateEvent)

  // Keep only last 100 update events
  if (updateHistory.length > 100) {
    updateHistory = updateHistory.slice(-100)
  }

  console.log(`Update completed for validator: ${validator.name} (${validator_address}) at ${timestamp}`)
  
  // Save data after update
  savePersistedData()
  
  res.json({ 
    success: true, 
    message: "Update completion recorded successfully",
    validator: validator
  })
})

// GET endpoint to get current update status of all validators
app.get("/api/status", (req, res) => {
  const validatorArray = Array.from(validators.values())
  const totalValidators = validatorArray.length
  const completedValidators = validatorArray.filter(v => v.status === 'COMPLETED').length
  const pendingValidators = totalValidators - completedValidators
  const progressPercentage = totalValidators > 0 ? Math.round((completedValidators / totalValidators) * 100) : 0
  
  const lastUpdate = validatorArray
    .filter(v => v.lastUpdate)
    .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))[0]?.lastUpdate || null

  // Group by tier
  const tierStats = {}
  validatorArray.forEach(v => {
    if (!tierStats[v.tier]) {
      tierStats[v.tier] = { total: 0, completed: 0, pending: 0 }
    }
    tierStats[v.tier].total++
    if (v.status === 'COMPLETED') {
      tierStats[v.tier].completed++
    } else {
      tierStats[v.tier].pending++
    }
  })

  res.json({
    total_validators: totalValidators,
    completed: completedValidators,
    pending: pendingValidators,
    progress_percentage: progressPercentage,
    last_update: lastUpdate,
    tier_breakdown: tierStats,
    validators: validatorArray
  })
})

// GET endpoint to get list of validators that haven't updated
app.get("/api/pending", (req, res) => {
  const pendingValidators = Array.from(validators.values())
    .filter(v => v.status === 'PENDING')
    .sort((a, b) => a.number - b.number)
  
  res.json({
    count: pendingValidators.length,
    validators: pendingValidators
  })
})

// GET endpoint to get list of validators that have updated
app.get("/api/completed", (req, res) => {
  const completedValidators = Array.from(validators.values())
    .filter(v => v.status === 'COMPLETED')
    .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
  
  res.json({
    count: completedValidators.length,
    validators: completedValidators
  })
})

// GET endpoint to get update history
app.get("/api/history", (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const history = updateHistory.slice(-limit).reverse()
  
  res.json({
    count: history.length,
    total_events: updateHistory.length,
    history: history
  })
})

// POST endpoint to register a new validator
app.post("/api/register-validator", authenticate, (req, res) => {
  const { validator_address, validator_ip, node_type } = req.body

  if (!validator_address) {
    return res.status(400).json({ error: "validator_address is required" })
  }

  if (validators.has(validator_address)) {
    return res.status(409).json({ error: "Validator already registered" })
  }

  // Try to find in network validators
  const networkValidator = networkValidators.find(v => v.address === validator_address)
  
  const validator = {
    address: validator_address,
    name: networkValidator?.name || 'Unknown',
    tier: networkValidator?.tier || 'UNKNOWN',
    stakedAmount: networkValidator?.stakedAmount || '0.0',
    networkStatus: networkValidator?.status || 'Unknown',
    statusCode: networkValidator?.statusCode || 0,
    website: networkValidator?.website || 'N/A',
    number: networkValidator?.number || 0,
    ip: validator_ip || 'unknown',
    status: 'PENDING',
    registeredAt: new Date().toISOString(),
    lastUpdate: null,
    commitHash: null,
    nodeType: node_type || 'unknown'
  }

  validators.set(validator_address, validator)
  console.log(`Registered new validator: ${validator.name} (${validator_address})`)

  savePersistedData()

  res.json({ 
    success: true, 
    message: "Validator registered successfully",
    validator: validator
  })
})

// GET endpoint for web dashboard
app.get("/api/dashboard", (req, res) => {
  const validatorArray = Array.from(validators.values()).sort((a, b) => a.number - b.number)
  const totalValidators = validatorArray.length
  const completedValidators = validatorArray.filter(v => v.status === 'COMPLETED').length
  const progressPercentage = totalValidators > 0 ? Math.round((completedValidators / totalValidators) * 100) : 0
  
  // Group by tier for stats
  const tierStats = {}
  validatorArray.forEach(v => {
    if (!tierStats[v.tier]) {
      tierStats[v.tier] = { total: 0, completed: 0, pending: 0 }
    }
    tierStats[v.tier].total++
    if (v.status === 'COMPLETED') {
      tierStats[v.tier].completed++
    } else {
      tierStats[v.tier].pending++
    }
  })

  const tierColors = {
    'PLATINUM': '#E5E4E2',
    'GOLD': '#FFD700',
    'SILVER': '#C0C0C0',
    'BRONZE': '#CD7F32',
    'UNKNOWN': '#808080'
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Validator Update Dashboard</title>
        <meta http-equiv="refresh" content="30">
        <style>
            body { font-family: Arial, sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .header { background: #007cba; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #007cba; }
            .stat-label { color: #666; margin-top: 5px; }
            .progress-bar { background: #e0e0e0; border-radius: 10px; height: 20px; margin: 10px 0; overflow: hidden; }
            .progress-fill { background: #28a745; height: 100%; transition: width 0.3s ease; }
            .tier-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }
            .tier-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
            .tier-name { font-weight: bold; margin-bottom: 10px; padding: 5px 10px; border-radius: 4px; color: #333; }
            .validators-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px; }
            .validator-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .validator-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .validator-name { font-weight: bold; font-size: 1.1em; }
            .validator-number { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; color: #666; }
            .validator-tier { padding: 3px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; color: #333; margin-left: 5px; }
            .validator-status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
            .status-completed { background: #d4edda; color: #155724; }
            .status-pending { background: #fff3cd; color: #856404; }
            .validator-info { margin: 8px 0; font-size: 0.9em; color: #666; }
            .validator-address { font-family: monospace; font-size: 0.8em; }
            .refresh-info { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
            .copy-btn { 
                background: #f8f9fa; 
                border: 1px solid #dee2e6; 
                border-radius: 4px; 
                padding: 4px 8px; 
                cursor: pointer; 
                font-size: 0.8em; 
                transition: all 0.2s ease;
                min-width: 30px;
                height: 24px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .copy-btn:hover { 
                background: #e9ecef; 
                border-color: #adb5bd; 
            }
            .copy-btn:active { 
                background: #dee2e6; 
                transform: scale(0.95); 
            }
            .copy-btn.copied { 
                background: #d4edda; 
                border-color: #c3e6cb; 
                color: #155724; 
            }
            .filter-buttons { margin-bottom: 20px; text-align: center; }
            .filter-btn { 
                background: #f8f9fa; 
                border: 1px solid #dee2e6; 
                padding: 8px 16px; 
                margin: 0 5px; 
                border-radius: 4px; 
                cursor: pointer; 
                transition: all 0.2s ease;
            }
            .filter-btn:hover { background: #e9ecef; }
            .filter-btn.active { background: #007cba; color: white; border-color: #007cba; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔄 Validator Update Dashboard</h1>
            <p>Real-time tracking of validator updates across the network</p>
            <p><strong>${totalValidators}</strong> Total Validators | <strong>${completedValidators}</strong> Updated | <strong>${totalValidators - completedValidators}</strong> Pending</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalValidators}</div>
                <div class="stat-label">Total Validators</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${completedValidators}</div>
                <div class="stat-label">Updated</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalValidators - completedValidators}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progressPercentage}%</div>
                <div class="stat-label">Progress</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>

        <div class="tier-stats">
            ${Object.entries(tierStats).map(([tier, stats]) => `
                <div class="tier-card">
                    <div class="tier-name" style="background-color: ${tierColors[tier] || '#808080'};">${tier}</div>
                    <div>Total: ${stats.total}</div>
                    <div style="color: #28a745;">Updated: ${stats.completed}</div>
                    <div style="color: #ffc107;">Pending: ${stats.pending}</div>
                </div>
            `).join('')}
        </div>

        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterValidators('all')">All</button>
            <button class="filter-btn" onclick="filterValidators('completed')">Updated</button>
            <button class="filter-btn" onclick="filterValidators('pending')">Pending</button>
            <button class="filter-btn" onclick="filterValidators('platinum')">Platinum</button>
            <button class="filter-btn" onclick="filterValidators('gold')">Gold</button>
            <button class="filter-btn" onclick="filterValidators('silver')">Silver</button>
            <button class="filter-btn" onclick="filterValidators('bronze')">Bronze</button>
        </div>
        
        <div class="validators-grid" id="validatorsGrid">
            ${validatorArray.map((validator, index) => `
                <div class="validator-card" data-status="${validator.status.toLowerCase()}" data-tier="${validator.tier.toLowerCase()}">
                    <div class="validator-header">
                        <div>
                            <span class="validator-number">#${validator.number}</span>
                            <span class="validator-name">${validator.name}</span>
                            <span class="validator-tier" style="background-color: ${tierColors[validator.tier] || '#808080'};">${validator.tier}</span>
                        </div>
                        <span class="validator-status status-${validator.status.toLowerCase()}">
                            ${validator.status === 'COMPLETED' ? '✅' : '⏳'} ${validator.status}
                        </span>
                    </div>
                    <div class="validator-info" style="display: flex; align-items: center; gap: 8px;">
                        <span class="validator-address">${validator.address.substring(0, 8)}...${validator.address.substring(validator.address.length - 8)}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${validator.address}', 'address-${index}')" id="address-${index}" title="Copy full address">
                            📋
                        </button>
                    </div>
                    <div class="validator-info" style="display: flex; align-items: center; gap: 8px;">
                        <span>IP: ${validator.ip}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${validator.ip}', 'ip-${index}')" id="ip-${index}" title="Copy IP address">
                            📋
                        </button>
                    </div>
                    <div class="validator-info">Staked: ${validator.stakedAmount} SPLD</div>
                    <div class="validator-info">Network Status: ${validator.networkStatus}</div>
                    <div class="validator-info">Node Type: ${validator.nodeType || 'Unknown'}</div>
                    ${validator.lastUpdate ? `<div class="validator-info">Updated: ${new Date(validator.lastUpdate).toLocaleString()}</div>` : ''}
                    ${validator.commitHash ? `<div class="validator-info">Commit: ${validator.commitHash.substring(0, 8)}...</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="refresh-info">
            <p>🔄 Page auto-refreshes every 30 seconds | Last updated: ${new Date().toLocaleString()}</p>
            <p><a href="/api/status">JSON API</a> | <a href="/api/pending">Pending Validators</a> | <a href="/api/completed">Updated Validators</a> | <a href="/api/history">Update History</a></p>
        </div>

        <script>
            async function copyToClipboard(text, buttonId) {
                try {
                    await navigator.clipboard.writeText(text);
                    
                    // Update button to show success
                    const button = document.getElementById(buttonId);
                    const originalText = button.innerHTML;
                    
                    button.innerHTML = '✅';
                    button.classList.add('copied');
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        const button = document.getElementById(buttonId);
                        const originalText = button.innerHTML;
                        
                        button.innerHTML = '✅';
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.classList.remove('copied');
                        }, 2000);
                    } catch (fallbackErr) {
                        console.error('Fallback copy failed: ', fallbackErr);
                        alert('Copy failed. Please copy manually: ' + text);
                    }
                    
                    document.body.removeChild(textArea);
                }
            }

            function filterValidators(filter) {
                const cards = document.querySelectorAll('.validator-card');
                const buttons = document.querySelectorAll('.filter-btn');
                
                // Update active button
                buttons.forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                // Filter cards
                cards.forEach(card => {
                    const status = card.getAttribute('data-status');
                    const tier = card.getAttribute('data-tier');
                    
                    let show = false;
                    switch(filter) {
                        case 'all':
                            show = true;
                            break;
                        case 'completed':
                            show = status === 'completed';
                            break;
                        case 'pending':
                            show = status === 'pending';
                            break;
                        case 'platinum':
                        case 'gold':
                        case 'silver':
                        case 'bronze':
                            show = tier === filter;
                            break;
                    }
                    
                    card.style.display = show ? 'block' : 'none';
                });
            }
        </script>
    </body>
    </html>
  `)
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    enodeCount: enodes.length,
    validatorCount: validators.size,
    networkValidatorCount: networkValidators.length,
    updateHistoryCount: updateHistory.length,
    completedValidators: Array.from(validators.values()).filter(v => v.status === 'COMPLETED').length,
    pendingValidators: Array.from(validators.values()).filter(v => v.status === 'PENDING').length,
    timestamp: new Date().toISOString(),
  })
})

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enode Manager</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
            input[type="text"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; }
            button:hover { background: #005a87; }
            .result { margin: 20px 0; padding: 15px; border-radius: 4px; display: none; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
            .dashboard-link { background: #28a745; }
            .dashboard-link:hover { background: #218838; }
        </style>
    </head>
    <body>
        <h1>Enode Manager & Validator Tracker</h1>
        
        <div class="container">
            <h3>Quick Links</h3>
            <button onclick="window.open('/api/dashboard', '_blank')" class="dashboard-link">📊 Open Validator Dashboard</button>
            <button onclick="getHealth()">🏥 Health Check</button>
        </div>
        
        <div class="container">
            <h3>Add New Enode</h3>
            <input type="text" id="enodeInput" placeholder="Enter enode string..." />
            <button onclick="postEnode()">Add Enode</button>
            <button onclick="clearInput()">Clear</button>
        </div>
        
        <div class="container">
            <h3>Actions</h3>
            <button onclick="getEnodes()">Get All Enodes</button>
            <button onclick="getEnodesPublic()">Get All Enodes Publicly</button>
            <button onclick="getValidatorStatus()">Get Validator Status</button>
        </div>
        
        <div id="result" class="result"></div>

        <script>
            const ACCESS_TOKEN = "${ACCESS_TOKEN}";
            
            function showResult(message, isError = false) {
                const resultDiv = document.getElementById("result");
                resultDiv.style.display = "block";
                resultDiv.className = "result " + (isError ? "error" : "success");
                resultDiv.innerHTML = message;
            }
            
            async function postEnode() {
                const enode = document.getElementById("enodeInput").value.trim();
                if (!enode) {
                    showResult("<strong>Error:</strong> Please enter an enode", true);
                    return;
                }
                
                try {
                    const response = await fetch("/post-enode", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": ACCESS_TOKEN },
                        body: JSON.stringify({ enode })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        showResult("<strong>Success:</strong> " + result.message);
                        document.getElementById("enodeInput").value = "";
                    } else {
                        showResult("<strong>Error:</strong> " + result.error, true);
                    }
                } catch (error) {
                    showResult("<strong>Network Error:</strong> " + error.message, true);
                }
            }
            
            async function getEnodes() {
                try {
                    const response = await fetch("/get-enode");
                    const result = await response.json();
                    
                    if (response.ok) {
                        const count = Array.isArray(result) ? result.length : 0;
                        showResult("<strong>Current Enodes (" + count + "):</strong><pre>" + JSON.stringify(result, null, 2) + "</pre>");
                    } else {
                        showResult("<strong>Error:</strong> " + result.error, true);
                    }
                } catch (error) {
                    showResult("<strong>Network Error:</strong> " + error.message, true);
                }
            }
            
            async function getEnodesPublic() {
                try {
                    const response = await fetch("/get-enodes-public");
                    const result = await response.json();
                    
                    if (response.ok) {
                        const count = Array.isArray(result) ? result.length : 0;
                        showResult("<strong>Current Enodes Publicly (" + count + "):</strong><pre>" + JSON.stringify(result, null, 2) + "</pre>");
                    } else {
                        showResult("<strong>Error:</strong> " + result.error, true);
                    }
                } catch (error) {
                    showResult("<strong>Network Error:</strong> " + error.message, true);
                }
            }
            
            async function getValidatorStatus() {
                try {
                    const response = await fetch("/api/status");
                    const result = await response.json();
                    showResult("<strong>Validator Status:</strong><pre>" + JSON.stringify(result, null, 2) + "</pre>");
                } catch (error) {
                    showResult("<strong>Network Error:</strong> " + error.message, true);
                }
            }
            
            async function getHealth() {
                try {
                    const response = await fetch("/health");
                    const result = await response.json();
                    showResult("<strong>Health Status:</strong><pre>" + JSON.stringify(result, null, 2) + "</pre>");
                } catch (error) {
                    showResult("<strong>Network Error:</strong> " + error.message, true);
                }
            }
            
            function clearInput() {
                document.getElementById("enodeInput").value = "";
                showResult("<strong>Input cleared</strong>");
            }
        </script>
    </body>
    </html>
  `)
})

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Enode API server running on port ${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`Validator Dashboard: http://localhost:${port}/api/dashboard`)
  console.log(`Loaded ${validators.size} validators from network`)
})

// Cleanup old enodes every 5 minutes but keep more for network stability
setInterval(() => {
  console.log(`Current enodes: ${enodes.length}`)
  // Keep only the last 50 enodes to prevent memory buildup but maintain network connectivity
  if (enodes.length > 50) {
    enodes = enodes.slice(-50)
    console.log(`Cleaned up enodes, now have: ${enodes.length}`)
    savePersistedData()
  }
}, 300000)

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Received SIGINT, saving data before shutdown...')
  savePersistedData()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, saving data before shutdown...')
  savePersistedData()
  process.exit(0)
})
