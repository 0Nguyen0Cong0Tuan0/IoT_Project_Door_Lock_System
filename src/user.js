import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { connect, publish, subscribe } from "./mqtt.js";
import { sendPushNotification, sendEmailNotification } from './emailnoti.js';

// ------------------------------------------------ FIREBASE SECTION ------------------------------------------------ //
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


// ------------------------------------------------ FETCH USER DATA SECTION ------------------------------------------------ //
// Function to fetch the username and user data from Firestore
export async function fetchUserData() {
    const userId = localStorage.getItem('loggedInUserId');

    if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            document.getElementById('username').textContent = userData.Name.toUpperCase();

            // Connect to MQTT and publish the userID to "Client" topic
            const mqttClient = await connect(userId);
            publish("Client", userId);

            return { ...userData, uid: userId };
        } else {
            console.error('User document does not exist.');
            document.getElementById('username').textContent = "User";
        }
    } else {
        console.error('No logged-in user ID found.');
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

        const validPattern = /^[0-9a-dA-D]{1,9}$/;
        if (!validPattern.test(lockPassword)) {
            alert('Invalid password. The valid characters are 0-9, a-d, or A-D.');
            return;
        }

        if (userData) {
            try {
                const userDocRef = doc(db, 'users', userData.uid);
                await updateDoc(userDocRef, {
                    LockPassword: lockPassword
                    
                });

                const historyRef = collection(db, `history-${userData.uid}`);
                const newHistoryEntry = {
                    timestamp: new Date().toLocaleString(),
                    content: `[PASSWORD]_You registered the door lock password as ${lockPassword}`
                };

                await addDoc(historyRef, newHistoryEntry);
                console.log("History entry added for password registration.");
                

                console.log("Attempting to connect with client ID: " + userData.uid);

                const mqttClient = await connect(userData.uid);

                const messagePayload = `Email: ${userData.Email}, LockPassword: ${lockPassword}`;
                publish(userData.uid, messagePayload);

                subscribe(userData.uid);

                sendPushNotification(userData, lockPassword);
                sendEmailNotification(userData, lockPassword);
            } catch (error) {
                console.error('Error updating lock password:', error);
                alert('Failed to register lock password. Please try again later.');
            }
        } else {
            alert('User not logged in. Please log in and try again.');
        }          
    });

    // Handle the lock state toggle button
    if (userData) {
        await handleToggleButton(userData);
    }
});


// ------------------------------------------------ TOGGLE BUTTON / STATE OF LOCK SECTION ------------------------------------------------ //
// Handle the lock state toggle button - [event] = 'click'
async function handleToggleButton(userData) {
    const toggleButton = document.getElementById("toggle-lock");
    const stateOfLockDiv = document.querySelector(".stateOfLock");
    const stateOfLockTextDiv = document.querySelector(".stateOfLockText");

    toggleButton.addEventListener("click", async function() {
        let content;
        if (stateOfLockDiv.classList.contains("stateOpen")) {
            // Switch to "Lock" state
            stateOfLockDiv.classList.remove("stateOpen");
            stateOfLockDiv.classList.add("stateLock");
            stateOfLockTextDiv.classList.remove("textOpen");
            stateOfLockTextDiv.classList.add("textLock");
            toggleButton.textContent = "OPEN?"; // Update button text

            content = "[STATE]_Your door is blocked";
            publish(userData.uid, "W_block"); // Publish "block" to MQTT topic

        } else {
            // Switch to "Open" state
            stateOfLockDiv.classList.remove("stateLock");
            stateOfLockDiv.classList.add("stateOpen");
            stateOfLockTextDiv.classList.remove("textLock");
            stateOfLockTextDiv.classList.add("textOpen");
            toggleButton.textContent = "BLOCK?"; // Update button text

            content = "[STATE]_Your door is opening";
            publish(userData.uid, "W_open"); // Publish "open" to MQTT topic
        }

        // Add history entry for state change
        const historyRef = collection(db, `history-${userData.uid}`);
        const newHistoryEntry = {
            timestamp: new Date().toLocaleString(),
            content: content
        };

        await addDoc(historyRef, newHistoryEntry);
        console.log("History entry added for lock state change.");
    });
}

// Update the toggle button - message from ESP32
export async function updateToggleButton(userData) {
    const toggleButton = document.getElementById("toggle-lock");
    const stateOfLockDiv = document.querySelector(".stateOfLock");
    const stateOfLockTextDiv = document.querySelector(".stateOfLockText");


    if (stateOfLockDiv.classList.contains("stateLock")) {
        const content = "[STATE]_Your door is opening";
        // Switch to "Open" state
        stateOfLockDiv.classList.remove("stateLock");
        stateOfLockDiv.classList.add("stateOpen");
        stateOfLockTextDiv.classList.remove("textLock");
        stateOfLockTextDiv.classList.add("textOpen");
        toggleButton.textContent = "BLOCK?"; // Update button text
    }
}

// Update the toggle button - message from ESP32
export async function updateToggleButtonLock(userData) {
    const toggleButton = document.getElementById("toggle-lock");
    const stateOfLockDiv = document.querySelector(".stateOfLock");
    const stateOfLockTextDiv = document.querySelector(".stateOfLockText");


    if (stateOfLockDiv.classList.contains("stateLock")) {
        const content = "[STATE]_Your door is locking";
        // Switch to "Block" state
        stateOfLockDiv.classList.remove("stateOpen");
        stateOfLockDiv.classList.add("stateLock");
        stateOfLockTextDiv.classList.remove("textOpen");
        stateOfLockTextDiv.classList.add("textLock");
        toggleButton.textContent = "OPEN?"; // Update button text
    }
}


// ------------------------------------------------ SAVE HISTORY SECTION ------------------------------------------------ //
// Warning history
export async function addWarningHistory(userData) {
    // Add history entry for state change
    const historyRef = collection(db, `history-${userData.uid}`);
    const newHistoryEntry = {
        timestamp: new Date().toLocaleString(),
        content: '[Warning]_Someone is trying to enter your building. '
    };

    await addDoc(historyRef, newHistoryEntry);
    console.log("History entry added for warning message.");
}

// Open history
export async function addOpenHistory(userData) {
    // Add history entry for state change
    const historyRef = collection(db, `history-${userData.uid}`);
    const newHistoryEntry = {
        timestamp: new Date().toLocaleString(),
        content: '[STATE]_Your door is opening.'
    };

    await addDoc(historyRef, newHistoryEntry);
    console.log("History entry added for lock state change.");
}

export async function addBlockHistory(userData) {
    // Add history entry for state change
    const historyRef = collection(db, `history-${userData.uid}`);
    const newHistoryEntry = {
        timestamp: new Date().toLocaleString(),
        content: '[STATE]_Your door is locked.'
    };

    await addDoc(historyRef, newHistoryEntry);
    console.log("History entry added for lock state change.");
}

// OTP saved history
export async function addOTPHistory(userData, otpString) {
    // Add history entry for state change
    const historyRef = collection(db, `history-${userData.uid}`);
    const newHistoryEntry = {
        timestamp: new Date().toLocaleString(),
        content: `[OTP]_Generating OTP is ${otpString}.`
    };

    await addDoc(historyRef, newHistoryEntry);
    console.log("History entry added for OTP generation.");
}

// ------------------------------------------------ READ HISTORY ON CLOUD and SHOW ON WEBSITE SECTION ------------------------------------------------ //
document.querySelector('.history-access-btn').addEventListener('click', async () => {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        alert('No logged-in user found.');
        return;
    }

    const historyRef = collection(db, `history-${userId}`);
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
    
    try {
        const querySnapshot = await getDocs(q);
        const historyTable = document.getElementById('history-table');
        const tbody = historyTable.querySelector('tbody');
        tbody.innerHTML = '';

        if (querySnapshot.empty) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">No history available.</td>`;
            tbody.appendChild(row);
        } else {
            let index = 0;
            querySnapshot.docs.reverse().forEach(doc => {
                const entry = doc.data();
                const [date, time] = entry.timestamp.split(', ');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${20 - index}</td>
                    <td>${date}</td>
                    <td>${time}</td>
                    <td>${entry.content}</td>
                `;
                tbody.insertBefore(row, tbody.firstChild); // Insert each new row at the top of tbody

                index++;
            });
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
});

// ------------------------------------------------ READ HISTORY ON CLOUD and SHOW ON WEBSITE SECTION ------------------------------------------------ //
document.querySelector('.history-access-btn').addEventListener('click', async () => {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        alert('No logged-in user found.');
        return;
    }

    const historyRef = collection(db, `history-${userId}`);
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
    
    try {
        const querySnapshot = await getDocs(q);
        const historyTable = document.getElementById('history-table');
        const tbody = historyTable.querySelector('tbody');
        tbody.innerHTML = '';

        if (querySnapshot.empty) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">No history available.</td>`;
            tbody.appendChild(row);
        } else {
            let index = 0;
            querySnapshot.docs.reverse().forEach(doc => {
                const entry = doc.data();
                const [date, time] = entry.timestamp.split(', ');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${20 - index}</td>
                    <td>${date}</td>
                    <td>${time}</td>
                    <td>${entry.content}</td>
                `;
                tbody.insertBefore(row, tbody.firstChild); // Insert each new row at the top of tbody

                index++;
            });
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
});

// ------------------------------------------------ AUTO LOCK FEATURE ------------------------------------------------ //
document.addEventListener('DOMContentLoaded', function() {
    const autoLockToggleBtn = document.getElementById('auto-lock-toggle');

    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        alert('No logged-in user found.');
        return;
    }

    autoLockToggleBtn.addEventListener('click', function() {
        if (autoLockToggleBtn.textContent === 'OFF') {
            autoLockToggleBtn.textContent = 'ON';
            autoLockToggleBtn.classList.add('active');
            publish(userId, "auto_lock_ON")
        } else {
            autoLockToggleBtn.textContent = 'OFF';
            autoLockToggleBtn.classList.remove('active');
            publish(userId, "auto_lock_OFF")
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const autoLockToggleBtn = document.getElementById('_2fa-lock-toggle');

    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
        alert('No logged-in user found.');
        return;
    }

    autoLockToggleBtn.addEventListener('click', function() {
        if (autoLockToggleBtn.textContent === 'OFF') {
            autoLockToggleBtn.textContent = 'ON';
            autoLockToggleBtn.classList.add('active');
            publish(userId, "_2FA_ON")
        } else {
            autoLockToggleBtn.textContent = 'OFF';
            autoLockToggleBtn.classList.remove('active');
            publish(userId, "_2FA_OFF")
        }
    });
});