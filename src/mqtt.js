import { sendWarningEmailNotification, sendPushWarningNotification, sendOTPNotification } from './emailnoti.js'; // Import the function
import { fetchUserData, addWarningHistory, addOpenHistory, updateToggleButton, addOTPHistory } from './user.js';

let client;

// Create/establish the websocket client (on port 9001 - protocol websockets)
export async function connect(clientId) {
    client = new Paho.MQTT.Client("localhost", 9001, clientId); // Updated port
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    return new Promise((resolve, reject) => {
        client.connect({
            onSuccess: () => {
                console.log("Connected");
                resolve(client);
            },
            onFailure: (error) => {
                console.log("Connection failed: " + error.errorMessage);
                reject(error);
            },
            useSSL: false
        });
    });
}

// Publish to the topic {topic} with the message {payload}
export function publish(topic, payload) {
    if (client && client.isConnected()) {
        const message = new Paho.MQTT.Message(payload);
        message.destinationName = topic; 
        client.send(message);
        console.log(`Message published to topic ${topic}`);
        console.log(`Message sent: ${payload}`)
    } else {
        console.log("Client not connected. Unable to publish.");
    }
}

// Subcribe to the topic {topic}
export function subscribe(topic) {
    if (client && client.isConnected()) {
        client.subscribe(topic, { qos: 1 }, (error) => {
            if (error) {
                console.error('Error subscribing:', error);
            }
        });
    } else {
        console.log("Client not connected. Unable to subscribe.");
    }
}

// Print out when the connection lost
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection Lost: " + responseObject.errorMessage);
    }
}

// Handle the incoming messages
// There are 3 kind of messages will be handle:
// - 'warning' message - when DOOR LOCK detected any illegal activity
// - 'open' message - when DOOR LOCK is opening / user input the correct password
// - 'opt saved' message - when the DOOR LOCK sent the OPT to the website
function onMessageArrived(message) {
    console.log("Message arrived: " + message.payloadString);
    
    const payload = message.payloadString;
    const topic = message.destinationName;

    const otpIndex = payload.indexOf('OTP: ');

    // Check if the payload contains "warning"
    if (payload.toLowerCase() === 'warning') {
        console.log("Warning received. Sending email notification...");

        // Fetch user data to send the email
        fetchUserData().then(userData => {
            if (userData) {
                sendWarningEmailNotification(userData);
                sendPushWarningNotification(userData);
                addWarningHistory(userData);
                console.log("SENT");
            }
        });
    }

    if (payload.toLowerCase() === 'open') {
        console.log("User inputs password correctly...");

        // Fetch user data to send the email
        fetchUserData().then(userData => {
            if (userData) {
                addOpenHistory(userData);
                updateToggleButton(userData);
                console.log("OPEN");
            }
        });
    }

    if (otpIndex != -1) {
        console.log("Receive the OTP: " +  payload.substring(otpIndex + 5));
        const otp = payload.substring(otpIndex + 5);
        // Fetch user data to send the email
        fetchUserData().then(userData => {
            if (userData) {
                sendOTPNotification(userData, otp);
                addOTPHistory(userData, otp)
                console.log("OTP Saved");
            }    
        });
    }
}
