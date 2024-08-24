import { sendWarningEmailNotification, sendPushWarningNotification } from './emailnoti.js'; // Import the function
import { fetchUserData, addWarningHistory, addOpenHistory, updateToggleButton } from './user.js';

let client;

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

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection Lost: " + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    console.log("Message arrived: " + message.payloadString);
    
    const payload = message.payloadString;
    const topic = message.destinationName;

    // Check if the payload contains "warning"
    if (payload.toLowerCase() === 'warning') {
        console.log("Warning received. Sending email notification...");

        // Fetch user data to send the email
        fetchUserData().then(userData => {
            if (userData) {
                // sendWarningEmailNotification(userData);
                // sendPushWarningNotification(userData);
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
}
