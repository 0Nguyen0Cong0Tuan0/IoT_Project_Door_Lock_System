document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("toggle-lock");
    const stateOfLockDiv = document.querySelector(".stateOfLock");
    const stateOfLockTextDiv = document.querySelector(".stateOfLockText");

    toggleButton.addEventListener("click", function() {
        if (stateOfLockDiv.classList.contains("stateOpen")) {
            stateOfLockDiv.classList.remove("stateOpen");
            stateOfLockDiv.classList.add("stateLock");
            stateOfLockTextDiv.classList.remove("textOpen");
            stateOfLockTextDiv.classList.add("textLock");

            // Disable the button
            toggleButton.disabled = true;
            toggleButton.classList.add("unable-btn");
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lock-password-form');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(form);

        try {
            const response = await fetch('/register-lock-password', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Server Response:', result); // Log server response

                // Update the current lock password display
                const newPassword = formData.get('lockPassword');
                document.getElementById('current-lock-password').textContent = newPassword;
                alert('Lock password updated successfully!');
            } else {
                alert('Failed to update lock password.');
            }
        } catch (error) {
            console.error('Error updating lock password:', error);
            alert('An error occurred. Please try again.');
        }
    });
});

