# backend2/run_pipeline.py
"""
파이프라인 실행 스크립트
Usage: python run_pipeline.py
"""

from agents import run_pipeline

# 오늘 날짜 (2026-02-02)
if __name__ == "__main__":
    run_pipeline("2026-02-07", "2026-02-08")
