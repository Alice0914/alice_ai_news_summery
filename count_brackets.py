
file_path = 'backend/notebook/test/news_json_20260125.json'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

open_braces = content.count('{')
close_braces = content.count('}')
open_brackets = content.count('[')
close_brackets = content.count(']')
quotes = content.count('"')

print(f"{{: {open_braces}, }}: {close_braces}")
print(f"[: {open_brackets}, ]: {close_brackets}")
print(f"\" : {quotes}")

if open_braces != close_braces:
    print("MISMATCH: braces {}")
if open_brackets != close_brackets:
    print("MISMATCH: brackets []")
if quotes % 2 != 0:
    print("MISMATCH: quotes (odd number)")
