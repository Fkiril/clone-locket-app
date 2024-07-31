import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { fs_db, auth } from "../models/services/firebase";
import UserController from "../controllers/user-controller"; // Import UserController

export const useUserStore = create((set) => ({
  currentUser: null,
  currentUserController: null, // Add currentUserController
  auth: auth,
  friendDatas: [],
  requestDatas: [],
  blockedDatas: [],
  pictureDatas: [],
  isLoading: false,
  fetchUserInfo: async (id) => {
    if (!id) return set({
      currentUser: null,
      currentUserController: null,
      friendDatas: [],
      requestData: [],
      blockedDatas: [],
      pictureDatas: [],
      isLoading: false
    });

    try {
      const docRef = doc(fs_db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        const fIds = userData.friends || [];
        const fDatas = await Promise.all(
          fIds.map(async (fId) => {
            const fDocRef = doc(fs_db, "users", fId);
            const fDocSnap = await getDoc(fDocRef);
            return fDocSnap.exists() ? {
              id: fDocSnap.data().id,
              name: fDocSnap.data().userName,
              avatar: fDocSnap.data().avatar
            } : null;
          })
        )

        const rIds = userData.friendRequests || [];
        const rDatas = await Promise.all(
          rIds.map(async (rId) => {
            const rDocRef = doc(fs_db, "users", rId);
            const rDocSnap = await getDoc(rDocRef);
            return rDocSnap.exists() ? {
              id: rDocSnap.data().id,
              name: rDocSnap.data().userName,
              email: rDocSnap.data().email,
              avatar: rDocSnap.data().avatar
            } : null;
          })
        )

        const bIds = userData.blockeds || [];
        const bDatas = await Promise.all(
          bIds.map(async (bId) => {
            const bDocRef = doc(fs_db, "users", bId);
            const bDocSnap = await getDoc(bDocRef);
            return bDocSnap.exists() ? {
              id: bDocSnap.data().id,
              name: bDocSnap.data().userName,
              avatar: bDocSnap.data().avatar
            } : null;
          })
        )

        const picIds = userData.picturesCanSee || [];
        const picDatas = await Promise.all(
          picIds.map(async (picId) => {
            const picDocRef = doc(fs_db, "pictures", picId);
            const picDocSnap = await getDoc(picDocRef);
            return picDocSnap.exists() ? {
              id: picDocSnap.data().id,
              url: picDocSnap.data().url,
              text: picDocSnap.data().text
            } : null;
          })
        )

        set({ 
          currentUser: docSnap.data(), 
          currentUserController: new UserController(docSnap.data()), // Initialize UserController
          friendsDatas: fDatas, 
          requestDatas: rDatas, 
          blockedDatas: bDatas, 
          pictureDatas: picDatas, 
          isLoading: false 
        });
      } else {
          return set({
            currentUser: null,
            currentUserController: null,
            friendDatas: [],
            requestData: [],
            blockedDatas: [],
            pictureDatas: [],
            isLoading: false
          });
      }
    } catch (err) {
      console.log(err);
      return set({
          currentUser: null,
          currentUserController: null,
          friendDatas: [],
          requestData: [],
          blockedDatas: [],
          pictureDatas: [],
          isLoading: false
      });
    }
  },
}));
