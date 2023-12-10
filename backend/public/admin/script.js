function login() {
    const adminUsername = document.getElementById('adminUsername').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const requestBody = {
        username: adminUsername,
        password: adminPassword
    };

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Configure it to send a POST request to the server
    xhr.open("POST", "/admin", true);
    xhr.setRequestHeader("Content-Type", "application/json"); // Set the content type to JSON

    // Set up a callback function to handle the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Successful response
                console.log(xhr.responseText);
                // Redirect the user to another page
                //window.location.href = "/home"; // Change "/dashboard" to the desired URL
                // Parse the JSON response
                const response = JSON.parse(xhr.responseText);
                // Check if the login was successful
                if (response.message === "Login successful") {
                    // Set the userID as a session cookie
                    document.cookie = `empid=${response.userID}; path=/`;
                    // Redirect the user to another page
                    window.location.href = "/admin/admin-panel"; // Change "/home" to the desired URL
                } else {
                // Handle login failure
                console.error("Login failed:", response.message);
                }
            } else {
                // Handle error
                console.error("Error:", xhr.statusText);
            }
        }
    };

    // Convert JSON object to string and send as the request body
    xhr.send(JSON.stringify(requestBody));
}

