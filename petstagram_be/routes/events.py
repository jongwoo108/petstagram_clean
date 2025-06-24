from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.events import Feed, Like
from models.users import User
from schemas.events import FeedCreate, FeedRead, FeedUpdate
from typing import List, Optional
import json
import os

router = APIRouter()

BASE_URL = "http://127.0.0.1:8000"
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def safe_json_loads(val):
    if isinstance(val, list):
        return val
    try:
        loaded = json.loads(val)
        if isinstance(loaded, str):
            return json.loads(loaded)
        return loaded
    except Exception:
        return []

def to_full_url(path: str) -> str:
    if path:
        path = path.replace("\\", "/")
        if not path.startswith("/"):
            path = "/" + path
        if not path.startswith("http"):
            return f"{BASE_URL}{path}"
        return path
    return ""

@router.get("/")
def get_feeds(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    username: Optional[str] = None
):
    offset = (page - 1) * page_size
    
    # User 정보와 함께 Feed를 가져오기 위해 join 사용
    feeds_with_users = db.query(Feed, User).join(User, Feed.username == User.username).order_by(Feed.id.desc()).offset(offset).limit(page_size).all()
    
    results = []
    for feed, user in feeds_with_users:
        images_list = [to_full_url(img) for img in safe_json_loads(feed.images)]
        tags_list = safe_json_loads(feed.tags)
        # 내가 좋아요를 눌렀는지 체크
        is_liked = False
        if username:
            like = db.query(Like).join(User).filter(Like.feed_id == feed.id, User.username == username).first()
            is_liked = like is not None
        # 프론트엔드가 기대하는 데이터 구조로 가공
        feed_data = {
            "id": feed.id,
            "username": feed.username,
            "title": feed.subject, # frontend는 title을 사용
            "subject": feed.subject,
            "category": feed.category,
            "images": images_list,
            "content": feed.content,
            "tags": tags_list,
            "likes": feed.likes, # 기존의 정수형 likes
            "views": feed.views,
            "created_at": feed.created_at,
            "author": {
                "nickname": user.username,
                "profilePic": to_full_url(user.profile_image) if user.profile_image else ""
            },
            "is_liked": is_liked
        }
        results.append(feed_data)
            
    return results

@router.post("/", response_model=FeedRead)
def create_feed(
    username: str = Form(...),
    subject: str = Form(...),
    category: int = Form(...),
    content: str = Form(...),
    tags: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    if not images or len(images) == 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="이미지 파일을 1장 이상 첨부해야 합니다.")
    # 이미지 파일 저장
    image_urls = []
    for image in images:
        file_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_location, "wb") as f:
            f.write(image.file.read())
        image_urls.append(f"/{UPLOAD_DIR}/{image.filename}")

    tag_list = json.loads(tags) if tags else []
    db_feed = Feed(
        username=username,
        subject=subject,
        category=category,
        images=json.dumps(image_urls),
        content=content,
        tags=json.dumps(tag_list)
    )
    db.add(db_feed)
    db.commit()
    db.refresh(db_feed)
    
    # 여기서도 process_feed_urls 대신 직접 가공하여 반환
    images_list = [to_full_url(img) for img in safe_json_loads(db_feed.images)]
    tags_list = safe_json_loads(db_feed.tags)
    
    return FeedRead(
        id=db_feed.id,
        username=db_feed.username,
        category=db_feed.category,
        images=images_list,
        content=db_feed.content,
        tags=tags_list,
        likes=0,
        views=0,
        created_at=db_feed.created_at,
        subject=db_feed.subject,
        is_liked=False
    )

@router.get("/{feed_id}", response_model=FeedRead)
def get_feed(feed_id: int, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    return feed

@router.put("/{feed_id}", response_model=FeedRead)
def update_feed(feed_id: int, feed_update: FeedUpdate, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    if feed_update.subject is not None:
        feed.subject = feed_update.subject
    if feed_update.content is not None:
        feed.content = feed_update.content
    if feed_update.images is not None:
        feed.images = json.dumps(feed_update.images)
    if feed_update.tags is not None:
        feed.tags = json.dumps(feed_update.tags)
    db.commit()
    db.refresh(feed)
    # create_feed와 마찬가지로, process_feed_urls 대신 직접 가공
    feed_read = FeedRead.from_orm(feed)
    feed_read.images = [to_full_url(img) for img in safe_json_loads(feed.images)]
    feed_read.tags = safe_json_loads(feed.tags)
    return feed_read

@router.delete("/{feed_id}")
def delete_feed(feed_id: int, db: Session = Depends(get_db)):
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    db.delete(feed)
    db.commit()
    return {"message": "피드가 삭제되었습니다."}

@router.post("/{feed_id}/like")
def like_feed(feed_id: int, username: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    existing = db.query(Like).filter(Like.user_id == user.id, Like.feed_id == feed_id).first()
    if existing:
        return {"message": "이미 좋아요를 눌렀습니다."}
    new_like = Like(user_id=user.id, feed_id=feed_id)
    db.add(new_like)
    feed.likes += 1
    db.commit()
    return {"message": "좋아요 완료", "likes": feed.likes}

@router.delete("/{feed_id}/like")
def unlike_feed(feed_id: int, username: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    feed = db.query(Feed).filter(Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="피드를 찾을 수 없습니다.")
    existing = db.query(Like).filter(Like.user_id == user.id, Like.feed_id == feed_id).first()
    if not existing:
        return {"message": "좋아요를 누르지 않았습니다."}
    db.delete(existing)
    feed.likes = max(feed.likes - 1, 0)
    db.commit()
    return {"message": "좋아요 취소", "likes": feed.likes}
