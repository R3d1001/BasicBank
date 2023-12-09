document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
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

document.addEventListener('DOMContentLoaded', async () => {
    const loanForm = document.getElementById('loanForm');
    const interestRateDisplay = document.getElementById('interestRateDisplay');
    const getLoansBtn = document.getElementById('getLoansBtn');
    const loanList = document.getElementById('loanList');

    // Display interest rate on loan form load
    const interestRate = await fetchInterestRate();
    interestRateDisplay.textContent = `Current Interest Rate: ${interestRate}%`;

    // Submit loan form
    loanForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = getUserIdFromCookie();
        const loanAmount = document.getElementById('loanAmount').value;

        // Validate and submit loan application
        if (userId && loanAmount) {
            await submitLoanApplication(userId, loanAmount);
        }
    });

    // Get current loans on button click
    getLoansBtn.addEventListener('click', async () => {
        const userId = getUserIdFromCookie();
        if (userId) {
            const loans = await getCurrentLoans(userId);
            console.log('Raw response:', loans);
            displayLoans(loans);
        }
    });
});

async function fetchInterestRate() {
    try {
        const userId = getUserIdFromCookie();
        const response = await fetch(`/interestRate?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Remove the body from the request
        });
        const data = await response.json();
        return data.message; // Change this line to use the correct key
    } catch (error) {
        console.error('Error fetching interest rate:', error.message);
        return 0; // Default interest rate
    }
}



async function submitLoanApplication(userId, loanAmount) {
    try {
        const response = await fetch('/loans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, loanAmount }),
        });

        if (response.ok) {
            console.log('Loan application submitted successfully');
        } else {
            console.error('Error submitting loan application:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting loan application:', error.message);
    }
}

async function getCurrentLoans(userId) {
    try {
        const response = await fetch('/getloans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Error fetching current loans:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching current loans:', error.message);
        return [];
    }
}

function displayLoans(loans) {
    const loanList = document.getElementById('loanList');
    loanList.innerHTML = ''; // Clear previous entries

    if (!loans || !Array.isArray(loans)) {
        const listItem = document.createElement('li');
        listItem.textContent = 'Error fetching loans.';
        loanList.appendChild(listItem);
    } else if (loans.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No current loans.';
        loanList.appendChild(listItem);
    } else {
        loans.forEach((loan) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Loan ID: ${loan[0]}, Loan Amount: ${loan[3]}, Loan Rate: ${loan[1]}, Loan Date: ${loan[2]}, Status: ${loan[8]}, Outstanding Balance: ${loan[4]}, Next Payable: ${loan[5]} , Next Payable Amount: ${loan[6]}`;
            loanList.appendChild(listItem);
        });
    }
}


/*
function displayLoans(loans) {
    const loanList = document.getElementById('loanList');
    loanList.innerHTML = ''; // Clear previous entries

    if (loans.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No current loans.';
        loanList.appendChild(listItem);
    } else {
        loans.forEach((loan) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Loan Amount: ${loan.amount}, Status: ${loan.status}`;
            loanList.appendChild(listItem);
        });
    }
}
*/