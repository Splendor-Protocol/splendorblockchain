import fs from 'fs';
import net from 'net';
import axios from 'axios';
import { Web3 } from 'web3';
import { IpcProvider } from 'web3-providers-ipc';

const IPC_PATH = '/root/splendorblockchain/Core-Blockchain/chaindata/node1/geth.ipc';
const ACCESS_TOKEN = 'private-network-1757346718388-suqw4gu5e';
const POST_API_URL = 'http://72.60.24.227:3000/post-enode';
const GET_API_URL = 'http://72.60.24.227:3000/get-enode';
const UPDATE_COMPLETE_URL = 'http://72.60.24.227:3000/api/update-complete';
const REGISTER_VALIDATOR_URL = 'http://72.60.24.227:3000/api/register-validator';
const INTERVAL = 5000;

let provider;
let web3;

function sendJsonRpcRequest(method, params = []) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(IPC_PATH);

    client.on('connect', () => {
      const request = JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      });

      client.write(`${request}\n`);
    });

    client.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      } catch (error) {
        reject(error);
      } finally {
        client.end();
      }
    });

    client.on('error', (error) => {
      reject(error);
    });
  });
}

async function getEnodeAddress() {
  try {
    let nodeInfo = await sendJsonRpcRequest('admin_nodeInfo');
    return nodeInfo.enode;
  } catch (error) {
    console.error('Error fetching enode address:', error);
    throw error;
  }
}

async function postEnodeAddress() {
  try {
    const enode = await getEnodeAddress();
    console.log('Enode Address:', enode);

    if (!ACCESS_TOKEN) {
      throw new Error('ACCESS_TOKEN is not defined');
    }

    const response = await axios.post(POST_API_URL, { enode }, {
      headers: { Authorization: ACCESS_TOKEN }
    });
    console.log('Posted enode address:', response.data);
  } catch (error) {
    console.error('Error posting enode address:', error.response.data);
  }
}

async function addPeers() {
  try {
    if (!ACCESS_TOKEN) {
      throw new Error('ACCESS_TOKEN is not defined');
    }

    const response = await axios.get(GET_API_URL, {
      headers: { Authorization: ACCESS_TOKEN }
    });
    const enodeList = response.data;
    const ownEnode = await getEnodeAddress();

    for (const enode of enodeList) {
      if (enode !== ownEnode) {
        try {
          await sendJsonRpcRequest('admin_addPeer', [enode]);
          console.log('Added peer:', enode);
        } catch (error) {
          console.error('Error adding peer:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error adding peers:', error);
  }
}

// ============= VALIDATOR UPDATE TRACKING FUNCTIONS =============

async function getNodeAddress() {
  try {
    const nodeType = await getNodeType();
    
    if (nodeType === 'validator') {
      // For validators, try to get coinbase address (validator address)
      const coinbase = await sendJsonRpcRequest('eth_coinbase');
      if (coinbase && coinbase !== '0x0000000000000000000000000000000000000000') {
        console.log(`Found validator coinbase address: ${coinbase}`);
        return coinbase;
      }
      
      // Fallback: try to get from accounts
      const accounts = await sendJsonRpcRequest('eth_accounts');
      if (accounts && accounts.length > 0) {
        console.log(`Found validator account address: ${accounts[0]}`);
        return accounts[0];
      }
      
      // Last resort for validators: generate from enode
      const enode = await getEnodeAddress();
      const nodeId = enode.split('@')[0].replace('enode://', '');
      const derivedAddress = '0x' + nodeId.substring(0, 40);
      console.log(`Generated validator address from enode: ${derivedAddress}`);
      return derivedAddress;
    }
    
    if (nodeType === 'rpc') {
      // RPC nodes don't need addresses - use enode-based identifier for tracking
      const enode = await getEnodeAddress();
      const nodeId = enode.split('@')[0].replace('enode://', '');
      const identifier = 'rpc-' + nodeId.substring(0, 16); // Shorter identifier for RPC
      console.log(`Generated RPC node identifier: ${identifier}`);
      return identifier;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting node address:', error);
    return null;
  }
}

async function getNodeType() {
  try {
    // Check for validator or RPC marker files
    const validatorFile = '/root/splendorblockchain/Core-Blockchain/chaindata/node1/.validator';
    const rpcFile = '/root/splendorblockchain/Core-Blockchain/chaindata/node1/.rpc';
    
    if (fs.existsSync(validatorFile)) {
      return 'validator';
    } else if (fs.existsSync(rpcFile)) {
      return 'rpc';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error determining node type:', error);
    return 'unknown';
  }
}

async function getCommitHash() {
  try {
    // Try to get git commit hash
    const { execSync } = await import('child_process');
    const commitHash = execSync('cd /root/splendorblockchain && git rev-parse HEAD', { encoding: 'utf8' }).trim();
    return commitHash;
  } catch (error) {
    console.error('Error getting commit hash:', error);
    return 'unknown';
  }
}

async function getValidatorIP() {
  try {
    // Try to get external IP
    const response = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
    return response.data.ip;
  } catch (error) {
    console.error('Error getting external IP:', error);
    return 'unknown';
  }
}

async function registerNode() {
  try {
    const nodeAddress = await getNodeAddress();
    const nodeIP = await getValidatorIP();
    const nodeType = await getNodeType();
    
    console.log(`Attempting to register ${nodeType} node with address: ${nodeAddress}`);
    
    if (!nodeAddress) {
      console.log('Could not determine node address, skipping registration');
      return;
    }

    const registrationData = {
      validator_address: nodeAddress, // Server expects this field name
      validator_ip: nodeIP,
      node_type: nodeType
    };

    console.log('Registration data:', registrationData);

    const response = await axios.post(REGISTER_VALIDATOR_URL, registrationData, {
      headers: { 
        Authorization: ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log(`${nodeType.toUpperCase()} node registration response:`, response.data);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`${nodeType.toUpperCase()} node already registered`);
    } else {
      console.error(`Error registering ${nodeType} node:`, error.response?.data || error.message);
    }
  }
}

async function reportUpdateCompletion() {
  try {
    const nodeAddress = await getNodeAddress();
    const nodeIP = await getValidatorIP();
    const commitHash = await getCommitHash();
    const nodeType = await getNodeType();
    const timestamp = new Date().toISOString();
    
    console.log(`Reporting update completion for ${nodeType} node: ${nodeAddress}`);
    
    if (!nodeAddress) {
      console.log('Could not determine node address, skipping update report');
      return;
    }

    const updateData = {
      validator_address: nodeAddress, // Server expects this field name
      validator_ip: nodeIP,
      commit_hash: commitHash,
      timestamp: timestamp,
      node_type: nodeType
    };

    console.log('Update completion data:', updateData);

    const response = await axios.post(UPDATE_COMPLETE_URL, updateData, {
      headers: { 
        Authorization: ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log(`${nodeType.toUpperCase()} update completion reported successfully:`, response.data);
    return true;
  } catch (error) {
    console.error(`Error reporting ${nodeType} update completion:`, error.response?.data || error.message);
    return false;
  }
}

// Function to check if this is a fresh update (called from update script)
async function checkAndReportUpdate() {
  try {
    // Check if there's a flag file indicating a recent update
    const updateFlagFile = '/var/tmp/splendor-update-completed';
    
    if (fs.existsSync(updateFlagFile)) {
      console.log('Update flag file found, reporting update completion...');
      const success = await reportUpdateCompletion();
      
      if (success) {
        // Remove the flag file after successful reporting
        fs.unlinkSync(updateFlagFile);
        console.log('Update completion reported and flag file removed');
      }
    }
  } catch (error) {
    console.error('Error checking for update flag:', error);
  }
}

function runPeriodically(fn, interval) {
  let isRunning = false;

  const execute = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await fn();
    } catch (error) {
      console.error('Error executing function:', error);
    }
    isRunning = false;
  };

  setInterval(execute, interval);
}

function waitForIpcFile() {
  const checkFileExists = () => {
    if (fs.existsSync(IPC_PATH)) {
      console.log('IPC file found. Starting execution...');
      provider = new IpcProvider(IPC_PATH, net);
      web3 = new Web3(provider);
      
      // Initialize node tracking (validator or RPC)
      setTimeout(async () => {
        console.log('Initializing node tracking...');
        await registerNode();
        await checkAndReportUpdate();
      }, 5000); // Wait 5 seconds for node to be fully ready
      
      // Start periodic tasks
      runPeriodically(postEnodeAddress, 15000);
      runPeriodically(addPeers, 9000);
      runPeriodically(checkAndReportUpdate, 60000); // Check for updates every minute
    } else {
      console.log('IPC file not found. Waiting...');
      setTimeout(checkFileExists, INTERVAL);
    }
  };

  checkFileExists();
}

// Fix for PM2 directory issue after updates
try {
  // Ensure we're in the correct directory
  process.chdir('/root/splendorblockchain/Core-Blockchain/plugins/sync-helper');
} catch (error) {
  console.error('Warning: Could not change to sync-helper directory:', error.message);
}

// Start the IPC file check
waitForIpcFile();
