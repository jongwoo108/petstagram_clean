from sqlalchemy import Column, Integer, String, DateTime, Text, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database.connection import Base
from .users import User

class Feed(Base):
    __tablename__ = "feeds"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    category = Column(Integer, nullable=False)
    images = Column(Text, nullable=False)  # JSON 문자열로 저장
    content = Column(Text, nullable=False)
    tags = Column(Text, nullable=True)     # JSON 문자열로 저장
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    subject = Column(String(255), nullable=True)

    likers = relationship("Like", back_populates="feed")


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feed_id = Column(Integer, ForeignKey("feeds.id"), nullable=False)

    user = relationship("User", back_populates="likes")
    feed = relationship("Feed", back_populates="likers")

    __table_args__ = (UniqueConstraint('user_id', 'feed_id', name='_user_feed_uc'),)
