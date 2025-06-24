import React from "react";
import "../styles/components/ImageUploader.css";

const ImageUploader = ({ images, setImages }) => {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미지 배열 추가
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(), //444추가
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label htmlFor="file-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>📷 이미지 업로드 (1장 이상 필수)</label>
      <label htmlFor="file-input" className="custom-file-label">
        <span className="custom-file-btn">이미지 선택</span>
      </label>
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="file-input"
        style={{ display: 'none' }}
      />
      <div className="file-info-text">
        {images.length === 0 ? '이미지를 선택해주세요.' : `이미지 ${images.length}장 선택됨`}
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ position: "relative" }}>
            <img
              src={img.preview}
              alt={`preview-${idx}`}
              width="140"
              height="140"
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="modal-close-btn image-preview-close-btn"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
