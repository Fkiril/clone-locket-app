import React from "react";
import { fs_db } from "../hooks/firebase";
import { setDoc, doc } from "firebase/firestore";

export const fsWriteDoc = async (collectionName, docName, data) => {
    await setDoc(doc(fs_db, collectionName, docName), data);
}