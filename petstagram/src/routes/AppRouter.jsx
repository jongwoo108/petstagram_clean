// import { Route, Routes } from "react-router-dom";
// import SplashPage from "../pages/SplashPage";       // ✅ 추가
// import MyFeedNetPage from "../pages/MyFeedNetPage";
// import MainPage from "../pages/MainPage";
// import PostFeedPage from "../pages/PostFeedPage";

// function AppRouter({ feeds, setFeeds }) {
//   return (
//     <Routes>
//       <Route path="/" element={<SplashPage />} />                        {/* ✅ 스플래시 페이지로 변경 */}
//       <Route path="/main" element={<MainPage feeds={feeds} />} />     {/* ✅ MainPage는 /mypage로 이동 */}
//       {/* <Route path="/" element={<MainPage />} /> */}
//       <Route path="/post" element={<PostFeedPage setFeeds={setFeeds} />} />
//       <Route path="/myfeednet" element={<MyFeedNetPage feeds={feeds} />} />  // ✅ 여기 중요
//     </Routes>
//   );
// }

// export default AppRouter;

// src/routes/AppRouter.jsx
import { Route, Routes } from "react-router-dom";
import MyFeedNetPage from "../pages/MyFeedNetPage";
import MainPage from "../pages/MainPage";
import PostFeedPage from "../pages/PostFeedPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

function AppRouter({ feeds, setFeeds, fetchFeeds }) {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/post" element={<PostFeedPage />} />
      <Route path="/myfeednet" element={<MyFeedNetPage />} />
    </Routes>
  );
}

export default AppRouter;