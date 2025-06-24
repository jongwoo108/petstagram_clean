import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainFeedCard from '../components/MainFeedCard';
import '../styles/pages/MainPage.css';
import logo from '../assets/main_logo.png';
import { categoryMap } from '../constants/categoryMap';
import defaultProfilePic from '../assets/default.png';

// 모달 컴포넌트
const Modal = ({ feed, onClose }) => {
  if (!feed) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div
          className="modal-image"
          style={{
            background: `linear-gradient(to top, #d299c2, #fef9d7)`,
            height: '300px',
          }}
        ></div>
        <div className="modal-text-content">
          <h2>{feed.title}</h2>
          <p>{feed.content}</p>
        </div>
      </div>
    </div>
  );
};

// X 표시한 타입(특히 가로로 긴 빈 카드 등) 제거, 3가지 타입만 남김
const GRID_LAYOUT = [
  { type: '2x2' }, { type: '1x1' }, { type: '1x2' },
  { type: '1x1' }, { type: '1x2' },
  { type: '1x1' }, { type: '1x1' },
];

// 타입 매핑: 이미지 비율 → 셀 타입
function getFeedTypeByRatio(ratio) {
  if (ratio < 0.8) return '1x2'; // 세로
  if (ratio > 1.3) return '2x2'; // 큰 정사각형(가로로 넓은 이미지)
  if (ratio >= 0.8 && ratio <= 1.3) return '1x1'; // 정사각형
  return '1x1';
}

const MainPage = ({ feeds, setFeeds, fetchFeeds }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const observer = useRef();
  const isLoggedIn = !!sessionStorage.getItem('nickname');
  const myNickname = sessionStorage.getItem('nickname');
  const [typedFeeds, setTypedFeeds] = useState([]);

  // 내 피드 제외 + 카테고리 필터링
  const filteredFeeds = selectedCategory === null
    ? feeds.filter(feed => feed.username !== myNickname)
    : feeds.filter(feed => feed.category === selectedCategory && feed.username !== myNickname);

  // 이미지 비율에 따라 타입 선정
  useEffect(() => {
    const assignTypes = async () => {
      const results = await Promise.all(filteredFeeds.map(async (feed) => {
        const images = Array.isArray(feed.images) ? feed.images : [];
        let imageUrl = images[0];
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = import.meta.env.VITE_API_URL + imageUrl;
        }
        if (!imageUrl) return { ...feed, grid_type: '1x1' };
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            resolve({ ...feed, grid_type: getFeedTypeByRatio(ratio) });
          };
          img.onerror = () => resolve({ ...feed, grid_type: '1x1' });
          img.src = imageUrl;
        });
      }));
      setTypedFeeds(results);
    };
    assignTypes();
  }, [filteredFeeds]);

  // 타입별로 피드 큐 생성
  const feedsByType = { '1x1': [], '1x2': [], '2x2': [] };
  typedFeeds.forEach(feed => {
    const t = feed.grid_type || '1x1';
    feedsByType[t].push(feed);
  });

  // 그리드에 타입이 맞는 피드만 배치, 없으면 그 타입의 빈 칸(placeholder)
  const gridFeeds = GRID_LAYOUT.map((cell, idx) => {
    if (feedsByType[cell.type] && feedsByType[cell.type].length > 0) {
      return { ...feedsByType[cell.type].shift(), grid_type: cell.type };
    }
    // 타입이 맞는 빈 칸(placeholder)로 채움
    return { id: `empty-${idx}`, isPlaceholder: true, grid_type: cell.type };
  });

  const handleCardClick = (feed) => setSelectedFeed(feed);
  const closeModal = () => setSelectedFeed(null);
  const handleSearch = () => {
    // 검색 버튼 클릭 시 동작 (이미 searchedFeeds로 필터링됨)
  };

  // 좋아요 상태 관리
  const handleToggleLike = async (feed) => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const username = sessionStorage.getItem('nickname');
    const isLiked = feed.is_liked || false;
    const url = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/feeds/${feed.id}/like`;
    try {
      let res;
      if (!isLiked) {
        res = await fetch(url, {
          method: 'POST',
          body: new URLSearchParams({ username }),
        });
      } else {
        res = await fetch(url, {
          method: 'DELETE',
          body: new URLSearchParams({ username }),
        });
      }
      const data = await res.json();
      if (res.ok) {
        setTypedFeeds(prev => prev.map(f =>
          f.id === feed.id
            ? { ...f, is_liked: !isLiked, likes: data.likes }
            : f
        ));
      } else {
        alert(data.detail || data.message || '좋아요 처리 중 오류 발생');
      }
    } catch (err) {
      alert('네트워크 오류');
    }
  };

  return (
    <div className="main-feed-wrapper">
      {/* Header and Buttons */}
      <span onClick={() => { if (isLoggedIn) { sessionStorage.clear(); navigate('/login'); } else { navigate('/login'); }}} className="login-logout-button" >
        {isLoggedIn ? 'Logout' : 'Login'}
      </span>
      <div className="main-header">
        <img src={logo} alt="Petstagram Logo" className="main-logo" />
      </div>
      <div className="top-buttons">
        <button className="my-feed-button" onClick={() => { if (!isLoggedIn) { alert('로그인이 필요합니다.'); navigate('/login'); } else { navigate('/myfeednet'); }}}>
          내 피드 보기
        </button>
      </div>
      <h2>🐾 전체 피드 (레이아웃 테스트)</h2>
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="관심 있는 내용을 검색해보세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>
      <div className="filter-buttons">
        <button className={selectedCategory === null ? 'active' : ''} onClick={() => setSelectedCategory(null)} >
          전체
        </button>
        {Object.entries(categoryMap).map(([key, value]) => (
          <button key={key} className={selectedCategory === Number(key) ? 'active' : ''} onClick={() => setSelectedCategory(Number(key))} >
            {value.icon} {value.name}
          </button>
        ))}
      </div>
      {/* Feed Grid */}
      <div className="main-feed-grid">
        {gridFeeds.map((feed, idx) =>
          !feed.isPlaceholder ? (
            <MainFeedCard
              key={feed.id}
              feed={feed}
              gridType={feed.grid_type}
              isLiked={feed.is_liked}
              likeCount={feed.likes}
              onToggleLike={handleToggleLike}
              onCardClick={handleCardClick}
            />
          ) : (
            <div key={feed.id} className={`main-feed-card layout-type-${feed.grid_type}`} style={{ background: '#fff', borderRadius: '16px', minHeight: '150px' }} />
          )
        )}
      </div>
      {feeds.length === 0 && <div className="loading-indicator">피드가 없습니다.</div>}
      <Modal feed={selectedFeed} onClose={closeModal} />
    </div>
  );
};

export default MainPage;
