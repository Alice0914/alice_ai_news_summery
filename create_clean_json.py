import pandas as pd
import json
import os

# Paths
input_file = 'backend/notebook/test/news_json_20260125.json'
output_file = 'backend/notebook/test/news_json_202601.json'

# Load
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Process
df = pd.DataFrame(data)
df = df.drop(columns=['topic', 'topic_ko'], errors='ignore')
df = df.sort_values(by='impactScore', ascending=False)

# Save
# orient='records' creates a list of dicts, which is standard JSON structure for this app
df.to_json(output_file, orient='records', force_ascii=False, indent=4)

print(f"Successfully created {output_file}")
