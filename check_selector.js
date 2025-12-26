const { keccak256 } = require('js-sha3');

// Function to calculate function selector
function getFunctionSelector(signature) {
    const hash = keccak256(signature);
    return '0x' + hash.substring(0, 8);
}

// Check various function signatures
const functions = [
    'isBlocklisted(address)',
    'initialize()',
    'getBlocklistCount()',
    'addToBlocklist(address,string)',
    'removeFromBlocklist(address)'
];

console.log('Function selectors:');
functions.forEach(func => {
    const selector = getFunctionSelector(func);
    console.log(`${func}: ${selector}`);
});

// Check what 0x158ef93e corresponds to
console.log('\nChecking if 0x158ef93e matches any function...');
functions.forEach(func => {
    const selector = getFunctionSelector(func);
    if (selector === '0x158ef93e') {
        console.log(`MATCH: 0x158ef93e is ${func}`);
    }
});
