import React from "react";
import FeedCard from "./FeedCard";
import "../styles/components/FeedList.css";

const FeedList = ({ feeds }) => {
  if (!Array.isArray(feeds) || feeds.length === 0) {
    return <p>피드가 없습니다.</p>;
  }

  return (
    <div className="feed-list"> {/* ✅ 2열 그리드용 컨테이너 */}
      {feeds.map((feed) => (
        <FeedCard key={feed.id} feed={feed} />
      ))}
    </div>
  );
};

export default FeedList;
