from datetime import datetime
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str


class RegisterResponse(BaseModel):
    user_id: int
    username: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    user_id: int
    username: str
    created_at: datetime
