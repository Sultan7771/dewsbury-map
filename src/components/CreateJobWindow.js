import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import "./CreateJobWindow.css";

const CreateJobWindow = ({ building, onClose }) => {
  const osId = building?.properties?.osid;

  const [businessName, setBusinessName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!osId) return alert("Building not selected");

    const businessData = {
      name: businessName,
      logo: logoUrl,
      contact: { email, website },
      jobs: [
        {
          title: jobTitle,
          description: jobDescription,
        },
      ],
      likes: 0,
      followers: 0,
      posts: [],
    };

    try {
      await setDoc(doc(FIRESTORE_DB, "bizmapsbusiness", osId), businessData);
      alert("Business & job info saved successfully.");
      onClose();
    } catch (error) {
      console.error("❌ Error saving business:", error);
      alert("Failed to save data.");
    }
  };

  return (
    <div className="create-job-window">
      <h2>Add Business & Job Info</h2>
      <form onSubmit={handleSubmit}>
        <label>Business Name:</label>
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />

        <label>Logo URL:</label>
        <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />

        <label>Job Title:</label>
        <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />

        <label>Job Description:</label>
        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required />

        <label>Email:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Website:</label>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} />

        <div className="actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobWindow;
