// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/pages/AuthPage.css"; // 스타일은 선택

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/users/login", {
        email: email,
        password: password,
      });

      const { access_token, username } = res.data;
      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("nickname", username);
      alert("로그인 성공!");
      navigate("/main");
    } catch (err) {
      console.error(err);
      setErrorMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">로그인</button>
      </form>
      {errorMsg && <p className="error-message">{errorMsg}</p>}
      <p>
        아직 계정이 없으신가요?{" "}
        <button onClick={() => navigate("/signup")} className="link-button">
          회원가입
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
