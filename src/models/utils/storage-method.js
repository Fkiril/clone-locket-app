import { storage } from "../services/firebase";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";

const uploadToFolder = async (file, folderName) => {
  const date = (new Date()).toLocaleString("vi-VN").replace(/\//g, "-");
  const storageRef = ref(storage, `${folderName}/${date + " | " + file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        reject(() => {
          const newError = new Error("Something went wrong!" + error.code);
          console.log(newError.message);
          newError.code = "STORAGE/UPLOAD_BYTES_RESUMABLE_ERROR";
          throw newError;
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve({fileUrl: downloadURL, uploadTime: date});
        });
      }
    );
  });
};

const deleteFile = async (fileUrl) =>  {
  const fileRef = ref(storage, fileUrl);

  return deleteObject(fileRef).then(() => {
    console.log("File deleted successfully");
  }).catch((error) => {
    // throw new Error("DELETE_OBJECT_ERROR");
    const newError = new Error("Something went wrong!" + error.code);
    newError.code = "STORAGE/DELETE_OBJECT_ERROR";
    console.log(newError.message);
    throw newError;
  });
}

export { uploadToFolder, deleteFile };