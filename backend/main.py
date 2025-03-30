import logging
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, HTTPException, Header, Depends, Path, Response, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt

from crud_operations import (
   get_match_from_db,
   list_matches_from_db,
   create_match_in_db,
   update_match_in_db,
   delete_match_from_db
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

load_dotenv()
SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

app = FastAPI()
security = HTTPBearer()


async def verify_token(authorization: HTTPAuthorizationCredentials = Security(security)) -> dict[str, str]:
    """
    Raises error for invalid/missing tokens. Returns decoded JWT payload if successful.
    """
    try:
        token = authorization.credentials
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/")
async def welcome_message():
    return "Welcome to Football Analysis Tool backend service. Try '/docs' for more info."


@app.get("/hello")
async def hello(payload: dict = Depends(verify_token)):
    return {
        "message": "Hello from protected endpoint",
        "your_user_id": payload["sub"],
        "your_email": payload.get("email")
    }


matches_router = APIRouter(prefix="/matches")


@matches_router.get("/{match_name}")
async def get_match(match_name: str = Path(...), payload: dict = Depends(verify_token)):
    print(match_name)


@matches_router.get("/list") 
async def list_matches(payload: dict = Depends(verify_token)):
   """List all matches for the authenticated user"""
   matches = await list_matches_from_db(user_id=payload["sub"])
   return matches


@matches_router.post("/create")
async def create_match(match_data: dict = Body(...), payload: dict = Depends(verify_token)):
   """Create a new match for the authenticated user"""
   match = await create_match_in_db(match_data, user_id=payload["sub"])
   return match


@matches_router.put("/{match_name}")
async def update_match(
   match_name: str = Path(...), 
   match_data: dict = Body(...), 
   payload: dict = Depends(verify_token)
):
   """Update an existing match"""
   updated_match = await update_match_in_db(match_name, match_data, user_id=payload["sub"])
   return updated_match


@matches_router.delete("/{match_name}")
async def delete_match(
   match_name: str = Path(...),
   payload: dict = Depends(verify_token)
):
   """Delete a match"""
   await delete_match_from_db(match_name, user_id=payload["sub"])
   return Response(status_code=status.HTTP_204_NO_CONTENT)


app.include_router(matches_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
