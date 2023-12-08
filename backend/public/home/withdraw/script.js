document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
});

document.addEventListener('DOMContentLoaded', () => {
    const depositForm = document.getElementById('withdrawForm');
    const depositBtn = document.getElementById('withdrawBtn');
    const depositResult = document.getElementById('withdrawResult');

    depositBtn.addEventListener('click', async () => {
        try {
            // Get withdraw data from the form
            const amount = document.getElementById('amount').value;
            const userId = getUserIdFromCookie();

            // Make a POST request to the server
            const response = await fetch('/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId,amount }),
            });

            if (response.ok) {
                const result = await response.json();
                depositResult.innerHTML = `<p class="success">${result.message}</p>`;
            } else {
                const result = await response.json();
                depositResult.innerHTML = `<p class="error">${result.error}</p>`;
            }
        } catch (error) {
            console.error('Error making withdrawal:', error.message);
            depositResult.innerHTML = `<p class="error">An unexpected error occurred.</p>`;
        }
    });
});

function getUserIdFromCookie() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userid') {
            return value;
        }
    }
    return null; // Return null if the userId cookie is not found
}