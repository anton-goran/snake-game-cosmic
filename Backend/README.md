You can run the server from the Backend directory using the following command:

bash
cd Backend
uv run uvicorn app.main:app --reload
The server will start at http://127.0.0.1:8000.

You can also run the verification script to see it in action against the running server (make sure the server is running in another terminal, or the script will try to start its own instance if configured to do so, but our script 
verify_api.py
 actually starts a thread for the server, so you can just run):

bash
uv run python verify_api.py