import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';

const BuildingPopup = ({ buildingId }) => {
  const [building, setBuilding] = useState(null);

  useEffect(() => {
    const fetchBuilding = async () => {
      const buildingRef = doc(FIRESTORE_DB, 'buildings', buildingId);
      const docSnap = await getDoc(buildingRef);
      if (docSnap.exists()) {
        setBuilding(docSnap.data());
      }
    };
    fetchBuilding();
  }, [buildingId]);

  if (!building) return null;

  return (
    <div className="popup">
      <h3>{building.name}</h3>
      <p>Height: {building.height}m</p>
      <p>Opening Times: {building.openingTimes}</p>
      <p>Sales: {building.sales}</p>
    </div>
  );
};

export default BuildingPopup;
