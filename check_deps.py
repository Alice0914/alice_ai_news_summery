
try:
    import sentence_transformers
    print("sentence-transformers is installed.")
except ImportError as e:
    print(f"Error: {e}")

try:
    import sklearn
    print("scikit-learn is installed.")
except ImportError as e:
    print(f"Error: {e}")

try:
    import torch
    print("torch is installed.")
except ImportError as e:
    print(f"Error: {e}")
