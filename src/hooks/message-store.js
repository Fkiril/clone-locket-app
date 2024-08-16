import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { fs_db } from "../models/services/firebase";

export const useMessageStore = create((set, get) => ({
    messages: {},
    fetchedAll: {},
    isLoading: false,

    fetchMessages: async (conversationId) => {
        try {
            console.log("Fetching messages: ", conversationId);
            if (!conversationId || conversationId === "") {
                set({ messages: {}, fetchedAll: false, isLoading: false });
                return;
            }
            get().isLoading = true;

            const conversationData = await getDocDataById("conversations", conversationId);
            if (!conversationData || !conversationData.lastMessage) {
                get().isLoading = false;
                return;
            }

            const fetchLimit = (get().messages[conversationId] && get().messages[conversationId].length >= 15)? 3 : 15;
            const querySnapshot = await getDocs(
                query(collection(fs_db, "conversations/" + conversationId + "/messages"),
                      orderBy("createdTime", "desc"),
                      limit(fetchLimit)));

            const mDatas = [];
            if (!querySnapshot.empty) {
                await Promise.all(querySnapshot.docs.map(async (doc) => {
                    if (doc.exists()) {
                        if (get().messages[conversationId] && get().messages[conversationId].find((m) => m?.id === doc.data().id)) {
                            return;
                        }
                        if (doc.data().attachment) {
                            const picData = await getDocDataById("pictures", doc.data().attachment);
                            if (picData && picData.url && picData.url !== "") {
                                const file = await fetch(picData.url).then(response => response.blob()).then(blob => {
                                    console.log("Blob file:", blob);
                                    return blob;
                                });
                                const fileUrl = URL.createObjectURL(file);
                                mDatas.push({ ...doc.data(), attachmentFile: file, attachmentFileUrl: fileUrl });
                            }
                        }
                        else mDatas.push(doc.data());
                    }
                }));

                if (get().messages[conversationId] && get().messages[conversationId].length > 0) {
                    mDatas.push(...get().messages[conversationId]);
                }
                mDatas.sort((a, b) => {
                    return a?.createdTime - b?.createdTime;
                });

                set({messages: { ...get().messages, [conversationId]: mDatas }, fetchedAll: { ...get().fetchedAll, [conversationId]: fetchLimit > querySnapshot.size }, isLoading: false });
            }
            else set({ fetchedAll: { ...get().fetchedAll, [conversationId]: true }, isLoading: false });
        } catch (error) {
            console.log("Error fetching messages: ", error);
            return;
        }
    },
    fetchAdditionalMessages: async (conversationId, lastestMessageCreatedTime) => {
        try {
            console.log("Fetching additional messages: ", conversationId, lastestMessageCreatedTime);
            if (!conversationId || conversationId === "" || !lastestMessageCreatedTime) {
                return;
            }
            get().isLoading = true;

            const conversationData = await getDocDataById("conversations", conversationId);
            if (!conversationData || !conversationData.lastMessage) {
                get().isLoading = false;
                return;
            }

            const fetchLimit = 15;
            const querySnapshot = await getDocs(
                query(collection(fs_db, "conversations/" + conversationId + "/messages"),
                      where("createdTime", "<", lastestMessageCreatedTime),
                      orderBy("createdTime", "desc"),
                      limit(fetchLimit)));

            const mDatas = [];
            if (!querySnapshot.empty) {
                await Promise.all(querySnapshot.docs.map(async (doc) => {
                    if (doc.exists()) {
                        if (get().messages[conversationId] && get().messages[conversationId].find((m) => m?.id === doc.data().id)) {
                            return;
                        }
                        if (doc.data().attachment) {
                            const picData = await getDocDataById("pictures", doc.data().attachment);
                            if (picData && picData.url && picData.url !== "") {
                                const file = await fetch(picData.url).then(response => response.blob()).then(blob => {
                                    console.log("Blob file:", blob);
                                    return blob;
                                });
                                const fileUrl = URL.createObjectURL(file);
                                mDatas.push({ ...doc.data(), attachmentFile: file, attachmentFileUrl: fileUrl });
                            }
                        }
                        else mDatas.push(doc.data());
                    }
                }));

                if (get().messages[conversationId] && get().messages[conversationId].length > 0) {
                    mDatas.push(...get().messages[conversationId]);
                }
                mDatas.sort((a, b) => {
                    return a?.createdTime - b?.createdTime;
                });

                set({ messages: { ...get().messages, [conversationId]: mDatas }, fetchedAll: { ...get().fetchedAll, [conversationId]: fetchLimit > querySnapshot.size }, isLoading: false });
            }
            else set({ fetchedAll: { ...get().fetchedAll, [conversationId]: true }, isLoading: false });
        } catch (error) {
            console.log("Error fetching additional messages: ", error);
            return;
        }
    }
}));