import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";

export const useUserStore = create((set, get) => ({
  currentUser: null,
  friendDatas: [],
  requestDatas: [],
  blockedDatas: [],
  pictureDatas: [],
  isFetching: false,
  nearestFetchUserInfo: 0,
  fetchUserInfo: async (id) => {
    try {
      console.log(`fetching user's info with id: ${id}`);
      if (!id) {
        set({ currentUser: null, friendDatas: [], requestDatas: [], blockedDatas: [], pictureDatas: [], isFetching: false, nearestFetchUserInfo: 0 });
        return;
      }
      get().isFetching = true;
      get().nearestFetchUserInfo = new Date().getTime();
      
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
        else return set({ isFetching: false });
      });

      if (!userData) {
        get().isFetching = false;
        return;
      }

      let fDatas = [];
      let rDatas = [];
      let bDatas = [];
      let picDatas = [];
      
      const fIds = userData.friends;
      if (fIds && fIds.length > 0) {
        if (!get().friendDatas || (get().friendDatas).length === 0) {
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
                      return null;
                    }) : null;

                fDatas.push({
                  id: fData.id,
                  name: fData.userName,
                  email: fData.email,
                  blockeds: fData.blockeds,
                  avatar: fData.avatar,
                  avatarFile: file,
                  avatarFileUrl: file? URL.createObjectURL(file) : null
                });
              }
            })
          );
        } else {
          fDatas = (get().friendDatas).filter((fData) => fIds.includes(fData.id));
          
          const newFriendIds = fIds.filter((fId) => !(get().friendDatas).find((fData) => fData.id === fId));
          if (newFriendIds && newFriendIds.length > 0) {
            await Promise.all(
              newFriendIds.map(async (fId) => {
                const fData = await getDocDataById("users", fId);
                if (fData) {
                  const file = (fData.avatar && fData.avatar !== "" && fData.avatar.includes("firebasestorage"))?
                    await fetch(fData.avatar).then(response => response.blob())
                      .then(blob => {
                        console.log("Blob file:", blob);
                        return blob;
                      }).catch(error => {
                        console.error("Error downloading file:", error);
                        return null;
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
        }
      }

      const rIds = userData.friendRequests;
      if (rIds && rIds.length > 0) {
        if (!get().requestDatas || (get().requestDatas).length === 0) {
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
        } else {
          rDatas = (get().requestDatas).filter((rData) => rIds.includes(rData.id));
          
          const newRequestIds = rIds.filter((rId) => !(get().requestDatas).find((rData) => rData.id === rId));
          if (newRequestIds && newRequestIds.length > 0) {
            await Promise.all(
              newRequestIds.map(async (rId) => {
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
        }
      }
      

      const bIds = userData.blockeds;
      if (bIds && bIds.length > 0) {
        if (!get().blockedDatas || (get().blockedDatas).length === 0) {
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
        } else {
          bDatas = (get().blockedDatas).filter((bData) => bIds.includes(bData.id));
          
          const newBlockedIds = bIds.filter((bId) => !(get().blockedDatas).find((bData) => bData.id === bId));
          if (newBlockedIds && newBlockedIds.length > 0) {
            await Promise.all(
              newBlockedIds.map(async (bId) => {
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
        }
      }

      const picIds = userData.picturesCanSee;
      if (picIds && picIds.length > 0) {
        if (!get().pictureDatas || (get().pictureDatas).length === 0) {
          await Promise.all(
            picIds.map(async (picId) => {
              const picData = await getDocDataById("pictures", picId);
              if (picData && !userData?.blockeds?.includes(picData.ownerId) &&
                  !(fDatas?.find((friendData) => friendData.id === picData.ownerId)?.blockeds?.includes(userData.id))) {

                const file = (picData.url && picData.url !== "" && picData.url.includes("firebasestorage"))? await fetch(picData.url)
                  .then(response => response.blob())
                  .then(blob => {
                    console.log("Blob file:", blob);
                    return blob;
                  })
                  .catch(error => {
                    console.error("Error downloading file:", error);
                    return null;
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
        } else {
          picDatas = (get().pictureDatas).filter((picData) => picIds.includes(picData.id));
          
          const newPicIds = picIds.filter((picId) => !(get().pictureDatas).find((picData) => picData.id === picId));
          if (newPicIds && newPicIds.length > 0) {
            await Promise.all(
              newPicIds.map(async (picId) => {
                const picData = await getDocDataById("pictures", picId);
                if (picData) {
                  const file = (picData.url && picData.url !== "" && picData.url.includes("firebasestorage"))? await fetch(picData.url)
                    .then(response => response.blob())
                    .then(blob => {
                      console.log("Blob file:", blob);
                      return blob;
                    })
                    .catch(error => {
                      console.error("Error downloading file:", error);
                      return null;
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
        }
        picDatas.sort((a, b) => b.uploadTime - a.uploadTime);
      }

      set({ 
        currentUser: userData,
        friendDatas: fDatas,
        requestDatas: rDatas, 
        blockedDatas: bDatas, 
        pictureDatas: picDatas,
        isFetching: false,
        nearestFetchUserInfo: new Date().getTime()
      });
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, friendDatas: [], requestData: [], blockedDatas: [], pictureDatas: [], isFetching: false, nearestFetchUserInfo: 0 });
    }
  },
}));
