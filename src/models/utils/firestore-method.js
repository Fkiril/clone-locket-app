import { fs_db } from "../services/firebase";
import { doc, setDoc, getDoc, collection, getDocs, where, query, updateDoc } from "firebase/firestore";

const writeDoc = async (colName, docName, updateFlag, data) => {
    if (updateFlag) {
        await updateDoc(doc(fs_db, colName, docName), data);
    } else {
        await setDoc(doc(fs_db, colName, docName), data);
    }
    console.log(`writeDoc successfully at: ${colName}/${docName} with data:`, data);
};

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

export { writeDoc, exitedValueInDoc, exitedDoc };