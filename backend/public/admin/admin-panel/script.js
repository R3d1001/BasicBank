// Check if the user is an admin (based on the session cookie)
document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = getCookie('isAdmin');

    if (!isAdmin) {
        // Redirect to the admin login page if the user is not an admin
        window.location.href = '../admin';
        alert("Authorized Access Only")
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    // Clear the session cookie and redirect to the admin login page
    document.cookie = 'isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = './admin-login';
});

// Function to retrieve a cookie value by name
function getCookie(name) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name))
        ?.split('=')[1];

    return cookieValue || null;
}
