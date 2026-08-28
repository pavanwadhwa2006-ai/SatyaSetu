"""
SatyaSetu — Seed Entry Point
Delegates to app.core.seed.run_seed()
"""
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.seed import run_seed

if __name__ == "__main__":
    t_count, d_count, v_count = run_seed()
    if t_count != 5:
        print(f"FAILED: Expected 5 tenders, got {t_count}")
        sys.exit(1)
    print("SUCCESS: Phase 2 Seed Complete and Verified!")
