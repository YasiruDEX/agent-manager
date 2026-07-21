"""
main.py
-------
Uvicorn entrypoint. Imports the FastAPI app from app.py and starts the server.
"""

from app import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9099)
