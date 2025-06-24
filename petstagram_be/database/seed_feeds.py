import json
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.events import Feed


def seed_feeds():
    db: Session = SessionLocal()
    
    # 목업 데이터 ID 범위에 해당하는 기존 데이터 삭제
    with open("database/feeds_mock.json", "r", encoding="utf-8") as f:
        feeds = json.load(f)
        mock_ids = [feed['id'] for feed in feeds]
        if mock_ids:
            db.query(Feed).filter(Feed.id.in_(mock_ids)).delete(synchronize_session=False)
            db.commit()

    # 새 목업 데이터 추가
    for feed in feeds:
        db_feed = Feed(
            id=feed["id"],
            username=feed["username"],
            subject=feed.get("subject", ""),
            images=json.dumps(feed["images"]),
            content=feed["content"],
            tags=json.dumps(feed.get("tags", [])),
            category=feed["category"]
        )
        db.add(db_feed)
    
    db.commit()
    db.close()
    print("목업 피드 데이터가 성공적으로 DB에 저장되었습니다.")

if __name__ == "__main__":
    seed_feeds() 