import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryMap } from "../constants/categoryMap";
import "../styles/pages/MyFeedNetPage.css";
import SimpleFeedCard from "../components/SimpleFeedCard";
import defaultProfile from "../assets/default.png";
import api from "../api/api";

const MyFeedNetPage = ({ feeds, fetchFeeds }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    pet_name: "",
    bio: "",
    profile_image: defaultProfile,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editPetName, setEditPetName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const [feedsWithLike, setFeedsWithLike] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const feedsPerPage = 4;
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [editFeedMode, setEditFeedMode] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  const myNickname = sessionStorage.getItem('nickname');

  const fetchProfile = async () => {
    if (!myNickname) return;
    try {
      const res = await api.get(`/users/profile`, {
        params: { username: myNickname },
      });
      setProfile({
        ...res.data,
        pet_name: res.data.pet_name || '',
        bio: res.data.bio || '',
      });
    } catch (err) {
      console.error("프로필 로딩 실패:", err);
    }
  };

  useEffect(() => {
    if (!myNickname) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [myNickname, navigate]);

  useEffect(() => {
    const initializedFeeds = feeds.map(feed => ({
      ...feed,
      is_liked: false,
      like_count: feed.like_count ?? 0
    }));
    setFeedsWithLike(initializedFeeds);
  }, [feeds]);


  const myFeeds = feedsWithLike.filter(feed => feed.username === myNickname);
  const filteredFeeds = selectedCategory === null ? myFeeds : myFeeds.filter(feed => feed.category === selectedCategory);
  const pageCount = Math.ceil(filteredFeeds.length / feedsPerPage);
  const paginatedFeeds = filteredFeeds.slice((currentPage - 1) * feedsPerPage, currentPage * feedsPerPage);

  const handleDeleteFeed = async (feedId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/feeds/${feedId}`);
      await fetchFeeds();
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleToggleLike = (feedId, isLiked) => {
    setFeedsWithLike(prev =>
      prev.map(feed =>
        feed.id === feedId
          ? {
              ...feed,
              is_liked: !isLiked,
              like_count: feed.like_count + (isLiked ? -1 : 1)
            }
          : feed
      )
    );
  };

  const handleNavigation = (path) => navigate(`/${path}`);

  const handleProfileUpdate = async () => {
    if (!myNickname) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!editNickname || editNickname.trim() === "") {
      alert("닉네임은 비워둘 수 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("username", myNickname);
    formData.append("new_username", editNickname);
    formData.append("pet_name", editPetName);
    formData.append("bio", editBio);
    if (editImageFile) {
      formData.append("profile_image", editImageFile);
    }

    try {
      const res = await api.put(`/users/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (res.data.username !== myNickname) {
        sessionStorage.setItem('nickname', res.data.username);
      }

      setProfile(res.data);
      setIsModalOpen(false);
      alert("프로필이 성공적으로 업데이트되었습니다.");
      if (res.data.username !== myNickname) {
        window.location.reload();
      }

    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert(err.response.data.detail);
      } else {
        console.error("프로필 업데이트 실패:", err);
        alert("프로필 업데이트에 실패했습니다.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEditImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFeedUpdate = async () => {
    try {
      await api.put(`/feeds/${selectedFeed.id}`, {
        subject: editSubject,
        content: editContent,
      });
      setEditFeedMode(false);
      await fetchFeeds();
      setSelectedFeed(null);
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  return (
    <div className="myfeed-page">
      {/* 상단 버튼 */}
      <div className="top-buttons">
        <button
          style={{
            border: '2px solid #4e8cff',
            background: 'transparent',
            color: '#4e8cff',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            marginRight: '8px',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#4e8cff';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4e8cff';
          }}
          onClick={() => handleNavigation("main")}
        >🏠 홈</button>
        <button
          style={{
            border: '2px solid #4e8cff',
            background: 'transparent',
            color: '#4e8cff',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#4e8cff';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4e8cff';
          }}
          onClick={() => handleNavigation("post")}
        >➕ 피드 만들기</button>
      </div>

      {/* 프로필 영역 */}
      <section className="profile-section">
        <img src={profile.profile_image || defaultProfile} alt="프로필" className="profile-img" />
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p className="pet-name gowun-font"><span className="label">반려동물 이름:</span> {profile.pet_name || '미설정'} 🐶 ♂️</p>
          <p className="bio gowun-font">{profile.bio || '소개글이 없습니다.'}</p>
          <button onClick={() => {
            setEditNickname(profile.username);
            setEditPetName(profile.pet_name || '');
            setEditBio(profile.bio || '');
            setEditImage(profile.profile_image);
            setEditImageFile(null);
            setIsModalOpen(true);
          }}>프로필 편집</button>
        </div>
      </section>

      {/* 게시물 목록 */}
      <section className="feed-section-wrapper">
        <h3 className="feed-title">- 내 반려동물 기록일지 -</h3>
        <p className="feed-count">총 {myFeeds.length}개의 게시물</p>

        <div className="filter-buttons">
          <button className={selectedCategory === null ? "active" : ""} onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}>전체</button>
          {Object.entries(categoryMap).map(([key, value]) => (
            <button
              key={key}
              className={selectedCategory === Number(key) ? "active" : ""}
              onClick={() => { setSelectedCategory(Number(key)); setCurrentPage(1); }}
            >{value.icon} {value.name}</button>
          ))}
        </div>

        <div className="feed-section">
          {paginatedFeeds.length === 0 ? (
            <p className="no-feed-message">해당 카테고리에 작성한 게시물이 없습니다.</p>
          ) : (
            paginatedFeeds.map(feed => (
              <SimpleFeedCard
                key={feed.id}
                feed={feed}
                onDelete={handleDeleteFeed}
                onImageClick={feed => {
                  setSelectedFeed(feed);
                  setEditSubject(feed.subject);
                  setEditContent(feed.content);
                }}
                onToggleLike={handleToggleLike}
              />
            ))
          )}
        </div>

        {pageCount > 1 && (
          <div className="pagination-controls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>이전</button>
            {[...Array(pageCount)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={currentPage === idx + 1 ? "active" : ""}
              >{idx + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>다음</button>
          </div>
        )}
      </section>

      {/* 프로필 수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>프로필 수정</h3>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <label className="profile-upload-wrapper">
                <img src={editImage || defaultProfile} alt="업로드 미리보기" className="profile-img" />
                <span className="upload-overlay">＋</span>
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
            </div>
            <div className="modal-field">
              <label>닉네임</label>
              <input type="text" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>반려동물 이름</label>
              <input type="text" value={editPetName} onChange={(e) => setEditPetName(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>소개글</label>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
            </div>
            <div className="modal-buttons">
              <button onClick={handleProfileUpdate}>저장</button>
              <button onClick={() => setIsModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 피드 모달 */}
      {selectedFeed && (
        <div className="modal-overlay" onClick={() => setSelectedFeed(null)}>
          <div className="modal-detail" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFeed(null)}>✕</button>
            {(() => {
              const image = selectedFeed.images?.[0];
              const imageUrl = image;
              return (
                <img src={imageUrl} alt="상세 이미지" className="modal-image" />
              );
            })()}
            <div className="modal-content-wrapper">
              {editFeedMode ? (
                <>
                  <div className="modal-field">
                    <label>제목</label>
                    <input value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                  </div>
                  <div className="modal-field">
                    <label>내용</label>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} />
                  </div>
                  <div className="modal-buttons">
                    <button onClick={handleFeedUpdate}>저장</button>
                    <button onClick={() => setEditFeedMode(false)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{selectedFeed.subject || "제목 없음"}</h3>
                  <p>{selectedFeed.content}</p>
                  <div className="modal-buttons">
                    <button onClick={() => setEditFeedMode(true)}>수정</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFeedNetPage; 