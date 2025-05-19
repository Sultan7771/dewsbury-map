import React from "react";
import ReactDOM from "react-dom/client";
import RoomIcon from "@mui/icons-material/Room";

// Function to create a custom marker with a React component
const createCustomMarker = () => {
  console.log("Creating custom marker...");
  
  // Create a div element for the marker
  const el = document.createElement("div");
  el.style.width = "50px";
  el.style.height = "50px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.backgroundColor = "#ff5733"; // Brighter marker color
  el.style.borderRadius = "50%";
  el.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
  el.style.color = "#fff";
  el.style.zIndex = "1000"; // Ensure it appears on top of the map elements

  try {
    // Use ReactDOM to render the MUI icon inside the div using createRoot
    const root = ReactDOM.createRoot(el);
    root.render(<RoomIcon style={{ color: "#fff", fontSize: 34 }} />);
    console.log("Marker created successfully.");
  } catch (error) {
    console.error("Error creating marker:", error);
  }

  return el;
};

export default createCustomMarker;
