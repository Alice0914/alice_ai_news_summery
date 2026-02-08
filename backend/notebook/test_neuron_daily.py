import sys
import os

# backend 폴더를 경로에 추가
sys.path.insert(0, os.path.abspath('..'))

from agents.neuron_daily_news_agent import NeuronNewsAgent

# 테스트 실행
agent = NeuronNewsAgent(start_date="2026-01-30", end_date="2026-01-30")
results = agent.run()

# 결과 출력
print(results)
