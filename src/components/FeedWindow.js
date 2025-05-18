import React, { useState } from "react";
import "./FeedWindow.css";

const FeedWindow = () => {
  // Temporary data to simulate posts
  const tempPosts = [
    {
      logo: "https://via.placeholder.com/40",
      name: "BizMap Coffee Co.",
      timestamp: "2 hours ago",
      content: "New espresso blend available!",
      image: "https://via.placeholder.com/300x200",
    },
    {
      logo: "https://via.placeholder.com/40",
      name: "TechHub Solutions",
      timestamp: "1 day ago",
      content: "We're hiring! Check out our latest openings.",
    },
    {
      logo: "https://via.placeholder.com/40",
      name: "Green Leaf Bakery",
      timestamp: "3 days ago",
      content: "Fresh croissants every morning. Visit us!",
      image: "https://via.placeholder.com/300x200",
    },
  ];

  // Set the temporary posts directly on component load
  const [posts] = useState(tempPosts);

  return (
    <div className="feed-window">
      <h2 className="feed-title">Your Feed</h2>
      {posts.length === 0 ? (
        <p className="loading-feed">No posts to display. Follow more businesses!</p>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="feed-item">
            <div className="feed-header">
              <div className="business-logo">
                <img src={post.logo} alt={post.name} />
              </div>
              <div className="business-info">
                <h4>{post.name}</h4>
                <p className="timestamp">{post.timestamp}</p>
              </div>
            </div>
            <div className="feed-content">
              <p>{post.content}</p>
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt="Post" />
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedWindow;
