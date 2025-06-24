import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from 'react';
import './App.css';
import AppRouter from './routes/AppRouter';
import axios from 'axios';

function App() {
  const [feeds, setFeeds] = useState([]);

  // 전체 피드 목록 불러오기 함수
  const fetchFeeds = async () => {
    try {
      const nickname = sessionStorage.getItem('nickname');
      const res = await axios.get('http://localhost:8000/feeds/', {
        params: { username: nickname }
      });
      setFeeds(res.data);
    } catch (err) {
      console.error('피드 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <AppRouter feeds={feeds} setFeeds={setFeeds} fetchFeeds={fetchFeeds} />
      </div>
    </BrowserRouter>
  );
}

export default App;