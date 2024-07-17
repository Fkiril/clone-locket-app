import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { fs_db } from "../models/services/firebase";

export const useUserStore = create((set) => ({
  currentUser: null,
  friendsData: [],
  isLoading: true,
  fetchUserInfo: async (id) => {
    if (!id) return set({ currentUser: null, friendsData: [], isLoading: false });

    try {
      const docRef = doc(fs_db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const fIds = userData.friends;
        const fDatas = await Promise.all(
          fIds.map(async (fIds) => {
            const fDocRef = doc(fs_db, "users", fIds);
            const fDocSnap = await getDoc(fDocRef);
            return fDocSnap.exists() ? {
              id: fDocSnap.data().id,
              avatar: fDocSnap.data().avatar
            } : null;
          })
        )

        set({ currentUser: docSnap.data(), friendsData: fDatas, isLoading: false });
      } else {
        set({ currentUser: null, friendsData: [], isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, friendsData: [], isLoading: false });
    }
  },
}));