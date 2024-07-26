import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { fs_db, auth } from "../models/services/firebase";

export const useUserStore = create((set) => ({
  // store all the current user data from firebase
  currentUser: null,
  // store user's friend list with id and avatar's url
  auth: auth,
  friendsData: [],
  requestsData: [],
  isLoading: false,
  fetchUserInfo: async (id) => {
    if (!id) return set({ currentUser: null, friendsData: [], requestsData: [], isLoading: false });

    try {
      const docRef = doc(fs_db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        const fsId = userData.friends;
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

        const rsId = userData.friendRequests;
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

        set({ currentUser: docSnap.data(), friendsData: fsData, requestsData: rsData, isLoading: false });
      } else {
        set({ currentUser: null, friendsData: [], requestsData: [], isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, friendsData: [], requestsData: [], isLoading: false });
    }
  },
}));