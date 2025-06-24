import React, { useState, useEffect } from 'react';
import '../styles/components/MainFeedCard.css';
import defaultProfilePic from '../assets/default.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const MainFeedCard = React.forwardRef(({ feed, onCardClick, isLiked, likeCount, onToggleLike }, ref) => {
  const [modalOpen, setModalOpen] = useState(false);
  const initialLayout = feed?.layout_type || 3;
  const [dynamicLayout, setDynamicLayout] = useState(initialLayout);
  const [isSquare, setIsSquare] = useState(false);
  const title = feed?.title || feed?.subject || '';
  const likes = feed?.likes ?? 0;
  const images = Array.isArray(feed?.images) ? feed.images : [];
  const author = feed?.author && typeof feed.author === 'object' ? feed.author : { nickname: '알 수 없음', profilePic: '' };

  const placeholderColors = {
    1: 'linear-gradient(to bottom, #a8c0ff, #3f2b96)',
    2: 'lightcoral',
    3: 'lightsalmon',
    4: 'lightgreen',
  };

  let image = images[0];
  let imageUrl = (image && typeof image === 'string' && image.trim()) ? image : null;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = API_URL + imageUrl;
  }

  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio > 1.3) setDynamicLayout(1); // 가로로 긴 이미지
        else if (ratio < 0.8) setDynamicLayout(2); // 세로로 긴 이미지
        else {
          setDynamicLayout(4); // 정사각형/비슷한 비율
          setIsSquare(true);
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const backgroundStyle = {
    background: placeholderColors[dynamicLayout] || 'lightgrey',
  };

  const profilePic = author.profilePic && author.profilePic.trim() !== '' ? author.profilePic : defaultProfilePic;
  const nickname = author.nickname || '알 수 없음';

  const closeModal = () => setModalOpen(false);

  // object-fit 예외 처리: 정사각형 이미지는 타입 4(정사각형 카드)에만, 그 외 타입에 들어가면 contain
  let objectFit = 'cover';
  if ((dynamicLayout === 1 || dynamicLayout === 2) && isSquare) {
    objectFit = 'contain';
  }

  return (
    <div
      ref={ref}
      className={`main-feed-card layout-type-${feed.grid_type || '1x1'}`}
      onClick={() => onCardClick ? onCardClick(feed) : null}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="main-feed-card__image"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            display: 'block',
            background: '#fff'
          }}
        />
      ) : (
        <div className="card-image-placeholder" style={backgroundStyle}></div>
      )}
      <div className="card-overlay">
        <h3 className="card-title">{title}</h3>
        <div className="card-footer">
          <div className="author-info">
            <img src={profilePic} alt={nickname} className="author-avatar" />
            <span className="author-name">{nickname}</span>
          </div>
          <div className="likes-info">
            <span
              className="like-button"
              onClick={e => {
                e.stopPropagation();
                if (onToggleLike) onToggleLike(feed);
              }}
              title={isLiked ? "좋아요 취소" : "좋아요"}
              style={{ cursor: 'pointer', color: isLiked ? 'red' : 'gray', fontSize: '1.2em', userSelect: 'none' }}
            >
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="like-count" style={{ marginLeft: 4 }}>{likeCount ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MainFeedCard; 