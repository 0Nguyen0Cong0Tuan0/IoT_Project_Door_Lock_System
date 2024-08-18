import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAzcPmcrE906QGVPgzu_bqtg3kigtt-MoQ",
    authDomain: "iotproject-ff799.firebaseapp.com",
    projectId: "iotproject-ff799",
    storageBucket: "iotproject-ff799.appspot.com",
    messagingSenderId: "935747739462",
    appId: "1:935747739462:web:b53e34088c27d8410f0f47"
};

const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
    let messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function(){
        messageDiv.style.opacity = 0;
    }, 10000);
}

// Sign Up Functionality
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    
    const name = document.getElementById('rname').value;
    const email = document.getElementById('remail').value;
    const phoneNumber = document.getElementById('rphonenumber').value;
    const password = document.getElementById('rpassword').value;

    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
            Name: name,
            Email: email,
            PhoneNumber: phoneNumber
        };

        showMessage('Account created successfully', 'signUpMessage');
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
        .then(() => {
            window.location.href = 'register_login.html#signin';
        })
        .catch((error) => {
            console.error("Error writing document", error);
        });
    })
    .catch((error) => {
        const errorCode = error.code;

        if (errorCode == 'auth/email-already-in-use'){
            showMessage('Email address already exists!!!', "signUpMessage");
        } else {
            showMessage('Unable to create user', 'signUpMessage');
        }
    })
})

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        showMessage('Login is successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = 'user.html';
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode=='auth/invalid-credential'){
            showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else {
            showMessage("Account does not Exist", 'signInMessage');
        }
    })
})