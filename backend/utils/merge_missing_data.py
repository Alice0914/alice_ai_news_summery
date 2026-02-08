
import json
import os

def merge_missing_data():
    reverified_path = "backend/notebook/final_news_reverified_20260130.json"
    verified_path = "backend/notebook/final_news_verified_20260130.json"
    
    # Load data
    try:
        with open(reverified_path, 'r', encoding='utf-8') as f:
            reverified_data = json.load(f)
        with open(verified_path, 'r', encoding='utf-8') as f:
            verified_data = json.load(f)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return

    print(f"Loaded {len(reverified_data)} reverified items and {len(verified_data)} original items.")

    if len(reverified_data) != len(verified_data):
        print("WARNING: Item counts do not match. Merging by index might be risky.")
        # proceed anyway but warn? Or stop? 
        # For now, we assume they align.
    
    # Iterate and merge
    updated_count = 0
    id_mismatch_count = 0
    
    for i, item in enumerate(reverified_data):
        if i >= len(verified_data):
            break
            
        original_item = verified_data[i]
        
        # RESTORE ORIGINAL ID to ensure consistency
        if 'id' in original_item and item.get('id') != original_item['id']:
            # print(f"Restoring ID: {item.get('id')} -> {original_item['id']}")
            item['id'] = original_item['id']
            id_mismatch_count += 1
        
        # Check specific fields for missing data
        # Fields to check: source, sourceUrl, publishedDate, likes, viewCount, shareCount
        fields_to_check = ['source', 'sourceUrl', 'publishedDate', 'likes', 'viewCount', 'shareCount']
        
        item_updated = False
        for key in fields_to_check:
            value = item.get(key)
            # If value is missing or explicitly "None" string
            if value is None or value == "None" or value == "":
                original_value = original_item.get(key)
                # Only update if original has valid data
                if original_value is not None and original_value != "None" and original_value != "":
                    item[key] = original_value
                    item_updated = True
        
        if item_updated or id_mismatch_count > 0:
            updated_count += 1

    print(f"Restored {id_mismatch_count} IDs.")
    print(f"Merged fields for {updated_count} items.")

    print(f"Merged data for {updated_count} items.")

    # Save
    with open(reverified_path, 'w', encoding='utf-8') as f:
        json.dump(reverified_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saving merged data back to {reverified_path}")

if __name__ == "__main__":
    merge_missing_data()
