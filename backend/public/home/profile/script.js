document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
});

document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('updateBtn');

    updateBtn.addEventListener('click', async () => {
        const firstName = document.getElementById('firstName').value;
        const middleName = document.getElementById('middleName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;

        // Add more variables for other profile attributes

        const profileData = {
            firstName,
            middleName,
            lastName,
            dob
            // Add more attributes
        };

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
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const updateBtn = document.getElementById('updateBtn');

    updateBtn.addEventListener('click', async () => {
        // Fetch profile data from the server
        const userId = getUserId(); // Implement your own function to get the user ID
        const profileData = await fetchProfile(userId);

        // Update input fields with fetched data
        document.getElementById('firstName').value = profileData.first_name || '';
        document.getElementById('middleName').value = profileData.middle_name || '';
        document.getElementById('lastName').value = profileData.last_name || '';

        // Add more lines to update other input fields

        // Continue with the rest of your update logic
    });
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
