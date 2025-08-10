document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = {
                fullname: document.getElementById('fullname').value,
                lastname: document.getElementById('lastname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                topic: document.getElementById('topic').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Form submitted successfully!');
                    form.reset();
                } else {
                    const errorData = await response.json();
                    alert('Error submitting form: ' + errorData.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while submitting the form.');
            }
        });
    }
});