// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDoa7SgMbwwztp9LRwktxE15_8j4h2gk_w",
  authDomain: "qualitysystem-9728c.firebaseapp.com",
  projectId: "qualitysystem-9728c",
  storageBucket: "qualitysystem-9728c.appspot.com",
  messagingSenderId: "353433399907",
  appId: "1:353433399907:web:94fbf6011008646defbe56",
  measurementId: "G-0TK4F1YR6T"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_FUNCTIONS = getFunctions(FIREBASE_APP);