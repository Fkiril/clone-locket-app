const { collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { fs_db } = require("./src/models/services/firebase"); // Đảm bảo đường dẫn chính xác đến firebase.js

async function addBlockedUsersFieldToAllUsers() {
  const usersCollection = collection(fs_db, "users");
  const usersSnapshot = await getDocs(usersCollection);

  usersSnapshot.forEach(async (userDoc) => {
    await updateDoc(userDoc.ref, {
      blockedUsers: []
    });
  });
}

addBlockedUsersFieldToAllUsers().then(() => {
  console.log("All users updated with blockedUsers field.");
}).catch(error => {
  console.error("Error updating users: ", error);
});
