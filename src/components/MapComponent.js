import React, { useEffect, useRef, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../MapBoxConfig";
import BuildingInfoWindow from "./BuildingInfoWindow";
import Navbar from "./NavBar";
import FeedWindow from "./FeedWindow";
import ProfileWindow from "./ProfileWindow";
import { AuthContext } from "../AuthContext";
import { initializeMap } from "../functions/initializeMap";

import "./MapComponent.css";

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = () => {
  const { logout } = useContext(AuthContext);
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) {
      initializeMap(mapContainer, setMap, setSelectedBuilding, markerRef);
    }

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
  };

  return (
    <div className="map-container">
      <div
        ref={mapContainer}
        className="mapboxgl-map"
        style={{ height: "100vh" }}
      />
      {selectedBuilding && (
        <BuildingInfoWindow
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
      <div className="feed-window-wrapper">
        <FeedWindow />
      </div>
      {showProfile && (
        <div className="profile-window-wrapper">
          <ProfileWindow onClose={toggleProfile} />
        </div>
      )}
      <Navbar toggleProfile={toggleProfile} />
    </div>
  );
};

export default MapComponent;
