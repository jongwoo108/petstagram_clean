// import React from "react";
// import "../styles/components/SimpleFeedCard.css";

// const SimpleFeedCard = ({ feed, onDelete, onImageClick, onToggleLike }) => {
//   const image = feed.images?.[0] || feed.image;

//   return (
//     <div className="simple-feed-card">
//       {/* 이미지 영역 */}
//       <div
//         className="simple-feed-image-wrapper"
//         onClick={() => onImageClick(feed)}
//         style={{ cursor: "pointer" }}
//       >
//         <img src={image} alt="피드 이미지" className="simple-feed-image" />
//       </div>

//       {/* 제목 영역 */}
//       <div
//         className="simple-feed-title"
//         onClick={() => onImageClick(feed)}
//         style={{ cursor: "pointer" }}
//       >
//         {feed.subject || "제목 없음"}
//       </div>

//       {/* 좋아요 + 삭제 아이콘 */}
//       <div className="simple-feed-stats">
//         {/* 좋아요 버튼 */}
//         <button
//           className="like-button"
//           onClick={() => onToggleLike(feed.id, feed.is_liked)}
//           title={feed.is_liked ? "좋아요 취소" : "좋아요"}
//         >
//           {feed.is_liked ? "❤️" : "🤍"}{" "}
//           <span className="like-count">{feed.like_count ?? 0}</span>
//         </button>

//         {/* 삭제 버튼 */}
//         <button
//           className="delete-button"
//           onClick={() => onDelete(feed.id)}
//           title="삭제"
//         >
//           🗑️
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SimpleFeedCard;

import React, { useState, useEffect } from "react";
import "../styles/components/SimpleFeedCard.css";

const API_URL = import.meta.env.VITE_API_URL;

const SimpleFeedCard = ({ feed, onDelete, onImageClick, onToggleLike }) => {
  const [isLiked, setIsLiked] = useState(feed.is_liked);
  const [likeCount, setLikeCount] = useState(feed.like_count ?? 0);

  useEffect(() => {
    setIsLiked(feed.is_liked);
    setLikeCount(feed.like_count ?? 0);
  }, [feed.is_liked, feed.like_count]);

  const handleLikeClick = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));
    onToggleLike(feed.id, isLiked); // 외부 상태도 갱신
  };

  const image = feed.images?.[0] || feed.image;
  const imageUrl = image?.startsWith('http') ? image : (image ? API_URL + image : null);

  return (
    <div className="simple-feed-card">
      <div
        className="simple-feed-image-wrapper"
        onClick={() => onImageClick(feed)}
        style={{ cursor: "pointer" }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="피드 이미지" className="simple-feed-image" />
        ) : (
          <div className="simple-feed-image-placeholder">이미지 없음</div>
        )}
      </div>
      <div
        className="simple-feed-title"
        onClick={() => onImageClick(feed)}
        style={{ cursor: "pointer" }}
      >
        {feed.subject || "제목 없음"}
      </div>
      <div className="simple-feed-stats">
        <button
          className="like-button"
          onClick={handleLikeClick}
          title="좋아요"
        >
          {isLiked ? "❤️" : "🤍"}
          <span className="like-count">{likeCount}</span>
        </button>
        {typeof onDelete === 'function' && (
          <button
            className="delete-button"
            onClick={() => onDelete(feed.id)}
            title="삭제"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleFeedCard;

