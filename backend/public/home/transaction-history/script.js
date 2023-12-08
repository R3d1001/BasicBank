document.getElementById('logoutBtn').addEventListener('click', function() {
    // Perform logout logic here
    // Redirect the user to the login page, for example
    window.location.href = './';
});

document.addEventListener('DOMContentLoaded', () => {
    const userId = getUserIdFromCookie();
    const transactionHistoryContainer = document.getElementById('transactionHistory');

    // Fetch transaction history from the server
    fetch(`/transaction-history?userId=${userId}`)
        .then(response => response.json())
        .then(transactionHistory => {
            // Display the transaction history in the container
            displayTransactionHistory(transactionHistory);
        })
        .catch(error => {
            console.error('Error fetching transaction history:', error.message);
            transactionHistoryContainer.innerHTML = '<p>Error fetching transaction history</p>';
        });
});


function displayTransactionHistory(transactionHistory) {
    const transactionHistoryContainer = document.getElementById('transactionHistory');

    if (transactionHistory.length === 0) {
        transactionHistoryContainer.innerHTML = '<p>No transactions found.</p>';
    } else {
        const transactionList = document.createElement('ul');

        transactionHistory.forEach(transaction => {
            const listItem = document.createElement('li');
            // Access the properties using array indices
            listItem.textContent = `Transaction No: ${transaction[0]}, Amount: ${transaction[5]}, Sender Account: ${transaction[1]}, Receiver Account: ${transaction[2]}, Date: ${transaction[3]}, Time: ${transaction[4]}, Status: ${transaction[6]}`;
            transactionList.appendChild(listItem);
        });

        transactionHistoryContainer.appendChild(transactionList);
    }
}



/*
function displayTransactionHistory(transactionHistory) {
    const transactionHistoryContainer = document.getElementById('transactionHistory');

    if (transactionHistory.length === 0) {
        transactionHistoryContainer.innerHTML = '<p>No transactions found.</p>';
    } else {
        const transactionList = document.createElement('ul');

        transactionHistory.forEach(transaction => {
            const listItem = document.createElement('li');
            listItem.textContent = `Amount: ${transaction.amount}, Sender Account: ${transaction.send_account_no}, Receiver Account: ${transaction.dest_account_no}`;
            transactionList.appendChild(listItem);
        });

        transactionHistoryContainer.appendChild(transactionList);
    }
}
*/
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