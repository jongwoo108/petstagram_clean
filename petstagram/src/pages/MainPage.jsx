import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainFeedCard from '../components/MainFeedCard';
import '../styles/pages/MainPage.css';
import logo from '../assets/main_logo.png';
import { categoryMap } from '../constants/categoryMap';
import defaultProfilePic from '../assets/default.png';
import axios from 'axios';

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

const MainPage = () => {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const observer = useRef();
  const isLoggedIn = !!sessionStorage.getItem('nickname');
  const myNickname = sessionStorage.getItem('nickname');
  const [typedFeeds, setTypedFeeds] = useState([]);

  // 1. selectedCategory, searchQuery가 바뀔 때 page만 1로 초기화 (page가 1이 아닐 때만, setFeeds 등은 호출하지 않음)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // page가 1이면 아무것도 하지 않음
  }, [selectedCategory, searchQuery]);

  // 2. page가 바뀔 때만 fetchData 실행 (setFeeds, setHasMore, setLoading 등은 여기서만)
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/feeds/', {
          params: {
            page,
            page_size: 10,
            username: myNickname,
          },
        });
        if (!ignore) {
          if (res.data.length < 10) setHasMore(false);
          setFeeds(prev => (page === 1 ? res.data : [...prev, ...res.data]));
        }
      } catch (err) {
        if (!ignore) setHasMore(false);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [page, myNickname]);

  // Intersection Observer로 마지막 카드 감지 (항상 최신 page로 요청)
  const lastFeedRef = useCallback(node => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // 내 피드 제외 + 카테고리 필터링 (타입 강제 변환, useMemo로 메모이제이션)
  const filteredFeeds = useMemo(() => {
    return selectedCategory === null
      ? feeds.filter(feed => feed.username !== myNickname)
      : feeds.filter(feed => Number(feed.category) === Number(selectedCategory) && feed.username !== myNickname);
  }, [feeds, selectedCategory, myNickname]);

  console.log(
    'category:', selectedCategory,
    'feeds:', feeds.map(f => f.category),
    'filteredFeeds:', filteredFeeds.map(f => f.category)
  );

  // 이미지 비율에 따라 타입 선정
  useEffect(() => {
    let isActive = true;
    if (filteredFeeds.length === 0) {
      setTypedFeeds([]);
      return;
    }
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
      if (isActive) setTypedFeeds(results);
    };
    assignTypes();
    return () => { isActive = false; };
  }, [filteredFeeds]);

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
        // feeds의 해당 피드도 업데이트
        setFeeds(prev => prev.map(f =>
          f.id === feed.id
            ? { ...f, is_liked: !isLiked, likes: data.likes }
            : f
        ));
        // typedFeeds도 즉시 반영 (UX 개선)
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

  // 마지막 줄 placeholder 개수 계산
  const remainder = typedFeeds.length % 3;
  const placeholders = remainder === 0 ? 0 : 3 - remainder;

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
      <h2>🐾 반려동물 기록 일지</h2>
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
      {/* Feed Grid - 동적 렌더링 */}
      <div className="main-feed-grid">
        {typedFeeds.map((feed, idx) => (
          <MainFeedCard
            key={feed.id}
            feed={feed}
            gridType={feed.grid_type}
            isLiked={feed.is_liked}
            likeCount={feed.likes}
            onToggleLike={handleToggleLike}
            onCardClick={handleCardClick}
            ref={idx === typedFeeds.length - 1 ? lastFeedRef : null}
          />
        ))}
        {[...Array(placeholders)].map((_, idx) => (
          <div key={`ph-${idx}`} className="main-feed-card placeholder" style={{ background: 'transparent', boxShadow: 'none' }} />
        ))}
      </div>
      {loading && <div className="loading-indicator">로딩 중...</div>}
      {!hasMore && typedFeeds.length === 0 && <div className="loading-indicator">피드가 없습니다.</div>}
      {!hasMore && typedFeeds.length > 0 && (
        <div className="end-indicator" style={{ textAlign: 'center', color: '#888', margin: '32px 0', fontSize: '1.1rem' }}>
          모든 피드를 다 보셨습니다 🐾
        </div>
      )}
      <Modal feed={selectedFeed} onClose={closeModal} />
    </div>
  );
};

export default MainPage;
