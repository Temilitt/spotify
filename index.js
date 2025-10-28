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
const database = firebase.firestore()

function Login() {
    let email = document.getElementById('email').value.trim()
    let password = document.getElementById('password').value.trim()
    
    if (email === '' || password === '') {
        alert('All fields are mandatory!')
        return;
    }

    let signupBtn = document.querySelector('.login-btn'); 
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.textContent = 'Logging In...';
    }

     // Firebase login
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user.uid); 
            
        //     // Update last login time in Firestore
        //     // Use set with merge instead of update
        //     return database.collection('users').doc(user.uid).set({
        //         lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        //     }, { merge: true }).then(() => user); 
        // })
        // .then((user) => {
        //     console.log('Redirecting to dashboard...');
            // Success! Redirect to dashboard
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.error('Login error:', error);
            
            let errorMessage = '';
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email. Please sign up first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Contact support.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please try again.';
                    break;
                default:
                    errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
            }
            
            alert(errorMessage);
            
            // Re-enable button
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Log In';
            }
        });
}