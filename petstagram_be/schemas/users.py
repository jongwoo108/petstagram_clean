from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileRead(BaseModel):
    username: str
    email: EmailStr
    pet_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        orm_mode = True

class ProfileUpdate(BaseModel):
    pet_name: Optional[str] = None
    bio: Optional[str] = None 