// Initialize EmailJS - for send email for user
// npm install --save @emailjs/browser
emailjs.init("NOg6z4SdgBzJlZJax"); // Initialize EmailJS with public key

// ----------------------------------- PUSH NOTIFICATION SECTION ------------------------------------------- //
// Using PushSafer
// Find the deviceID by device name though API provided by PushSafer
// API: 'https://www.pushsafer.com/api-de?k=${apiKey}&u=${email}'
async function getDeviceIDByDeviceName(userData) {
    const apiKey = "bdVop1HtPdwgAyw2SMQu";
    const email = "nguyencongtuan0810@gmail.com";
    const account = `${userData.Email}-${userData.PhoneNumber}`;

    try {
        const response = await fetch(`https://www.pushsafer.com/api-de?k=${apiKey}&u=${email}`);
        const result = await response.json();

        if (result.status === 1) {
            const devices = result.devices;

            for (const key in devices) {
                if (devices[key].name === account) {
                    return devices[key].id;
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

// Send the Push Notification to the deviceID - PushSafer - when the user register / update the door lock password
export async function sendPushNotification(userData, lockPassword) {
    let deviceID = await getDeviceIDByDeviceName(userData);

    if (!deviceID) {
        alert("Device not found. Registering new device...");
        return;
    }

    const apiKey = "bdVop1HtPdwgAyw2SMQu";
    const title = "Lock Password Updated";
    const message = `Hi ${userData.userName}, your lock password has been updated to: ${lockPassword}`;
    const sound = "1";
    const vibration = "1";

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

    xhttp.send(`t=${encodeURIComponent(title)}&m=${encodeURIComponent(message)}&s=${sound}&v=${vibration}&d=${encodeURIComponent(deviceID)}&k=${encodeURIComponent(apiKey)}`);
}

// Send the Push Notification to the deviceID - PushSafer - when the DOOR LOCK detected any illegal activity
export async function sendPushWarningNotification(userData) {
    let deviceID = await getDeviceIDByDeviceName(userData);

    if (!deviceID) {
        alert("Device not found. Registering new device...");
        return;
    }

    const apiKey = "bdVop1HtPdwgAyw2SMQu";
    const title = "Warning: Suspicious Entry Activities Detected";
    const message = `Hi ${userData.userName}, \nSomeone is trying to enter your building. Please check your security system.`;
    const sound = "1";
    const vibration = "1";

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

    xhttp.send(`t=${encodeURIComponent(title)}&m=${encodeURIComponent(message)}&s=${sound}&v=${vibration}&d=${encodeURIComponent(deviceID)}&k=${encodeURIComponent(apiKey)}`);
}

// ----------------------------------- EMAIL SECTION ------------------------------------------- //
// Function to send an email notification - EmailJS - when the user register / update the door lock password
export async function sendEmailNotification(userData, lockPassword) {
    // Send email notification via EmailJS
    const templateParams = {
        to_name: userData.Name,
        to_email: userData.Email,
        message: `Your lock password has been successfully updated to: ${lockPassword}\n\nIf you did not authorize this change, please contact us immediately at door_lock_system_support@gmail.com.`
    };

    emailjs.send("service_v0qbu4a", "template_q65rsmz", templateParams)
        .then((response) => {
            alert('Lock password updated and email sent successfully.');
        }, (error) => {
            console.error('Failed to send email:', error);
            alert('Failed to send email.');
        });
}

// Function to send an email warning notification - EmailJS - when the DOOR LOCK detected any illegal activity
export async function sendWarningEmailNotification(userData) {
    const templateParams = {
        to_name: userData.Name,
        to_email: userData.Email,
        message: "Warning: Someone is trying to enter your building. Please check your security system."
    };

    emailjs.send("service_v0qbu4a", "template_3yzubac", templateParams)
        .then((response) => {
            alert("Warning Warning Warning - Sent email warning");
        }, (error) => {
            console.error('Failed to send email:', error);
            alert('Failed to send email.');
        });
}

