import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";

export const useUserStore = create((set, get) => ({
  currentUser: null,
  friendDatas: [],
  requestDatas: [],
  blockedDatas: [],
  pictureDatas: [],
  isFetching: false,
  fetchUserInfo: async (id) => {
    if (!id) return set({
      currentUser: null,
      friendDatas: [],
      requestData: [],
      blockedDatas: [],
      pictureDatas: [],
      isFetching: false
    });

    try {
      console.log(`fetching user's info with id: ${id}`);
      get().isFetching = true;

      const userData = await getDocDataById("users", id);
      const fDatas = [];
      const rDatas = [];
      const bDatas = [];
      const picDatas = [];

      if (userData) {

        const fIds = userData.friends;
        if (fIds && fIds.length > 0) {
          await Promise.all(
            fIds.map(async (fId) => {
              const fData = await getDocDataById("users", fId);
              if (fData) {
                fDatas.push({
                  id: fData.id,
                  name: fData.userName,
                  email: fData.email,
                  avatar: fData.avatar
                });
              }
            })
          );
        }
        

        const rIds = userData.friendRequests;
        if (rIds && rIds.length > 0) {
          await Promise.all(
            rIds.map(async (rId) => {
              const rData = await getDocDataById("users", rId);
              if (rData) {
                rDatas.push({
                  id: rData.id,
                  name: rData.userName,
                  email: rData.email,
                  avatar: rData.avatar
                });
              }
            })
          );
        }
        

        const bIds = userData.blockeds;
        if (bIds && bIds.length > 0) {
          await Promise.all(
            bIds.map(async (bId) => {
              const bData = await getDocDataById("users", bId);
              if (bData) {
                bDatas.push({
                  id: bData.id,
                  name: bData.userName,
                  email: bData.email,
                  avatar: bData.avatar
                });
              }
            })
          );
        }

        const picIds = userData.picturesCanSee;
        if (picIds && picIds.length > 0) {
          await Promise.all(
            picIds.map(async (picId) => {
              const picData = await getDocDataById("pictures", picId);
              if (picData) {
                picDatas.push({
                  id: picData.id,
                  ownerId: picData.ownerId,
                  url: picData.url,
                  text: picData.text,
                  uploadTime: picData.uploadTime
                });
              }
            })
          );
        }

        set({ 
          currentUser: userData,
          friendDatas: fDatas,
          requestDatas: rDatas, 
          blockedDatas: bDatas, 
          pictureDatas: picDatas,
          isFetching: false 
        });
      } else {
          return set({
            currentUser: null,
            friendDatas: [],
            requestData: [],
            blockedDatas: [],
            pictureDatas: [],
            isFetching: false
          });
      }
    } catch (err) {
      console.log(err);
      return set({
          currentUser: null,
          friendDatas: [],
          requestData: [],
          blockedDatas: [],
          pictureDatas: [],
          isFetching: false
      });
    }
  },
}));
