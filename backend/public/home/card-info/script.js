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
    const userId = getUserIdFromCookie();
    const creditCardInfoContainer = document.getElementById('creditCardInfo');
    const debitCardInfoContainer = document.getElementById('debitCardInfo');

    // Fetch and display credit card info
    const creditCardInfo = await fetchCardInfo('getCreditCard', userId);
    displayCardInfo(creditCardInfo, creditCardInfoContainer);

    // Fetch and display debit card info
    const debitCardInfo = await fetchCardInfo('getDebitCard', userId);
    displayCardInfo(debitCardInfo, debitCardInfoContainer);
});

async function fetchCardInfo(endpoint, userId) {
    try {
        const response = await fetch(`/${endpoint}?userId=${userId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} info:`, error.message);
        return {};
    }
}

function displayCardInfo(cardInfo, container) {
    // Clear previous entries
    container.innerHTML = '';

    if (Object.keys(cardInfo).length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No card information available.';
        container.appendChild(message);
    } else if (Object.keys(cardInfo).length === 5) { // debit card
        // Create and append elements based on cardInfo
        // Customize this part based on your actual data structure
        const cardNumber = document.createElement('p');
        cardNumber.textContent = `Card Number: ${cardInfo[0]}`;
        container.appendChild(cardNumber);

        const cardholderName = document.createElement('p');
        cardholderName.textContent = `Cardholder Name: ${cardInfo[1]}`;
        container.appendChild(cardholderName);

        const daily_transaction_limit = document.createElement('p');
        daily_transaction_limit.textContent = `Daily Transaction Limit: ${cardInfo[2]}`;
        container.appendChild(daily_transaction_limit);

        const account_no = document.createElement('p');
        account_no.textContent = `Account Number: ${cardInfo[3]}`;
        container.appendChild(account_no);

        const card_status = document.createElement('p');
        card_status.textContent = `Card Status: ${cardInfo[4]}`;
        container.appendChild(card_status);

    } else { // credit card
        // Create and append elements based on cardInfo
        // Customize this part based on your actual data structure
        const cardNumber = document.createElement('p');
        cardNumber.textContent = `Card Number: ${cardInfo[0]}`;
        container.appendChild(cardNumber);

        const cardholderName = document.createElement('p');
        cardholderName.textContent = `Cardholder Name: ${cardInfo[1]}`;
        container.appendChild(cardholderName);

        const credit_for_spending = document.createElement('p');
        credit_for_spending.textContent = `Credit For Spending: ${cardInfo[2]}`;
        container.appendChild(credit_for_spending);

        const daily_transaction_limit = document.createElement('p');
        daily_transaction_limit.textContent = `Daily Transaction Limit: ${cardInfo[3]}`;
        container.appendChild(daily_transaction_limit);

        const account_no = document.createElement('p');
        account_no.textContent = `Account Number: ${cardInfo[4]}`;
        container.appendChild(account_no);

        const card_status = document.createElement('p');
        card_status.textContent = `Card Status: ${cardInfo[5]}`;
        container.appendChild(card_status);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const cancelCreditCardBtn = document.getElementById('cancelCreditCardBtn');
    const cancelDebitCardBtn = document.getElementById('cancelDebitCardBtn');

    // Add click event listener for canceling credit card
    cancelCreditCardBtn.addEventListener('click', async () => {
        try {
            const userId = getUserIdFromCookie();
            if (userId) {
                await cancelCreditCard(userId);
                // Optionally, you can update the UI or show a success message
            }
        } catch (error) {
            console.error('Error canceling credit card:', error.message);
        }
    });

    // Add click event listener for canceling debit card
    cancelDebitCardBtn.addEventListener('click', async () => {
        try {
            const userId = getUserIdFromCookie();
            if (userId) {
                await cancelDebitCard(userId);
                // Optionally, you can update the UI or show a success message
            }
        } catch (error) {
            console.error('Error canceling debit card:', error.message);
        }
    });
});

async function cancelCreditCard(userId) {
    // Make a POST request to cancel credit card
    const response = await fetch('/cancelCredit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    // Handle the response as needed
    console.log(data);
}

async function cancelDebitCard(userId) {
    // Make a POST request to cancel debit card
    const response = await fetch('/cancelDebit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    // Handle the response as needed
    console.log(data);
}
