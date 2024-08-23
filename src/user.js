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

// Initialize EmailJS
emailjs.init({
    publicKey: "NOg6z4SdgBzJlZJax",
});

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
            console.error('User document does not exist.');
            document.getElementById('username').textContent = "User";
        }
    } else {
        console.error('No logged in user ID found.');
        document.getElementById('username').textContent = "User";
    }
    return null;
}

async function getDeviceIDByDeviceName(userData) {
    const apiKey = "bdVop1HtPdwgAyw2SMQu"; // Replace with your PushSafer API key
    const email = "nguyencongtuan0810@gmail.com"; // Use the email associated with the PushSafer account
    const account = `${userData.Email}-${userData.PhoneNumber}`
    
    try {
        // Fetch devices
        const response = await fetch(`https://www.pushsafer.com/api-de?k=${apiKey}&u=${email}`);
        const result = await response.json();

        if (result.status === 1) {
            const devices = result.devices;
            
            // Find the device by name
            for (const key in devices) {
                if ( devices[key].name == account) {
                    return devices[key].id; // Return the device ID
                }
            }
            console.log('Device not found.');
            return null;
        } else {
            console.error('Failed to retrieve devices. Error:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching devices from PushSafer:', error);
        return null;
    }
}


async function sendPushNotification(userName, lockPassword, userData) {
    let deviceID = await getDeviceIDByDeviceName(userData);

    if (!deviceID) {
        alert("Device not found. Registering new device...");
        // Register the device here if needed
        return;
    }

    const apiKey = "bdVop1HtPdwgAyw2SMQu"; // Replace with your PushSafer API key
    const title = "Lock Password Updated";
    const message = `Hi ${userName}, your lock password has been updated to: ${lockPassword}`;
    const sound = "1"; // Enable sound
    const vibration = "1"; // Enable vibration
    const icon = ""; // Optionally set icon
    const iconcolor = ""; // Optionally set icon color
    const url = ""; // Optionally set URL
    const urltitle = ""; // Optionally set URL title

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://www.pushsafer.com/api", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === XMLHttpRequest.DONE) {
            if (xhttp.status === 200) {
                const result = JSON.parse(xhttp.responseText);
                console.log('PushSafer API response:', result);

                if (result.status === 1) {
                    alert('Push notification sent successfully.');
                } else {
                    alert('Failed to send push notification. Error: ' + result.error);
                }
            } else {
                console.error('Failed to send push notification. Status:', xhttp.status);
                alert('Failed to send push notification. Please check the console for more details.');
            }
        }
    };

    xhttp.send(`t=${encodeURIComponent(title)}&m=${encodeURIComponent(message)}&s=${sound}&v=${vibration}&i=${encodeURIComponent(icon)}&c=${encodeURIComponent(iconcolor)}&d=${encodeURIComponent(deviceID)}&u=${encodeURIComponent(url)}&ut=${encodeURIComponent(urltitle)}&k=${encodeURIComponent(apiKey)}`);
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

                // await sendPushNotification(userData.Name, lockPassword, userData);

                // Send email notification via EmailJS
                // const templateParams = {
                //     to_name: userData.Name,
                //     to_email: userData.Email,
                //     message: `Your lock password has been successfully updated to: ${lockPassword}\n\nIf you did not authorize this change, please contact us immediately at door_lock_system_support@gmail.com.`
                // };

                // emailjs.send("service_v0qbu4a", "template_q65rsmz", templateParams)
                //     .then((response) => {
                //         alert('Lock password updated and email sent successfully.');
                //     }, (error) => {
                //         console.error('Failed to send email:', error);
                //         alert('Failed to send email.');
                //     });

                // Connect to MQTT after successfully updating the lock password
                connect(userData.uid, userData.Email, lockPassword); // Pass the UID, email, and lock password

            } catch (error) {
                console.error('Error updating lock password:', error);
                alert('Failed to register lock password. Please try again later.');
            }
        } else {
            alert('User not logged in. Please log in and try again.');
        }
    });
});
