// Install these packages via npm:
// npm install ws mqtt

const WebSocket = require('ws');
const mqtt = require('mqtt');

const mqttBrokerUrl = 'mqtt://localhost:1883'; // Your MQTT broker URL
const mqttTopic = 'AbtqLqY5Rcc43dBatoYJHflsAUg1'; // Topic to publish to

const wss = new WebSocket.Server({ port: 9001 });
const mqttClient = mqtt.connect(mqttBrokerUrl);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
});

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (message) => {
        console.log('Received WebSocket message:', message);
        // Publish the WebSocket message to the MQTT broker
        mqttClient.publish(mqttTopic, message.toString());
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
