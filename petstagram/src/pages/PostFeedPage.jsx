import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import { categoryMap } from "../constants/categoryMap";
import "../styles/pages/PostFeedPage.css";
import api from "../api/api";

const PostFeedPage = () => {
  const [images, setImages] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (images.length === 0) {
      setToast("이미지를 1장 이상 첨부해주세요.");
      return;
    }
    if (!subject.trim()) {
      setToast("제목을 입력해주세요.");
      return;
    }
    setLoading(true);
    const nickname = sessionStorage.getItem('nickname');
    const formData = new FormData();
    images.forEach(imgObj => {
      formData.append("images", imgObj.file);
    });
    formData.append("username", nickname);
    formData.append("subject", subject);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("tags", JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(Boolean)));
    try {
      await api.post(`/feeds/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImages([]);
      setSubject("");
      setContent("");
      setTags("");
      setCategory(1);
      setToast("피드가 성공적으로 등록되었습니다!");
      setTimeout(() => {
        navigate("/myfeednet");
      }, 1200);
    } catch (err) {
      setErrorMsg("업로드 실패: " + err.message);
      setToast("업로드 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-container">
      <div className="write-topbar">
        <button
          className="icon-exit-btn"
          type="button"
          onClick={() => navigate('/myfeednet')}
          aria-label="나가기"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#4e8cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <h2 className="write-title">피드 작성</h2>
      <form onSubmit={handleSubmit} className="feed-form">
        <div className="form-section">
          <ImageUploader images={images} setImages={setImages} loading={loading} />
        </div>
        <div className="form-section">
          <label className="input-label" htmlFor="subject-input">
            <span className="input-icon">📝</span> 제목
          </label>
          <input
            id="subject-input"
            type="text"
            className="subject-input"
            placeholder="우리집 고양이의 귀여운 일상"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="form-section">
          <label className="input-label" htmlFor="content-input">
            <span className="input-icon">🗒️</span> 내용
          </label>
          <textarea
            id="content-input"
            className="content-input"
            placeholder="오늘은 우리집 고양이가 창밖을 바라보며 귀엽게 졸았어요!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div className="form-section">
          <label className="input-label" htmlFor="tag-input">
            <span className="input-icon">#</span> 태그
          </label>
          <input
            id="tag-input"
            type="text"
            className="tag-input"
            placeholder="고양이, 산책, 귀여움"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="tag-desc">쉼표(,)로 구분해 여러 태그를 입력할 수 있습니다. 예: <span>고양이, 산책, 귀여움</span></div>
        </div>
        <div className="form-section">
          <div className="category-select">
            <label>카테고리 선택: </label>
            <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
              {Object.entries(categoryMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ height: '16px' }} />
        <button type="submit" className="submit-btn" disabled={images.length === 0 || loading}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </form>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      {toast && <div className="toast-msg">{toast}</div>}
      {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
    </div>
  );
};

export default PostFeedPage;
