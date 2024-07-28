import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { fs_db, auth } from "../models/services/firebase";
import UserController from "../controllers/user-controller"; // Import UserController

export const useUserStore = create((set) => ({
  currentUser: null,
  currentUserController: null, // Add currentUserController
  auth: auth,
  friendsData: [],
  requestsData: [],
  blockedData: [],
  picturesData: [],
  isLoading: false,
  fetchUserInfo: async (id) => {
    if (!id) return set({ currentUser: null, currentUserController: null, friendsData: [], requestsData: [], blockedData: [], picturesData: [], isLoading: false });

    try {
      const docRef = doc(fs_db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        const fsId = userData.friends || [];
        const fsData = await Promise.all(
          fsId.map(async (fId) => {
            const fDocRef = doc(fs_db, "users", fId);
            const fDocSnap = await getDoc(fDocRef);
            return fDocSnap.exists() ? {
              id: fDocSnap.data().id,
              name: fDocSnap.data().userName,
              avatar: fDocSnap.data().avatar
            } : null;
          })
        )

        const rsId = userData.friendRequests || [];
        const rsData = await Promise.all(
          rsId.map(async (rsId) => {
            const rDocRef = doc(fs_db, "users", rsId);
            const rDocSnap = await getDoc(rDocRef);
            return rDocSnap.exists() ? {
              id: rDocSnap.data().id,
              name: rDocSnap.data().userName,
              avatar: rDocSnap.data().avatar
            } : null;
          })
        )

        const bsId = userData.blockeds || [];
        const bsData = await Promise.all(
          bsId.map(async (bId) => {
            const bDocRef = doc(fs_db, "users", bId);
            const bDocSnap = await getDoc(bDocRef);
            return bDocSnap.exists() ? {
              id: bDocSnap.data().id,
              name: bDocSnap.data().userName,
              avatar: bDocSnap.data().avatar
            } : null;
          })
        )

        const picsId = userData.picturesCanSee || [];
        const picsData = await Promise.all(
          picsId.map(async (picId) => {
            const picDocRef = doc(fs_db, "pictures", picId);
            const picDocSnap = await getDoc(picDocRef);
            return picDocSnap.exists() ? {
              id: picDocSnap.data().id,
              url: picDocSnap.data().url,
              description: picDocSnap.data().description
            } : null;
          })
        )

        set({ 
          currentUser: docSnap.data(), 
          currentUserController: new UserController(docSnap.data()), // Initialize UserController
          friendsData: fsData, 
          requestsData: rsData, 
          blockedData: bsData, 
          picturesData: picsData, 
          isLoading: false 
        });
      } else {
        set({ currentUser: null, currentUserController: null, friendsData: [], requestsData: [], blockedData: [], picturesData: [], isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, currentUserController: null, friendsData: [], requestsData: [], blockedData: [], picturesData: [], isLoading: false });
    }
  },
}));
