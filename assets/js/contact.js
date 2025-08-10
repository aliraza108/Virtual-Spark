document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (form) {
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
                alert('Email and phone are required');
                return;
            }
            if (!/^\+?[0-9\s-]+$/.test(formData.phone)) {
                alert('Please enter a valid phone number (digits, spaces, or dashes only)');
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

                if (response.ok) {
                    alert('Form submitted successfully!');
                    form.reset();
                } else {
                    const errorData = await response.json();
                    console.error('Server error:', errorData);
                    alert('Error submitting form: ' + errorData.error + (errorData.details ? ' - ' + errorData.details : ''));
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('An error occurred while submitting the form: ' + error.message);
            }
        });
    } else {
        console.error('Contact form not found');
    }
});