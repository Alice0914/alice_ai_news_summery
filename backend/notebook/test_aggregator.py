import sys
import os
import json
from datetime import datetime, timedelta

# backend path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agents.news_aggregator_agent import NewsAggregatorAgent

def test_aggregator():
    print("--- Testing NewsAggregatorAgent ---")
    
    # Run for 1 day to be fast
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    
    s_str = yesterday.strftime("%Y-%m-%d")
    e_str = today.strftime("%Y-%m-%d")
    
    print(f"Date: {s_str} ~ {e_str}")
    
    agent = NewsAggregatorAgent()
    try:
        results = agent.run(s_str, e_str)
        print(f"\n✅ Aggregation Complete.")
        print(f"Total Unique Items: {len(results)}")
        
        # Check source names
        sources = set(item.get('aggregator_source') for item in results)
        print(f"Sources found: {sources}")
        
        # Check output structure
        if results:
            print("\n--- Sample Item ---")
            print(json.dumps(results[0], indent=2, ensure_ascii=False))
            
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_aggregator()
