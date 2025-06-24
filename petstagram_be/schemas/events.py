from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FeedCreate(BaseModel):
    username: str
    category: int
    images: List[str]
    content: str
    tags: Optional[List[str]] = []
    subject: Optional[str] = None

class FeedRead(BaseModel):
    id: int
    username: str
    category: int
    images: List[str]
    content: str
    tags: List[str]
    likes: int
    views: int
    created_at: datetime
    subject: Optional[str] = None
    is_liked: bool = False

    class Config:
        orm_mode = True

class FeedUpdate(BaseModel):
    content: Optional[str] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    subject: Optional[str] = None 