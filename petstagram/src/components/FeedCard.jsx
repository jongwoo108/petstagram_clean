// FeedCard.jsx
import React, { useState } from "react";
import "../styles/components/FeedCard.css";
import { categoryMap } from "../constants/categoryMap";

const FeedCard = ({ feed, layout = "default", onToggleLike }) => {
  const [current, setCurrent] = useState(0);
  const images = feed.images || [feed.image];

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const cardClass = `feed-card layout-${layout}`;

  return (
    <div className={cardClass}>
      <div className="feed-top">
        <div className="profile-info">
          <img
            src={feed.profileImage || "/assets/images/default-profile.png"}
            alt="프로필"
            className="profile-img"
          />
          <span className="username">{feed.username}</span>
        </div>
        <button className="more-btn">•••</button>
      </div>

      <div className="image-slider">
        {feed.category && categoryMap[feed.category] && (
          <div className="category-stamp">
            <span className="category-icon">{categoryMap[feed.category].icon}</span>
            <span className="category-label">{categoryMap[feed.category].name}</span>
          </div>
        )}

        <img src={images[current]} alt="피드 이미지" className="feed-image" />

        {images.length > 1 && (
          <>
            <button className="slider-btn left" onClick={prev}>◀</button>
            <button className="slider-btn right" onClick={next}>▶</button>
            <div className="dot-indicator">
              {images.map((_, idx) => (
                <span key={idx} className={idx === current ? "dot active" : "dot"} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="feed-content">
        <div className="action-icons">
          <span onClick={() => onToggleLike(feed.id, feed.is_liked)}>❤️</span>
          <span>💬</span>
        </div>

        <div className="feed-text">
          <strong>{feed.username}</strong>
          <div className="feed-subject">{feed.subject}</div>
          <div className="feed-content">{feed.content}</div>
        </div>

        <div className="feed-tags">
          {feed.tags?.map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="feed-date">{feed.createdAt}</div>
      </div>
    </div>
  );
};

export default FeedCard;
