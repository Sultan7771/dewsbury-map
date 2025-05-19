import React, { useState } from "react";
import "./FeedWindow.css";
import BusinessIcon from "@mui/icons-material/Business";
import CoffeeIcon from "@mui/icons-material/Coffee";
import WorkIcon from "@mui/icons-material/Work";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";

const FeedWindow = () => {
  // Define the icons for each business type
  const iconMap = {
    coffee: <CoffeeIcon fontSize="large" />,
    tech: <WorkIcon fontSize="large" />,
    bakery: <BakeryDiningIcon fontSize="large" />,
    default: <BusinessIcon fontSize="large" />,
  };

  // Temporary data to simulate posts
  const tempPosts = [
    {
      icon: iconMap.coffee,
      name: "BizMap Coffee Co.",
      timestamp: "2 hours ago",
      content: "New espresso blend available!",
    },
    {
      icon: iconMap.tech,
      name: "TechHub Solutions",
      timestamp: "1 day ago",
      content: "We're hiring! Check out our latest openings.",
    },
    {
      icon: iconMap.bakery,
      name: "Green Leaf Bakery",
      timestamp: "3 days ago",
      content: "Fresh croissants every morning. Visit us!",
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
                {post.icon} {/* Render the MUI icon */}
              </div>
              <div className="business-info">
                <h4>{post.name}</h4>
                <p className="timestamp">{post.timestamp}</p>
              </div>
            </div>
            <div className="feed-content">
              <p>{post.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedWindow;
