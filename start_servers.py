"""
WeatherGPT Unified Server Launcher
Runs both the Python FastAPI Backend (Port 8000) and the Vite Frontend (Port 5174/5173).
"""

import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")

    print("=" * 60)
    print("🌦️ Starting WeatherGPT Unified Meteorological Platform...")
    print("=" * 60)

    # 1. Start Python FastAPI Server
    print("▶ Launching Python FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    time.sleep(1.5)

    # 2. Start Vite Dev Server
    print("▶ Launching Vite React Frontend ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=root_dir,
        shell=True
    )

    print("\n✅ Both servers running!")
    print("• Backend API:  http://127.0.0.1:8000")
    print("• API Docs:     http://127.0.0.1:8000/docs")
    print("• Frontend App: http://localhost:5174/ (or 5173)\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
