# config.py
from dotenv import load_dotenv
import os

load_dotenv()  # .env 파일 로드

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
