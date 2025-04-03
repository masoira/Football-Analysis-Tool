import os
import time

import requests
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

# For development only!
def create_test_token():
    # Create a fake payload like Supabase would
    payload = {
        "sub": "test-user-id",
        "email": "test@example.com",
        "exp": time.time() + 3600  # Expires in 1 hour
    }
    token = jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")
    return token

def test_hello_endpoint():
    token = create_test_token()
    print(f"{token=}")
    response = requests.get(
        "http://127.0.0.1:8000/hello",
        headers={"Authorization": f"Bearer {token}"},
        timeout=60
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_hello_endpoint()
