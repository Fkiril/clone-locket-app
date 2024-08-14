import { fs_db } from "../services/firebase";
import { writeBatch } from "firebase/firestore";
import { addDoc, doc, setDoc, getDoc, collection, getDocs, where, query, updateDoc, arrayRemove, arrayUnion, increment } from "firebase/firestore";

const createBatchedWrites = async (writes) => {
    try {
        const batch = writeBatch(fs_db);

        for (const write of writes) {
            if(write) {
                if (write.work === "set") {
                    batch.set(write.docRef, write.data);
                }
                if (write.work === "update") {
                    batch.update(write.docRef, {
                        [write.field]: write.data
                    });
                }
                if (write.work === "update-array") {
                    if (write.isRemovement) {
                        batch.update(write.docRef, {
                            [write.field]: arrayRemove(write.data)
                        });
                    }
                    else {
                        batch.update(write.docRef, {
                            [write.field]: arrayUnion(write.data)
                        });
                    }
                }
                if (write.work === "update-map") {
                    const str = write.field + "." + write.key;
                    if (write.isIncrement) {
                        batch.update(write.docRef, {
                            [str]: increment(write.data)
                        });
                    }
                    else {
                        batch.update(write.docRef, {
                            [str]: write.data
                        });
                    }
                }
                if (write.work === "delete") {
                    batch.delete(write.docRef);
                }
            }
        };
        await batch.commit();
        console.log("createBatchedWrites's writes: ", writes);
    } catch (error) {
        const newError = new Error("createBatchedWrites's error: " + error);
        newError.code = "FIRESTORE/CREATE_BATCHED_WRITES_ERROR";
        throw newError;
    }
}

const writeIntoCol = async (path, data) => {
    try {
        const docRef = await addDoc(collection(fs_db, path), data);
        console.log(`writeInCol successfully at "${path}" with data:`, data);
        return docRef.id;
    } catch (error) {
        const newError = new Error("writeInCol's error: " + error);
        newError.code = "FIRESTORE/WRITE_INCOL_ERROR";
        throw newError;
    }
}

const writeIntoDoc = async (path, docName, isUpdate, data) => {
    try {
        const docRef = doc(fs_db, path, docName);
        if (isUpdate) {
            await updateDoc(docRef, data);
        } else {
            await setDoc(docRef, data);
        }
        console.log(`writeInDoc successfully at "${path}/${docName}" with data:`, data);
    } catch (error) {
        const newError = new Error("writeInDoc's error: " + error);
        newError.code = "FIRESTORE/WRITE_INDOC_ERROR";
        throw newError;
    }
}

const updateArrayField = async (path, docName, fieldName, isUpdate, data) => {
    try {
        const docRef = doc(fs_db, path, docName);
        if (isUpdate) {
            await updateDoc(docRef, {
                [fieldName]: arrayUnion(data)
            });
        }
        else {
            await updateDoc(docRef, {
                [fieldName]: arrayRemove(data)
            });
        }
        console.log(`updateArrayField successfully at "${path}/${docName}/${fieldName}" with data: `, data);
    } catch (error) {
        const newError = new Error("updateArrayField's error: " + error);
        newError.code = "FIRESTORE/UPDATE_ARRAY_FIELD_ERROR";
        throw newError;
    }
}

const exitDocWithValue = async (path, fieldName, data) => {
    const usersRef = collection(fs_db, path);
    const q = query(usersRef, where(fieldName, "==", data));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return false;
    }
    return true;
}

const exitDoc = async (path, docName) => {
    const docRef = doc(fs_db, path, docName);
    const docSnap = await getDoc(docRef);
    if (docSnap._document) {
      return true;
    }
    return false;
}

const getDocIdByValue = async (path, fieldName, data) => {
    const usersRef = collection(fs_db, path);
    const q = query(usersRef, where(fieldName, "==", data));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    return null;
}

const getDocDatasByValue = async (path, fieldName, data, head) => {
    const usersRef = collection(fs_db, path);
    const q = query(usersRef, where(fieldName, "==", data));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        if (head) return querySnapshot.docs[0].data();
        else {
            return querySnapshot.docs.map(doc => doc.data());
        }
    }
    return null;
}

const getDocDataById = async (path, docId) => {
    const docRef = doc(fs_db, path, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

const getDocRef = (path, docId) => {
    return doc(fs_db, path, docId);
}

const getColRef = (path) => {
    return collection(fs_db, path);
}

const getDocsCol = async (path) => {
    return await getDocs(collection(fs_db, path));
}

export { createBatchedWrites, writeIntoCol, writeIntoDoc, exitDocWithValue, exitDoc, updateArrayField, getDocIdByValue, getDocDatasByValue, getDocDataById, getDocRef, getColRef, getDocsCol };