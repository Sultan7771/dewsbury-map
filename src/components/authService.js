import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadLogo = async (userId, logo) => {
  if (!logo) return null;

  try {
    const storage = getStorage();
    const logoRef = ref(storage, `logos/${userId}/${logo.name}`);
    await uploadBytes(logoRef, logo);
    const url = await getDownloadURL(logoRef);
    return url;
  } catch (error) {
    console.error("Logo upload failed:", error);
    return null;
  }
};

export const signupUser = async (userData) => {
  try {
    const { email, password, name, userType, businessName, contact, address, industry, link, logo } = userData;

    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;

    // Upload logo if provided
    const logoUrl = await uploadLogo(user.uid, logo);

    // Save user data to Firestore
    const userDoc = {
      uid: user.uid,
      name,
      email,
      userType,
      createdAt: new Date().toISOString(),
    };

    if (userType === "business") {
      userDoc.businessName = businessName;
      userDoc.contact = contact;
      userDoc.address = address;
      userDoc.industry = industry;
      userDoc.link = link;
      userDoc.logoUrl = logoUrl;

      await setDoc(doc(FIRESTORE_DB, "businessmapbusinesses", user.uid), userDoc);
    } else {
      await setDoc(doc(FIRESTORE_DB, "businessmapusers", user.uid), userDoc);
    }

    return { success: true, user };
  } catch (error) {
    console.error("Signup error:", error.message);
    return { success: false, message: error.message };
  }
};
