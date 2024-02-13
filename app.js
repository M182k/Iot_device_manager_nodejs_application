// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

// Create Express app
const app = express();

// Use middleware for parsing JSON
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Set up file paths
const devicesFilePath = 'devices.json';
const logsFilePath = 'logs.txt';

// Function to load existing devices from devices.json into memory
async function loadDevices() {
    try {
        const devicesData = await fs.readFile(devicesFilePath, 'utf-8');
        return JSON.parse(devicesData);
    } catch (error) {
        console.error('Error loading devices:', error.message);
        return [];
    }
}

// Initialize devices in memory
let devices = [];

// Load existing devices on application startup
loadDevices().then(loadedDevices => {
    devices = loadedDevices;
    console.log('Devices loaded:', devices);
});

// Function to log activities with timestamps to logs.txt
function logData(activity, details = '') {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${activity} ${details}\n`;

    fs.appendFile(logsFilePath, logMessage, 'utf-8', err => {
        if (err) {
            console.error('Error logging activity:', err.message);
        }
    });
}

// Device Registration
app.post('/register', async (req, res) => {
    const { deviceId, deviceType } = req.body;

    if (!deviceId || !deviceType) {
        return res.status(400).json({ error: 'Device ID and Device Type are required' });
    }

    const existingDevice = devices.find(device => device.deviceId === deviceId);
    if (existingDevice) {
        return res.status(400).json({ error: 'Device already registered' });
    }

    const newDevice = { deviceId, deviceType };
    devices.push(newDevice);

    // Save registered devices to devices.json
    await fs.writeFile(devicesFilePath, JSON.stringify(devices, null, 2));

    // Log the registration activity
    logData(`Device registered - Device ID: ${deviceId}, Device Type: ${deviceType}`);
    
    res.status(201).json(newDevice);
});

// Displaying Devices
app.get('/show', (req, res) => {
    res.json(devices);
});

// Receiving Device Data
app.post('/data', (req, res) => {
    const { deviceId, data } = req.body;

    if (!deviceId || !data) {
        return res.status(400).json({ error: 'Device ID and Data are required' });
    }

    // Log the received data with a timestamp
    logData(`Data received from Device ID ${deviceId} - Data: ${JSON.stringify(data)}`, `Details: ${details}`);

    res.json({ message: 'Data received successfully' });
});

// Sending Commands to Devices
app.post('/command', (req, res) => {
    const { deviceId, command } = req.body;

    if (!deviceId || !command) {
        return res.status(400).json({ error: 'Device ID and Command are required' });
    }

    // Log the command with a timestamp
    logData(`Command sent to Device ID ${deviceId} - Command: ${command}`, `Details: ${details}`);

    res.json({ message: 'Command sent successfully' });
});

// Export the Express app for use in other files
module.exports = app;
