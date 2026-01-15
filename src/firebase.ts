// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLaZ6o4W8ZQ5XagTiw4MOJsje0y4m6Fjw",
  authDomain: "einkaufsliste2-b05d3.firebaseapp.com",
  projectId: "einkaufsliste2-b05d3",
  storageBucket: "einkaufsliste2-b05d3.firebasestorage.app",
  messagingSenderId: "361951751851",
  appId: "1:361951751851:web:52e399d1f86eb79e6f91ee"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
