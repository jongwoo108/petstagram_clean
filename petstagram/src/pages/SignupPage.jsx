// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/pages/AuthPage.css"; // 동일한 스타일 사용

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await api.post("/users/signup", {
        email,
        username: nickname,
        password,
      });

      alert("회원가입 성공! 로그인 해주세요.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg("회원가입 실패: 이미 존재하는 이메일일 수 있습니다.");
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          닉네임
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">회원가입</button>
      </form>
      {errorMsg && <p className="error-message">{errorMsg}</p>}
      <p>
        이미 계정이 있으신가요?{" "}
        <button onClick={() => navigate("/login")} className="link-button">
          로그인
        </button>
      </p>
    </div>
  );
};

export default SignupPage;
