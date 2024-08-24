
// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('lock-password-form');

//     form.addEventListener('submit', async function(event) {
//         event.preventDefault(); // Prevent the default form submission

//         const formData = new FormData(form);

//         try {
//             const response = await fetch('/register-lock-password', {
//                 method: 'POST',
//                 body: formData
//             });

//             if (response.ok) {
//                 const result = await response.text();
//                 console.log('Server Response:', result); // Log server response

//                 // Update the current lock password display
//                 const newPassword = formData.get('lockPassword');
//                 document.getElementById('current-lock-password').textContent = newPassword;
//                 alert('Lock password updated successfully!');
//             } else {
//                 alert('Failed to update lock password.');
//             }
//         } catch (error) {
//             console.error('Error updating lock password:', error);
//             alert('An error occurred. Please try again.');
//         }
//     });
// });

const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');

if (signUpButton && signInButton) {
    signUpButton.addEventListener('click', function() {
        window.location.href = "register_login.html#signup";
    });

    signInButton.addEventListener('click', function() {
        window.location.href = "register_login.html#signin";
    });
}