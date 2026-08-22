import uvicorn
import os
import sys

# Add backend directory to sys.path so app module is found
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("Starting GlobeTrotter FastAPI Backend on http://127.0.0.1:8000 ...")
    print("Interactive Swagger API Docs available at http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
