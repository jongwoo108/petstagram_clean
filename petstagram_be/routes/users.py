from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.users import User
from models.events import Feed
from schemas.users import UserCreate, UserRead, UserLogin, ProfileRead, ProfileUpdate
from passlib.context import CryptContext
from typing import Optional
import os
from config import BASE_URL

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

UPLOAD_DIR = "uploaded_images"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=UserRead)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.email == user.email) | (User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일 또는 닉네임입니다.")
    hashed_pw = pwd_context.hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    # 추후 JWT 토큰 반환 예정
    return {"message": "로그인 성공", "username": db_user.username, "access_token": "fake-token"} # 임시 토큰

@router.get("/profile", response_model=ProfileRead)
def get_profile(username: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    if db_user.profile_image and not db_user.profile_image.startswith('http'):
        db_user.profile_image = f"{BASE_URL}/{db_user.profile_image}"
        
    return db_user

@router.put("/profile", response_model=ProfileRead)
def update_profile(
    db: Session = Depends(get_db),
    username: str = Form(...),
    new_username: Optional[str] = Form(None),
    pet_name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None)
):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 닉네임 변경 처리
    if new_username and new_username.strip() and new_username != username:
        # 새로운 닉네임이 비어있지 않은지 확인
        if not new_username.strip():
            raise HTTPException(status_code=422, detail="닉네임은 비워둘 수 없습니다.")
            
        existing_user = db.query(User).filter(User.username == new_username).first()
        if existing_user:
            raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")
        
        # 피드 테이블의 username 업데이트
        db.query(Feed).filter(Feed.username == username).update({"username": new_username})
        
        db_user.username = new_username

    if pet_name is not None:
        db_user.pet_name = pet_name
    if bio is not None:
        db_user.bio = bio
    
    if profile_image:
        # 기존 이미지 삭제 로직 (선택적)
        if db_user.profile_image and os.path.exists(db_user.profile_image):
            try:
                os.remove(db_user.profile_image)
            except OSError as e:
                print(f"Error removing old profile image: {e}")

        file_location = os.path.join(UPLOAD_DIR, profile_image.filename)
        file_location = file_location.replace("\\", "/")  # 슬래시로 통일
        with open(file_location, "wb+") as file_object:
            file_object.write(profile_image.file.read())
        db_user.profile_image = file_location

    db.commit()
    db.refresh(db_user)
    
    # 전체 URL로 변환하여 반환
    if db_user.profile_image and not db_user.profile_image.startswith('http'):
        db_user.profile_image = f"{BASE_URL}/{db_user.profile_image}"

    return db_user
