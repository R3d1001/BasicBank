function login() {
    const adminUsername = document.getElementById('adminUsername').value;
    const adminPassword = document.getElementById('adminPassword').value;

    // Simulate an AJAX request to the server for admin authentication
    // Replace this with your actual server-side authentication logic
    const mockApiResponse = {
        success: adminUsername === 'admin' && adminPassword === 'admin', // Replace with your actual authentication logic
    };

    if (mockApiResponse.success) {
        // Set a session cookie (this is not secure and should be done server-side)
        //document.cookie = btoa('isAdmin=true');
        document.cookie = 'isAdmin=true';
        // Redirect to the admin panel upon successful login
        window.location.href = './admin-panel';
    } else {
        alert('Admin login failed. Please check your username and password.');
    }
}
