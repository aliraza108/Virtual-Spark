document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const submitBtnContainer = document.querySelector('.submit-btn');

    if (form && submitBtnContainer) {
        // Create a message container
        const messageDiv = document.createElement('div');
        messageDiv.id = 'form-message';
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.display = 'none';
        submitBtnContainer.parentNode.insertBefore(messageDiv, submitBtnContainer);

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = {
                fullname: document.getElementById('fullname').value.trim(),
                lastname: document.getElementById('lastname').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                topic: document.getElementById('topic').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Client-side validation
            if (!formData.email || !formData.phone) {
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.textContent = 'Email and phone are required';
                return;
            }
            if (!/^\+?[0-9\s-]+$/.test(formData.phone)) {
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.textContent = 'Please enter a valid phone number (digits, spaces, or dashes only)';
                return;
            }

            console.log('Form data being sent:', formData);

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Fetch response:', { status: response.status, statusText: response.statusText });

                messageDiv.style.display = 'block';
                if (response.ok) {
                    messageDiv.style.backgroundColor = '#d4edda';
                    messageDiv.style.color = '#155724';
                    messageDiv.textContent = 'Form submitted successfully!';
                    form.reset();
                    // Clear message after 5 seconds
                    setTimeout(() => {
                        messageDiv.style.display = 'none';
                        messageDiv.textContent = '';
                    }, 5000);
                } else {
                    const errorData = await response.json();
                    console.error('Server error:', errorData);
                    messageDiv.style.backgroundColor = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.textContent = 'Error submitting form: ' + errorData.error + (errorData.details ? ' - ' + errorData.details : '');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                messageDiv.style.display = 'block';
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.textContent = 'An error occurred while submitting the form: ' + error.message;
            }
        });
    } else {
        console.error('Contact form or submit button container not found');
    }
});