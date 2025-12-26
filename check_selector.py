import hashlib

def get_function_selector(signature):
    """Calculate the function selector for a given function signature"""
    hash_object = hashlib.sha3_256(signature.encode())
    return '0x' + hash_object.hexdigest()[:8]

# Function signatures to check
functions = [
    'isBlocklisted(address)',
    'initialize()',
    'getBlocklistCount()',
    'addToBlocklist(address,string)',
    'removeFromBlocklist(address)'
]

print('Function selectors:')
for func in functions:
    selector = get_function_selector(func)
    print(f'{func}: {selector}')

# Check what 0x158ef93e corresponds to
print('\nChecking if 0x158ef93e matches any function...')
for func in functions:
    selector = get_function_selector(func)
    if selector == '0x158ef93e':
        print(f'MATCH: 0x158ef93e is {func}')

# Also check the correct selector for isBlocklisted
correct_selector = get_function_selector('isBlocklisted(address)')
print(f'\nCorrect selector for isBlocklisted(address): {correct_selector}')
