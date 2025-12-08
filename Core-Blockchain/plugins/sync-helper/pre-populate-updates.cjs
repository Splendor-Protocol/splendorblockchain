// Pre-populate script to mark already updated validators as COMPLETED
const fs = require('fs')
const path = require('path')

// Pre-existing completed validators data from the dashboard
const completedValidators = [
  {
    address: '0xb1109399A845A792322961354A53cBC395D1D855',
    ip: '46.62.209.246',
    timestamp: '2025-11-09T17:18:38.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x7D3fdfC97634eDFF9a31A413Db62085Ca56ac44f',
    ip: '46.62.231.171',
    timestamp: '2025-11-09T18:43:34.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x58B21Bf319f7Bc9Bf347CB45183Ecc5E4bc860A4',
    ip: '46.62.146.5',
    timestamp: '2025-11-09T18:56:43.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x55b6cE53e95cA0739fe5d6e767F30e7267115b16',
    ip: '157.180.40.249',
    timestamp: '2025-11-09T19:06:27.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x29d715e014F5097d8e66e5392F2aee7568fEe3A8',
    ip: '65.109.7.89',
    timestamp: '2025-11-09T19:19:24.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xB84A1D6ddD1e7e688a0e43E89C8442e4f8F8E7D1',
    ip: '5.78.80.87',
    timestamp: '2025-11-09T07:56:32.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xa98dcFcec14C71630452cDd4db3E77199E75e9F0',
    ip: '5.78.65.84',
    timestamp: '2025-11-09T09:59:51.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x741BBD43b711956412fB5d349a301F6471FBE959',
    ip: '5.78.70.212',
    timestamp: '2025-11-09T10:09:05.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xbA2fF3f5dA3D21b4298AC77287A12938F67317b3',
    ip: '5.78.132.115',
    timestamp: '2025-11-09T10:27:56.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x041eeA4304020CEC18bC4F7BF71305c3F677ee60',
    ip: '91.98.231.196',
    timestamp: '2025-11-09T10:38:41.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x161A256FF2B8ba84AB77050939586326078cb7A4',
    ip: '75.60.245.129',
    timestamp: '2025-11-09T10:40:26.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x777c9b5B9d3D84D5997699590C138b1AC2aa07Ea',
    ip: '5.223.47.177',
    timestamp: '2025-11-09T13:24:40.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x4970F76B5CCD23e8Bf7Ce0A310b325C8B3Bf0039',
    ip: '5.223.76.97',
    timestamp: '2025-11-09T13:39:15.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x4BEE71b116219a1232b24B0F3E902a39755f05AD',
    ip: '5.223.51.186',
    timestamp: '2025-11-09T13:53:56.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x026159D914B9B428A997664BFf69186192e69A7C',
    ip: '5.223.51.253',
    timestamp: '2025-11-09T14:02:59.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xdB8D953761eB83281A1914aFDc45e37994022687',
    ip: '65.108.152.134',
    timestamp: '2025-11-09T17:50:51.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xbbC6eDdF5F298E32D1d452458f8c46693aE615a2',
    ip: '157.180.35.115',
    timestamp: '2025-11-09T18:05:27.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x40cb60b43613F4F7d6d8989A5643b4D7A46E35e2',
    ip: '5.78.104.82',
    timestamp: '2025-11-08T21:17:03.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xcD972F07fDA02dc49b35b5e4a59569E72Ce8b29F',
    ip: '178.156.193.48',
    timestamp: '2025-11-08T21:25:52.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x92aF5c316044d76824414Bb71EF115F684F02703',
    ip: '178.156.162.204',
    timestamp: '2025-11-08T21:36:04.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xB7b2f429A72DF9F6EF89B5C732A32256AFd186B9',
    ip: '178.156.173.70',
    timestamp: '2025-11-08T22:44:47.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x30D8286Ae9b2C4061B828993fB586102dd40A8ba',
    ip: '178.156.184.124',
    timestamp: '2025-11-08T22:54:52.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xF1946C0B1A52Bc7be4F5Fd54Ec73E8643a71d918',
    ip: '178.156.188.87',
    timestamp: '2025-11-08T23:07:54.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x880593Ea9B04F1ECD186738CC04Fb1F1A4815250',
    ip: '78.46.172.129',
    timestamp: '2025-11-08T23:32:09.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xC23C05F186eC48888d357A56bFb9Aa3fE4B84513',
    ip: '65.108.80.145',
    timestamp: '2025-11-08T23:52:25.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x52AD6cC9186dB92F3D344fcD830e41e9e9893210',
    ip: '46.62.132.103',
    timestamp: '2025-11-09T00:07:07.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x0Fe504383D8443c2B022DA6A5520eF98f20C09B3',
    ip: '65.21.181.221',
    timestamp: '2025-11-09T00:29:45.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xE51FBcaFBf60a1B43E52B035f4b634c25af436ae',
    ip: '37.27.0.111',
    timestamp: '2025-11-09T06:42:54.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x2e5C07196268bEd1b981a77f7EC882Be43169296',
    ip: '5.78.133.1',
    timestamp: '2025-11-09T07:42:34.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x6C338473ca8846742eFcaF153e09363245D933aF',
    ip: '5.78.136.70',
    timestamp: '2025-11-08T19:41:13.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x2528b3a2143feAdaD5cb9F7FDADB537d492000b8',
    ip: '178.156.184.104',
    timestamp: '2025-11-08T19:50:33.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xcB9C893067b98a369979C1E1bB3439EE30aCE3B2',
    ip: '157.180.45.87',
    timestamp: '2025-11-08T20:00:25.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x9a2A795dE64baBcF6526ED361Cc6DF20Af083444',
    ip: '5.78.76.246',
    timestamp: '2025-11-08T20:10:53.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xEc72706703C9cDAE1130746d716267535fbFD2ef',
    ip: '5.78.158.210',
    timestamp: '2025-11-08T20:20:26.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xbdA90c89BE943Df3735c50515d904c97Ce666cc3',
    ip: '5.78.117.32',
    timestamp: '2025-11-08T20:29:15.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x8302E95D9bCC13fAd4857907D1Ad3bd5E91225E2',
    ip: '5.78.125.233',
    timestamp: '2025-11-08T21:41:33.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xCd6C20D5C4efC6c6f5F33BAF9AE59e619AC870c3',
    ip: '155.138.201.46',
    timestamp: '2025-11-08T21:28:55.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xcb0e2B64540415d04C26837FCB4B30E93fb2b6f5',
    ip: '155.138.230.206',
    timestamp: '2025-11-08T21:30:52.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x750f2CE301bDf8643bc5c6f397920702dbc03B0C',
    ip: '104.238.179.135',
    timestamp: '2025-11-08T21:33:21.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x71f75c758E3B0aa1F4f618A26AF93b31F3af0Aa1',
    ip: '91.99.167.125',
    timestamp: '2025-11-08T21:49:11.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x556262542B96Ab2b5062049F09D63b4fBa68D5b7',
    ip: '91.99.147.154',
    timestamp: '2025-11-08T22:07:43.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  // RPC node
  {
    address: 'rpc-4...a8280',
    ip: '5.78.157.126',
    timestamp: '2025-11-06T21:43:22.000Z',
    commitHash: '07daf21c',
    nodeType: 'rpc'
  },
  {
    address: '0xAbC3c6f5C6600510fF81db7D7F96F65dB2Fd1417',
    ip: '72.60.24.217',
    timestamp: '2025-11-08T17:20:31.000Z',
    commitHash: '07daf21c',
    nodeType: 'validator'
  },
  {
    address: '0xE89fe8F37ADC22121F6Cd2D8953f13c4b4DE7D2c',
    ip: '162.246.21.59',
    timestamp: '2025-11-08T18:18:36.000Z',
    commitHash: '67ef6ed2',
    nodeType: 'validator'
  },
  {
    address: '0xd56Ae52e598F71e3cE7a3351D0EdF21Cf68F0cb9',
    ip: '91.99.235.164',
    timestamp: '2025-11-08T18:33:31.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xc0ff07274957dB0BaEA3643DD8c791b6D060a3A4',
    ip: '5.78.159.40',
    timestamp: '2025-11-08T18:43:09.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x4a6ED6D5F0e668b0de9fD957d3EBb693592e466b',
    ip: '46.62.205.60',
    timestamp: '2025-11-08T18:49:57.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0xcc1CFf541D744F70aF279b7fF4d4E9fBFcba8194',
    ip: '5.183.8.133',
    timestamp: '2025-11-08T18:53:50.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x14F51874408d1770Dcbb539fbe2818a5d77962be',
    ip: '89.116.49.222',
    timestamp: '2025-11-08T18:58:30.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x4Cd4B491EE9B1F7ADE859CC0f266D71833477e1e',
    ip: '95.216.219.70',
    timestamp: '2025-11-08T19:03:29.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x6a3ae7883e505A9C7B1bf7573Be8fE2A09a4d875',
    ip: '65.108.215.91',
    timestamp: '2025-11-08T19:07:20.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x4F00ab95dDbCb45c0eaF1951d43d0Bfa151D5B78',
    ip: '5.78.155.133',
    timestamp: '2025-11-08T19:22:44.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  },
  {
    address: '0x9760410868220746B1cA0dee7F9295ee58F78702',
    ip: '5.78.135.7',
    timestamp: '2025-11-08T19:27:30.000Z',
    commitHash: '1efe73e8',
    nodeType: 'validator'
  }
]

// Function to pre-populate the validators data
function prePopulateValidators() {
  const DATA_DIR = __dirname
  const VALIDATORS_FILE = path.join(DATA_DIR, 'validators-data.json')
  const HISTORY_FILE = path.join(DATA_DIR, 'update-history.json')
  const NETWORK_VALIDATORS_FILE = path.join(DATA_DIR, 'all-validators-list.json')

  try {
    // Load network validators
    let networkValidators = []
    if (fs.existsSync(NETWORK_VALIDATORS_FILE)) {
      const networkData = JSON.parse(fs.readFileSync(NETWORK_VALIDATORS_FILE, 'utf8'))
      networkValidators = networkData.validators || []
    }

    // Load existing validators data or create new
    let validators = new Map()
    if (fs.existsSync(VALIDATORS_FILE)) {
      const validatorsData = JSON.parse(fs.readFileSync(VALIDATORS_FILE, 'utf8'))
      validators = new Map(validatorsData || [])
    }

    // Load existing update history or create new
    let updateHistory = []
    if (fs.existsSync(HISTORY_FILE)) {
      const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
      updateHistory = historyData || []
    }

    let updatedCount = 0
    let newHistoryEntries = 0

    // Process each completed validator
    completedValidators.forEach(completedValidator => {
      // Find the network validator info
      const networkValidator = networkValidators.find(v => 
        v.address.toLowerCase() === completedValidator.address.toLowerCase()
      )

      // Create or update validator entry
      let validator = validators.get(completedValidator.address)
      if (!validator) {
        validator = {
          address: completedValidator.address,
          name: networkValidator?.name || 'Unknown',
          tier: networkValidator?.tier || 'UNKNOWN',
          stakedAmount: networkValidator?.stakedAmount || '0.0',
          networkStatus: networkValidator?.status || 'Unknown',
          statusCode: networkValidator?.statusCode || 0,
          website: networkValidator?.website || 'N/A',
          number: networkValidator?.number || 0,
          ip: 'unknown',
          status: 'PENDING',
          registeredAt: new Date().toISOString(),
          lastUpdate: null,
          commitHash: null,
          nodeType: null
        }
      }

      // Update validator with completed status
      validator.status = 'COMPLETED'
      validator.lastUpdate = completedValidator.timestamp
      validator.commitHash = completedValidator.commitHash
      validator.nodeType = completedValidator.nodeType
      validator.ip = completedValidator.ip

      validators.set(completedValidator.address, validator)
      updatedCount++

      // Add to update history if not already present
      const existingHistoryEntry = updateHistory.find(h => 
        h.validator_address.toLowerCase() === completedValidator.address.toLowerCase() &&
        h.timestamp === completedValidator.timestamp
      )

      if (!existingHistoryEntry) {
        const updateEvent = {
          validator_address: completedValidator.address,
          validator_name: validator.name,
          validator_ip: completedValidator.ip,
          commit_hash: completedValidator.commitHash,
          timestamp: completedValidator.timestamp,
          node_type: completedValidator.nodeType,
          eventTime: new Date().toISOString()
        }
        updateHistory.push(updateEvent)
        newHistoryEntries++
      }
    })

    // Initialize remaining network validators as PENDING if not already present
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
      }
    })

    // Sort update history by timestamp
    updateHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // Save updated data
    const validatorsArray = Array.from(validators.entries())
    fs.writeFileSync(VALIDATORS_FILE, JSON.stringify(validatorsArray, null, 2))
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(updateHistory, null, 2))

    console.log(`✅ Pre-population completed successfully!`)
    console.log(`📊 Updated ${updatedCount} validators to COMPLETED status`)
    console.log(`📝 Added ${newHistoryEntries} new history entries`)
    console.log(`🎯 Total validators: ${validators.size}`)
    console.log(`✅ Completed: ${Array.from(validators.values()).filter(v => v.status === 'COMPLETED').length}`)
    console.log(`⏳ Pending: ${Array.from(validators.values()).filter(v => v.status === 'PENDING').length}`)

  } catch (error) {
    console.error('❌ Error during pre-population:', error)
  }
}

// Run the pre-population
if (require.main === module) {
  prePopulateValidators()
}

module.exports = { prePopulateValidators, completedValidators }
