import logging
import os

from fastapi import FastAPI, HTTPException, Header, Depends
from jose import jwt
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

load_dotenv()
SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

app = FastAPI()

async def verify_token(authorization: str = Header()):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization token")
    try:
        token = authorization.split("Bearer ")[1]
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/hello")
async def hello(payload: dict = Depends(verify_token)):
    return {
        "message": "Hello from protected endpoint",
        "your_user_id": payload["sub"],
        "your_email": payload.get("email")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
