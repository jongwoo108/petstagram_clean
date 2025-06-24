// // src/pages/SplashPage.jsx
// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/main_logo.png"; // 이미지 경로 맞게 조정

// const SplashPage = () => {
//   const navigate = useNavigate();

//   // 3초 후 자동 이동
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigate("/mypage");
//     }, 3000);

//     return () => clearTimeout(timer); // 컴포넌트 언마운트 시 제거
//   }, [navigate]);

//   return (
//     <div
//       onClick={() => navigate("/mypage")}
//       style={{
//         height: "100vh",
//         backgroundColor: "#fff",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         cursor: "pointer",
//         transition: "opacity 0.5s"
//       }}
//     >
//       <img
//         src={logo}
//         alt="Petstagram Logo"
//         style={{ width: "60%", maxWidth: "500px" }}
//       />
//     </div>
//   );
// };
// src/pages/SplashPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/main_logo.png";
import "../styles/pages/SplashPage.css"; // ✅ 경로 확인

const SplashPage = () => {
  const navigate = useNavigate();
  const [fadeClass, setFadeClass] = useState("fade-in");

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeClass("fade-out"), 2500); // 페이드아웃 시작
    const timer2 = setTimeout(() => navigate("/main"), 3000);      // 페이지 전환

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate]);

  return (
    <div className={`splash-container ${fadeClass}`} onClick={() => navigate("/main")}>
      <img src={logo} alt="Petstagram Logo" className="splash-logo" />
    </div>
  );
};

export default SplashPage;
