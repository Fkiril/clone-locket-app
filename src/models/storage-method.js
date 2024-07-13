import { storage } from "../hooks/firebase";
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";

const uploadToFolder = async (file, folderName) => {
  const date = new Date();
  const storageRef = ref(storage, `${folderName}/${date + file.name}`);

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
        reject("Something went wrong!" + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

const deleteFile = (fileUrl) =>  {
  const fileRef = ref(storage, fileUrl);

  return deleteObject(fileRef).then(() => {
    console.log("File deleted successfully");
  }).catch((error) => {
    console.log("Something went wrong!" + error.code);
  });
}

export { uploadToFolder, deleteFile };