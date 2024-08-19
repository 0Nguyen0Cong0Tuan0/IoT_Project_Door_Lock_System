let client;

export function connect(clientId, userEmail, lockPassword) {
    console.log("Attempting to connect with client ID: " + clientId);
    client = new Paho.MQTT.Client("localhost", 9001, clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
        onSuccess: () => onConnect(clientId, userEmail, lockPassword),
        onFailure: onFailure,
        userName: "nct",
        password: "nct0810",
        useSSL: false
    });
}

function onConnect(clientId, userEmail, lockPassword) {
    console.log("Connected");

    // Subscribe to the topic that matches the clientId
    client.subscribe(clientId, {
        onSuccess: () => {
            console.log(`Subscribed to topic ${clientId}`);
            // Publish the message after successful subscription
            publish(clientId, userEmail, lockPassword);
        },
        onFailure: (error) => {
            console.log("Subscription failed: " + error.errorMessage);
        }
    });
}

function onFailure(error) {
    console.log("Connection failed: " + error.errorMessage);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection Lost: " + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    console.log("Message arrived: " + message.payloadString);
}

function publish(clientId, userEmail, lockPassword) {
    if (client.isConnected()) {
        const messagePayload = `Email: ${userEmail}, LockPassword: ${lockPassword}`;
        const message = new Paho.MQTT.Message(messagePayload);
        message.destinationName = clientId; 
        client.send(message);
        console.log(`Message published to topic ${clientId}`);
    } else {
        console.log("Client not connected. Unable to publish.");
    }
}
