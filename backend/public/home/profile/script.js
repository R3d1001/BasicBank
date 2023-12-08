document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
});


document.addEventListener('DOMContentLoaded', async () => {
    const sendProfile = document.getElementById('sendProfile');

    sendProfile.addEventListener('click', async () => {
        try {
            // Get profile data from HTML elements
            const userId = getUserIdFromCookie();
            const firstName = document.getElementById('firstName').value;
            const middleName = document.getElementById('middleName').value;
            const lastName = document.getElementById('lastName').value;
            const nationality = document.getElementById('nationality').value;
            const street = document.getElementById('street').value;
            const city = document.getElementById('city').value;
            const country = document.getElementById('country').value;
            const phoneNo = document.getElementById('phoneNo').value;

            // Add more variables for other profile attributes

            const profileData = {
                userId,
                firstName,
                middleName,
                lastName,
                nationality,
                street,
                city,
                country,
                phoneNo
                // Add more attributes
            };
            console.log(profileData);
            // Send profile data to the server
            await sendProfileToServer(profileData);

        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    });
});

async function sendProfileToServer(profileData) {
    try {
        const response = await fetch('/updateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (response.ok) {
            console.log('Profile updated successfully');
        } else {
            console.error('Error updating profile:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating profile:', error.message);
    }
}

/*
document.addEventListener('DOMContentLoaded', async () => {
    const sendProfile = document.getElementById('sendProfile');

    sendProfile.addEventListener('click', async () => {
        try {
            // Send profile data to the server
            const userId = getUserIdFromCookie(); // Get user ID from the cookie

        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    });
});
*/

document.addEventListener('DOMContentLoaded', async () => {
    const updateBtn = document.getElementById('updateBtn');

    updateBtn.addEventListener('click', async () => {
        try {
            // Fetch profile data from the server
            const userId = getUserIdFromCookie(); // Get user ID from the cookie
            const profileData = await fetchProfile(userId);
            console.log(profileData);

            // Update input fields with fetched data
            document.getElementById('firstName').value = profileData[0] || '';
            document.getElementById('middleName').value = profileData[1] || '';
            document.getElementById('lastName').value = profileData[2] || '';
            document.getElementById('nationality').value = profileData[3] || '';
            document.getElementById('street').value = profileData[4] || '';
            document.getElementById('city').value = profileData[5] || '';
            document.getElementById('country').value = profileData[6] || '';
            document.getElementById('phoneNo').value = profileData[7] || '';
            // Add more lines to update other input fields

            // Continue with the rest of your update logic
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    });
    updateBtn.click();
});

async function fetchProfile(userId) {
    try {
        const response = await fetch(`/getProfile?userId=${userId}`);
        if (response.ok) {
            const profileData = await response.json();
            return profileData;
        } else {
            console.error('Error fetching profile:', response.statusText);
            return {};
        }
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        return {};
    }
}

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
