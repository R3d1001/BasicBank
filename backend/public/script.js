document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('loginFormContainer').style.display = 'flex';
});

function closeLoginForm() {
    document.getElementById('loginFormContainer').style.display = 'none';
}

function login() {
    // Retrieve user credentials
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulate an AJAX request to the server
    // In a real-world scenario, replace this with an actual AJAX request to your server
    // (Ensure your server has proper security measures and use HTTPS for real-world applications)
    // Assume the server responds with a JSON object containing a 'success' property
    // indicating whether the login was successful
    const mockApiResponse = {
        success: username === 'user' && password === 'user', // Replace with your actual authentication logic
    };

    if (mockApiResponse.success) {
        alert('Login successful! Redirecting to home page...');
        closeLoginForm();

        // Redirect to the home page upon successful login
        window.location.href = './home';
    } else {
        // Display an error message for failed login
        //alert('Login failed. Please check your username and password.');
    }
}

// Check if the user is logged in before allowing access to the home page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    const isLoggedIn = /* Replace this with your actual authentication check */ true;

    if (currentPage === '/home' && !isLoggedIn) {
        // Redirect to the login page if the user is not logged in
        window.location.href = './';
    }
});
