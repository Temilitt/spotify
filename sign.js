// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA5Xa1Ug5OYgQM_xX8065SrmtuRO_GSzVs",
  authDomain: "spotify-81475.firebaseapp.com",
  projectId: "spotify-81475",
  storageBucket: "spotify-81475.firebasestorage.app",
  messagingSenderId: "807183090685",
  appId: "1:807183090685:web:40e8fcc4fe5e9e5a6b4f94",
  measurementId: "G-ESR4TG8TQB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.firestore();

function SignUP() {
    let email = document.getElementById('email').value.trim()
    let password = document.getElementById('password').value.trim()
    let username = document.getElementById('username').value.trim()
    let Compassword = document.getElementById('Compassword').value.trim()

    
    if (email === '' || password === '' || username === '' || Compassword === '') {
        alert('All fields are required!')
        return
    }

    if (password.length < 8) {
        alert('Password should be at least 8 characters long.');
        return;
    }

    if (password !== Compassword) {
        alert('Passwords do not match');
        return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert('Password must contain at least one special character (e.g., !@#$%^&*).');
        return;
    }

    // Disable button and show loading
    let signupBtn = document.querySelector('.login-btn'); 
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...'
    }

    // Firebase signup
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Save user data to Firestore
            return database.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Account created successfully!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Signup error:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                alert('This email is already registered. Please login instead.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else if (error.code === 'auth/weak-password') {
                alert('Password is too weak. Please use a stronger password.');
            } else {
                alert(`Error: ${error.message}`);
            }

            // Re-enable button
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.textContent = 'Sign Up';
            }
        });
}














// Function to toggle password visibility
// function togglePassword() {
//     let passwordInput = document.getElementById('password');
//     let toggleButton = document.getElementById('togglePassword');
    
//     if (passwordInput.type === 'password') {
//         passwordInput.type = 'text';
//         toggleButton.textContent = 'Hide';
//     } else {
//         passwordInput.type = 'password';
//         toggleButton.textContent = 'Show';
//     }
// }

// // Optional: Toggle confirm password visibility
// function toggleConfirmPassword() {
//     let confirmPasswordInput = document.getElementById('Compassword');
//     let toggleButton = document.getElementById('toggleConfirmPassword');
    
//     if (confirmPasswordInput.type === 'password') {
//         confirmPasswordInput.type = 'text';
//         toggleButton.textContent = 'Hide';
//     } else {
//         confirmPasswordInput.type = 'password';
//         toggleButton.textContent = 'Show';
//     }
// }