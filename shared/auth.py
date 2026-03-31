import os
from datetime import datetime, timedelta, timezone
import jwt
from werkzeug.security import check_password_hash

def verify_password(password: str, password_hash: str) -> bool:
    try:
        return check_password_hash(password_hash, password)
    except Exception:
        return False

def issue_sso_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "rut": user["rut"],
        "email": user.get("email"),
        "username": user.get("username"),
        "rol": user.get("rol", "usuario"),
        "iss": os.getenv("SSO_ISSUER", "integralflex"),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=int(os.getenv("TOKEN_EXP_MINUTES", "10"))),
    }
    return jwt.encode(payload, os.getenv("SSO_SECRET_KEY"), algorithm="HS256")

def decode_sso_token(token: str) -> dict:
    return jwt.decode(
        token,
        os.getenv("SSO_SECRET_KEY"),
        algorithms=["HS256"],
        issuer=os.getenv("SSO_ISSUER", "integralflex"),
    )
