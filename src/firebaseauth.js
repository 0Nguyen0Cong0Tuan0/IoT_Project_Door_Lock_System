import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    // Your Firebase configuration
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function showMessage(message, divId) {
    let messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    setTimeout(() => {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Sign Up Functionality
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phonenumber').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
            Name: name,
            Email: email,
            PhoneNumber: phoneNumber,
            Password: password
        };

        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
        .then(() => {
            showMessage('Account created successfully', 'signUpMessage');
            window.location.href = '/login';
        })
        .catch((error) => {
            console.error("Error writing document", error);
        });
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use'){
            showMessage('Email address already exists!!!', "signUpMessage");
        } else {
            showMessage('Unable to create user', 'signUpMessage');
        }
    });
});

// Sign In Functionality
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        showMessage('Login is successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = '/user';
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
            showMessage('Incorrect email or password', 'signInMessage');
        } else {
            showMessage('Account does not exist !!!', 'signInMessage');
        }
    });
});
