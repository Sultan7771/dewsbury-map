import React from 'react';
import './BuildingInfoWindow.css';

const BuildingInfoWindow = ({ building }) => {
  if (!building) return null;

  const height = building.properties.calculatedHeight || 
                building.properties.relativeheightmaximum ||
                building.properties.height_relativemax_m ||
                building.properties.absoluteheightmaximum ||
                'N/A';

  return (
    <div className="building-info-window">
      <div className="building-info-header">
        <h3>Building Information</h3>
      </div>
      <div className="building-info-content">
        <div className="info-row">
          <span className="info-label">OS ID:</span>
          <span className="info-value">{building.properties.osid || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Height:</span>
          <span className="info-value">{height} meters</span>
        </div>
      </div>
    </div>
  );
};

export default BuildingInfoWindow;