"""
Ristro Backend — JWT Authentication Utilities
Handles password hashing and JWT token creation/verification.
"""

import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "ristro-dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

import bcrypt

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pw_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    pw_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pw_bytes, hashed_bytes)


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.
    The 'data' dict should contain: sub (user id), name, email, role.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload dict or None."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
