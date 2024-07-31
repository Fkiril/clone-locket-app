import { fs_db } from "../services/firebase";
import { runTransaction, writeBatch } from "firebase/firestore";
import { addDoc, doc, setDoc, getDoc, collection, getDocs, where, query, updateDoc, arrayRemove, arrayUnion, increment } from "firebase/firestore";

const creatTransaction = async () => {
    try {
        const transaction = await runTransaction(async (transaction) => {
            
        })
    } catch (error) {
        console.log("Error creating transaction: ", error);
    }
}

const createBatchedWrites = async (writes) => {
    try {
        const batch = writeBatch(fs_db);

        writes?.map((write) => {
            if(!write) return;
            if (write.work === "set") {
                batch.set(write.docRef, write.data);
            }
            if (write.work === "update") {
                batch.update(write.docRef, {
                    [write.field]: write.data
                });
            }
            if (write.work === "update-array") {
                batch.update(write.docRef, {
                    [write.field]: arrayUnion(write.data)
                });
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
        })

        await batch.commit();
    } catch (error) {
        console.log("Error creating batched writes: ", error);
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
    if (!querySnapshot.empty) {
      return true;
    }
    return false;
}

const exitDoc = async (path, docName) => {
    const docRef = doc(fs_db, path, docName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
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

const getDocDataByValue = async (path, fieldName, data) => {
    const usersRef = collection(fs_db, path);
    const q = query(usersRef, where(fieldName, "==", data));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
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

export { creatTransaction, createBatchedWrites, writeCol, writeDoc, writeIntoCol, writeIntoDoc, exitDocWithValue, exitDoc, updateArrayField, getDocIdByValue, getDocDataByValue, getDocDataById, getDocRef, getColRef, getDocsCol };