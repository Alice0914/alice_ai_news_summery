
file_path = 'backend/notebook/test/news_json_20260125.json'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    open_b = line.count('[')
    close_b = line.count(']')
    balance += open_b - close_b
    
    # Check if we drop below 0 (too many closing) - though we expect missing closing
    if balance < 0:
        print(f"Error: Negative bracket balance at line {i+1}")
        break

print(f"Final Balance: {balance} (Should be 0)")
if balance > 0:
    print("Error: Missing closing brackets.")

# Heuristic to find WHERE
# We know balance varies.
# Items usually end with `},` or `}`.
# At end of item, if indentation is 4 spaces, balance should be 1 (the main list `[` is still open).

curr_balance = 0
for i, line in enumerate(lines):
    curr_balance += line.count('[') - line.count(']')
    
    if line.strip() == '},' or line.strip() == '}':
        # End of an object.
        # Inside the object, if it's correct, balance should return to 1.
        if curr_balance != 1:
            print(f"Suspicious balance {curr_balance} at line {i+1} (End of object?). Expected 1.")
