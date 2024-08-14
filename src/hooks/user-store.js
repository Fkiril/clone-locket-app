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
      get().isFetching = true;
      console.log(`fetching user's info with id: ${id}`);
      
      const userData = await getDocDataById("users", id).then(async (userData) => {
        if (userData) {
          const file = (userData.avatar && userData.avatar !== "" && userData.avatar.includes("firebasestorage"))?
            await fetch(userData.avatar).then(response => response.blob())
              .then(blob => {
                console.log("Blob file:", blob);
                return blob;
              }).catch(error => {
                console.error("Error downloading file:", error);
              }) : null;

          return {
            ...userData,
            avatarFile: file,
            avatarFileUrl: file? URL.createObjectURL(file) : null
          };
        }
      });
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
                const file = (fData.avatar && fData.avatar !== "" && fData.avatar.includes("firebasestorage"))?
                  await fetch(fData.avatar).then(response => response.blob())
                    .then(blob => {
                      console.log("Blob file:", blob);
                      return blob;
                    }).catch(error => {
                      console.error("Error downloading file:", error);
                    }) : null;

                fDatas.push({
                  id: fData.id,
                  name: fData.userName,
                  email: fData.email,
                  avatar: fData.avatar,
                  avatarFile: file,
                  avatarFileUrl: file? URL.createObjectURL(file) : null
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

        const picIds = userData.picturesCanSee?.slice().reverse();
        if (picIds && picIds.length > 0) {
          await Promise.all(
            picIds.map(async (picId) => {
              const picData = await getDocDataById("pictures", picId);
              if (picData) {
                const file = (picData.url && picData.url !== "" && picData.url.includes("firebasestorage"))? await fetch(picData.url)
                  .then(response => response.blob())
                  .then(blob => {
                    // Use the blob as needed
                    console.log("Blob file:", blob);
                    return blob;
                  })
                  .catch(error => {
                    console.error("Error downloading file:", error);
                  }) : null;

                picDatas.push({
                  id: picData.id,
                  ownerId: picData.ownerId,
                  url: picData.url,
                  file: file,
                  fileUrl: file? URL.createObjectURL(file) : null,
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
