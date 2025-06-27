from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import engine, Base
from routes import users, events
from fastapi.staticfiles import StaticFiles

# CORS 설정 추가
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173",
                   "http://localhost:3000",
                   "http://127.0.0.1:3000",
                   "http://fastapi-backend:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

# 라우터 등록
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(events.router, prefix="/feeds", tags=["feeds"])

# uploaded_images 폴더를 static으로 서빙
app.mount("/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images")

@app.get("/")
def root():
    return {"message": "Petstagram FastAPI 백엔드 동작 중!"}
