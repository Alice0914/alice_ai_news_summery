import sys
import os
import json
from datetime import datetime, timedelta

# Add backend directory to sys.path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, '../../'))
sys.path.append(backend_dir)

try:
    from agents.neuron_daily_news_agent import NeuronNewsAgent
except ImportError as e:
    print(f"Import Error: {e}")
    print(f"Sys Path: {sys.path}")
    sys.exit(1)

def test_neuron_agent():
    print("--- Testing NeuronNewsAgent ---")
    
    # Test for the last 3 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=3)
    
    s_str = start_date.strftime("%Y-%m-%d")
    e_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Target Date Range: {s_str} ~ {e_str}")
    
    agent = NeuronNewsAgent(start_date=s_str, end_date=e_str)
    results = agent.run()
    
    print(f"\n✅ Extraction Complete. Found {len(results)} items.")
    
    if results:
        print("\n--- Sample Item ---")
        print(json.dumps(results[0], indent=2, ensure_ascii=False))
        
        # Verify fields
        item = results[0]
        required_fields = ['date', 'raw_title', 'raw_content', 'source_name', 'source_url']
        missing = [f for f in required_fields if f not in item]
        if missing:
            print(f"⚠️ Warning: Missing fields in first item: {missing}")
        else:
            print("Verified: All required fields present.")

if __name__ == "__main__":
    test_neuron_agent()
