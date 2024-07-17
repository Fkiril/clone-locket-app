import { fs_db } from "../services/firebase";
import { arrayUnion, addDoc, doc, setDoc, getDoc, collection, getDocs, where, query, updateDoc } from "firebase/firestore";

const writeCol = async (colName, data) => {
    try {
        const docRef = await addDoc(collection(fs_db, colName), data);
        console.log(`writeCol successfully at "${colName}" with data:`, data, "and docRef: ", docRef.id);
        return docRef.id;
    } catch (error) {
        const newError = new Error("writeCol's error: " + error);
        newError.code = "FIRESTORE/WRITE_COL_ERROR";
        throw newError;
    }
};

const writeDoc = async (colName, docName, updateFlag, data) => {
    try {
        if (updateFlag) {
            await updateDoc(doc(fs_db, colName, docName), data);
        } else {
            await setDoc(doc(fs_db, colName, docName), data);
        }
        console.log(`writeDoc successfully at "${colName}/${docName}" with data:`, data);
    } catch (error) {
        const newError = new Error("writeDoc's error: " + error);
        newError.code = "FIRESTORE/WRITE_DOC_ERROR";
        throw newError;
    }
};

const updateArrayField = async (colName, docName, fieldName, data) => {
    try {
        const docRef = doc(fs_db, colName, docName);
        await updateDoc(docRef, {
            [fieldName]: arrayUnion(data)
        });
    } catch (error) {
        const newError = new Error("updateArrayField's error: " + error);
        newError.code = "FIRESTORE/UPDATE_ARRAY_FIELD_ERROR";
        throw newError;
    }
}

const exitedValueInDoc = async (collectionName, fieldName, data) => {
    const usersRef = collection(fs_db, collectionName);
    const q = query(usersRef, where(fieldName, "==", data));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return true;
    }
    return false;
}

const exitedDoc = async (collectionName, docName) => {
    const docRef = doc(fs_db, collectionName, docName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    }
    return false;
}

export { writeCol, writeDoc, exitedValueInDoc, exitedDoc, updateArrayField };