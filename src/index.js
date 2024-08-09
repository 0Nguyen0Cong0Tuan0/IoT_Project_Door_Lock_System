const express = require('express');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, setDoc, doc } = require('firebase/firestore');

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

// Initialize Firebase App
const firebaseConfig = {
    apiKey: "AIzaSyAzcPmcrE906QGVPgzu_bqtg3kigtt-MoQ",
    authDomain: "iotproject-ff799.firebaseapp.com",
    projectId: "iotproject-ff799",
    storageBucket: "iotproject-ff799.appspot.com",
    messagingSenderId: "935747739462",
    appId: "1:935747739462:web:b53e34088c27d8410f0f47"
};

const appClient = initializeApp(firebaseConfig);
const auth = getAuth(appClient);
const dbClient = getFirestore(appClient);

const db = firebaseAdmin.firestore();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utility function to show messages
function showMessage(message) {
    console.log(message);
}

// Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Sign Up Route
app.post("/signup", async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
            Name: name,
            Email: email,
            PhoneNumber: phoneNumber,
            Password: password
        };

        const docRef = doc(dbClient, "users", user.uid);
        await setDoc(docRef, userData);

        showMessage('Account created successfully');
        res.redirect('/login');
    } catch (error) {
        if (error.code === 'auth/email-already-in-use'){
            showMessage('Email address already exists!!!');
        } else {
            showMessage('Unable to create user');
        }
        res.status(500).send("Internal Server Error");
    }
});

// Sign In Route
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        showMessage('Login is successful');
        res.redirect('/user');  // Adjust the route to your user page
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            showMessage('Incorrect email or password');
        } else {
            showMessage('Account does not exist !!!');
        }
        res.status(401).send("Unauthorized");
    }
});

// Start server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});
