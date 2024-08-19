import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { connect } from "./mqtt.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzcPmcrE906QGVPgzu_bqtg3kigtt-MoQ",
    authDomain: "iotproject-ff799.firebaseapp.com",
    projectId: "iotproject-ff799",
    storageBucket: "iotproject-ff799.appspot.com",
    messagingSenderId: "935747739462",
    appId: "1:935747739462:web:b53e34088c27d8410f0f47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch the username and user data from Firestore
async function fetchUserData() {
    const userId = localStorage.getItem('loggedInUserId');

    if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            document.getElementById('username').textContent = userData.Name.toUpperCase();
            return { ...userData, uid: userId }; 
        } else {
            document.getElementById('username').textContent = "User"; 
        }
    } else {
        document.getElementById('username').textContent = "User"; 
    }
    return null;
}

// Fetch the user data when the page loads
window.addEventListener('load', async () => {
    const userData = await fetchUserData();

    const lockPassForm = document.querySelector('#lock-pass-form');
    lockPassForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const lockPassword = lockPassForm.lockPassword.value;

        // Additional validation
        const validPattern = /^[0-9a-dA-D]{1,9}$/;
        if (!validPattern.test(lockPassword)) {
            alert('Invalid password. Only 1-9 characters are allowed, and valid characters are 0-9, a-d, or A-D.');
            return;
        }

        if (userData) {
            try {
                const userDocRef = doc(db, 'users', userData.uid);
                await updateDoc(userDocRef, {
                    LockPassword: lockPassword
                });

                connect(userData.uid, userData.Email, lockPassword);

            } catch (error) {
                console.error('Error updating lock password:', error);
                alert('Failed to register lock password.');
            }
        } else {
            alert('User not logged in.');
        }
    });
});
