document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
});
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch the user ID from the cookie
    const userId = getCookie('userid');
    console.log(userId);
    if (userId) {
        try {
            // Make a request to the server to get the user's balance
            const response = await fetch(`/getBalance?userId=${userId}`);
            const data = await response.json();

            if (response.ok) {
                const { balance, currency_type } = data;
                const formattedBalance = `${currency_type} ${balance.toFixed(2)}`;
                document.getElementById('balance').textContent = formattedBalance;
            } else {
                console.error('Error fetching balance:', data.message);
                document.getElementById('balance').textContent = 'Error fetching balance';
            }
        } catch (error) {
            console.error('Error fetching balance:', error.message);
            document.getElementById('balance').textContent = 'Error fetching balance';
        }
    }
});

// Function to get the value of a cookie by its name
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}