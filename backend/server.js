const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure Oracle Database connection details
const dbConfig = {
    user: 'c##backendTest',
    password: '123',
    connectString: 'localhost:1521',
};





// get all loans
app.post('/cancelDebit', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Invalid employeeid for loans' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT account_no FROM accounts WHERE customer_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No accounts for this customer.' });
                return;
            }
            acc_id=Number(acc.rows[0]);
            const result = await connection.execute(
                `SELECT card_no
                FROM Debit_Cards
                WHERE account_no = :acc_id`,
                [acc_id]
            );
            const card_num=Number(result.rows[0]);
            //approve the loan
            await connection.execute(
                `BEGIN
                    DeleteDebitCard(:card_num);
                END;`,
                {
                    card_num:card_num
                }
            );
            const mes="Sucessfully deleted credit card";
            console.log(mes);
            connection.execute(`commit`);
            res.json({ success: true, message: mes });

        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
        // Implement your logic to fetch current loans for the user from the database
        // You can perform a SELECT query based on the userId

    } catch (error) {
        console.error('Error fetching current loans:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// get all loans
app.post('/cancelCredit', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Invalid customer id' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT account_no FROM accounts WHERE customer_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No accounts for this customer.' });
                return;
            }
            acc_id=Number(acc.rows[0]);
            const result = await connection.execute(
                `SELECT card_no
                FROM credit_cards
                WHERE account_no = :acc_id`,
                [acc_id]
            );
            const card_num=Number(result.rows[0]);
            //approve the loan
            await connection.execute(
                `BEGIN
                    DeleteCreditCard(:card_num);
                END;`,
                {
                    card_num:card_num
                }
            );
            const mes="Sucessfully deleted credit card";
            console.log(mes);
            connection.execute(`commit`);
            res.json({ success: true, message: mes });

        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
        // Implement your logic to fetch current loans for the user from the database
        // You can perform a SELECT query based on the userId

    } catch (error) {
        console.error('Error fetching current loans:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});







app.get('/withdrawal-history-all', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId } = req.query;
        console.log(req.body);
        // Validate the incoming data
        if (!userId) {
            res.status(400).json({ error: 'Invalid Transaction request.' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT Job_Title FROM Employees WHERE employee_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Target Role: "+String(acc.rows[0]));
            acc_id=String(acc.rows[0]);
            //see job permissions
            const acc2 = await connection.execute(
                `SELECT Transfer_Perm FROM Job_Roles WHERE Job_Title = :acc_id`,
                { acc_id }
            );
            if (acc2.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Transfer perm: "+String(acc2.rows[0]));
            if (Number(acc2.rows[0])==0){
                console.log("Insufficient permissions");
                res.json('Insufficient Permissions');
            }
            else{
                //get all transactions
                const transfer_list = await connection.execute(
                    `SELECT * FROM withdrawals`
                );
                console.log(transfer_list.rows[0]);
                res.json(transfer_list.rows);
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error get all transactions:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// approve loan
app.post('/approve-loan', async (req, res) => {
    try {
        const { userId,loanAmount } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Invalid employeeid for loans' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT Job_Title FROM Employees WHERE employee_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Target Role: "+String(acc.rows[0]));
            acc_id=String(acc.rows[0]);
            //see job permissions
            const acc2 = await connection.execute(
                `SELECT Loan_perm FROM Job_Roles WHERE Job_Title = :acc_id`,
                { acc_id }
            );
            if (acc2.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Loans perm: "+String(acc2.rows[0]));
            if (Number(acc2.rows[0])==0){
                console.log("Insufficient permissions");
                res.json('Insufficient Permissions');
            }
            else{
                //approve the loan
                await connection.execute(
                    `BEGIN
                        ApproveLoan(:loanAmount);
                     END;`,
                    {
                        loanAmount:loanAmount
                    }
                );
                const mes="Sucessfully approved for a loan of id"+ String(loanAmount);
                console.log(mes);
                connection.execute(`commit`);
                res.json({ success: true, message: mes });
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
        // Implement your logic to fetch current loans for the user from the database
        // You can perform a SELECT query based on the userId

    } catch (error) {
        console.error('Error fetching current loans:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});









// get all loans
app.post('/getloans-all', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Invalid employeeid for loans' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT Job_Title FROM Employees WHERE employee_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Target Role: "+String(acc.rows[0]));
            acc_id=String(acc.rows[0]);
            //see job permissions
            const acc2 = await connection.execute(
                `SELECT Loan_perm FROM Job_Roles WHERE Job_Title = :acc_id`,
                { acc_id }
            );
            if (acc2.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Loans perm: "+String(acc2.rows[0]));
            if (Number(acc2.rows[0])==0){
                console.log("Insufficient permissions");
                res.json('Insufficient Permissions');
            }
            else{
                //get all loans
                const loan_list = await connection.execute(
                    `SELECT * FROM loans`
                );
                console.log(loan_list.rows[0]);
                res.json(loan_list.rows);
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
        // Implement your logic to fetch current loans for the user from the database
        // You can perform a SELECT query based on the userId

    } catch (error) {
        console.error('Error fetching current loans:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});







app.get('/transaction-history-all', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId } = req.query;
        console.log(req.body);
        // Validate the incoming data
        if (!userId) {
            res.status(400).json({ error: 'Invalid Transaction request.' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            // see which job title they have
            const acc = await connection.execute(
                `SELECT Job_Title FROM Employees WHERE employee_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Target Role: "+String(acc.rows[0]));
            acc_id=String(acc.rows[0]);
            //see job permissions
            const acc2 = await connection.execute(
                `SELECT Transfer_Perm FROM Job_Roles WHERE Job_Title = :acc_id`,
                { acc_id }
            );
            if (acc2.rows.length === 0) {
                res.status(404).json({ error: 'No account found.' });
                return;
            }
            console.log("Transfer perm: "+String(acc2.rows[0]));
            if (Number(acc2.rows[0])==0){
                console.log("Insufficient permissions");
                res.json('Insufficient Permissions');
            }
            else{
                //get all transactions
                const transfer_list = await connection.execute(
                    `SELECT * FROM transfers`
                );
                console.log(transfer_list.rows[4]);
                res.json(transfer_list.rows);
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error get all transactions:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Connect to the Oracle Database
        const connection = await oracledb.getConnection(dbConfig);

        // Query the database for the provided username and password
        const result = await connection.execute(
            'SELECT Employee_No,Login_Password FROM Emp_Login_Info WHERE Employee_No = :username AND Login_Password = :password',
            { username, password }
        );
        res.json({ message: 'Login successful', userID: username });
        // Release the Oracle Database connection
        await connection.close();
    } catch (error) {
        console.error('Error connecting to Oracle Database:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to get credit card info
app.get('/getCreditCard', async (req, res) => {
    try {
        const { userId } = req.query;

        // Perform the logic to fetch credit card info from the database
        const connection = await oracledb.getConnection(dbConfig);
        const acc = await connection.execute(
            `SELECT account_no FROM accounts WHERE customer_no = :userId`,
            { userId }
        );
        if (acc.rows.length === 0) {
            res.status(404).json({ error: 'No accounts for this customer.' });
            return;
        }
        acc_id=Number(acc.rows[0]);
        const result = await connection.execute(
            `SELECT card_no, cardholder_name, credit_for_spending, daily_transaction_limit, account_no, card_status
            FROM credit_cards
            WHERE account_no = :acc_id`,
            [acc_id]
        );

        if (result.rows.length > 0) {
            const creditCardInfo = result.rows[0];
            console.log(result.rows[0]);
            res.json(creditCardInfo);
        } else {
            res.json({}); // Empty response if no credit card info found
        }
        await connection.close();

    } catch (error) {
      console.error('Error fetching credit card info:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get debit card info
app.get('/getDebitCard', async (req, res) => {
try {
    const { userId } = req.query;

    // Perform the logic to fetch debit card info from the database
    const connection = await oracledb.getConnection(dbConfig);
    const acc = await connection.execute(
        `SELECT account_no FROM accounts WHERE customer_no = :userId`,
        { userId }
    );
    if (acc.rows.length === 0) {
        res.status(404).json({ error: 'No accounts for this customer.' });
        return;
    }
    acc_id=Number(acc.rows[0]);
    const result = await connection.execute(
    `SELECT card_no, cardholder_name, daily_transaction_limit, account_no, card_status
        FROM debit_cards
        WHERE account_no = :acc_id`,
    [acc_id]
    );

    if (result.rows.length > 0) {
        const debitCardInfo = result.rows[0];
        console.log(result.rows[0]);
        res.json(debitCardInfo);
    } else {
        res.json({}); // Empty response if no debit card info found
    }
    await connection.close();

} catch (error) {
    console.error('Error fetching debit card info:', error.message);
    res.status(500).json({ error: 'Internal server error' });
}
});








// Get interest rate for loans
app.post('/interestRate', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(req.body);
        if (!userId) {
            res.status(400).json({ error: 'Invalid Loan Userid.' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            const acc = await connection.execute(
                `SELECT interest_rate FROM accounts WHERE customer_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No accounts for this customer.' });
                return;
            }
            const interestRate=acc.rows[0];
            const mes=String(interestRate);
            console.log(mes);
            res.json({ success: true, message: mes });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error fetching interest rate:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

// Submit loan application
app.post('/loans', async (req, res) => {
try {
    const { userId, loanAmount } = req.body;
    console.log(userId);
    console.log(loanAmount);
    if (!userId||!loanAmount||loanAmount<=0) {
        res.status(400).json({ error: 'Invalid Loan request' });
        return;
    }
    let connection;
    try {
        //get the account id of the customer
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT account_no,interest_rate FROM accounts WHERE customer_no = :userId`,
            { userId }
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'No accounts for this customer.' });
            return;
        }
        //console.log("Target accounts: "+String(acc.rows[0]));
        //acc_id=Number(acc.rows[0]);

        const rowData = result.rows[0];
            const acc_id = rowData[0]; // Access the values by index
            const interestRate = rowData[1];
        //get the interest rate for this account


        //add the loan into pending request

        await connection.execute(
            `INSERT INTO Loans (loan_rate, initial_amount, account_no) VALUES (:interestRate, :loanAmount, :acc_id,)`,
            { interestRate, loanAmount, acc_id }
        );

        const mes="Sucessfully applied for a loan of "+ String(loanAmount)+ "for your account id "+String(acc_id)+" at a rate of "+String(interestRate);
        console.log(mes);
        res.json({ success: true, message: mes });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err.message);
            }
        }
    }
    // Implement your logic to insert the loan application into the database
    // You can also perform additional validation and business logic here

    // Placeholder response, modify as needed
    res.json({ message: 'Loan application submitted successfully' });
} catch (error) {
    console.error('Error submitting loan application:', error.message);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Get current loans for a user
app.post('/getloans', async (req, res) => {
try {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ error: 'Invalid userid for loans' });
        return;
    }
    let connection;
    try {
        //get the account id of the customer
        connection = await oracledb.getConnection(dbConfig);
        const acc = await connection.execute(
            `SELECT account_no FROM accounts WHERE customer_no = :userId`,
            { userId }
        );
        if (acc.rows.length === 0) {
            res.status(404).json({ error: 'No accounts for this customer.' });
            return;
        }
        console.log("Target accounts: "+String(acc.rows[0]));
        acc_id=Number(acc.rows[0]);
        const loan_list = await connection.execute(
            `SELECT * FROM loans WHERE account_no = :acc_id`,
            { acc_id }
        );
        console.log(loan_list.rows[0]);
        res.json(loan_list.rows);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err.message);
            }
        }
    }
    // Implement your logic to fetch current loans for the user from the database
    // You can perform a SELECT query based on the userId

} catch (error) {
    console.error('Error fetching current loans:', error.message);
    res.status(500).json({ error: 'Internal server error' });
}
});






app.get('/transaction-history', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId } = req.query;
        console.log(req.body);
        // Validate the incoming data
        if (!userId) {
            res.status(400).json({ error: 'Invalid Transaction request.' });
            return;
        }
        let connection;
        try {
            connection = await oracledb.getConnection(dbConfig);
            const acc = await connection.execute(
                `SELECT account_no FROM accounts WHERE customer_no = :userId`,
                { userId }
            );
            if (acc.rows.length === 0) {
                res.status(404).json({ error: 'No accounts for this customer.' });
                return;
            }
            console.log("Target accounts: "+String(acc.rows[0]));
            acc_id=Number(acc.rows[0]);
            const transfer_list = await connection.execute(
                `SELECT * FROM transfers WHERE send_account_no = :acc_id OR dest_account_no = :acc_id`,
                { acc_id }
            );
            console.log(transfer_list.rows[4]);
            res.json(transfer_list.rows);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/make-transaction', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId, amount,targetAccount } = req.body;
        console.log(req.body);
        // Validate the incoming data
        if (!userId|| !targetAccount  || !amount || isNaN(amount) || amount <= 0) {
            res.status(400).json({ error: 'Invalid Transaction request.' });
            return;
        }
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            // Retrieve the current balance from the database
            const result = await connection.execute(
                `SELECT balance FROM accounts WHERE customer_no = :userId`,
                { userId }
            );
            console.log("Current balance: "+String(result.rows[0]));
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'User not found.' });
                return;
            }
            const currentBalance = Number(result.rows[0]);
            console.log("Amount to send: "+String(amount));
            if(currentBalance-Number(amount)<0){
                res.json({ success: true, message: 'Transfer failed. Not enough Balance' });
            }
            else{
                const acc = await connection.execute(
                    `SELECT account_no FROM accounts WHERE account_no = :targetAccount`,
                    { targetAccount }
                );
                console.log("Target account: "+String(acc.rows[0]));
                if (acc.rows.length === 0) {
                    res.status(404).json({ error: 'Account not found.' });
                    return;
                }
                await connection.execute(
                    `BEGIN
                        TransferMoney(:userId, :targetAccount, :amount);
                     END;`,
                    {
                      userId: userId,
                      targetAccount: targetAccount,
                      amount: amount
                    }
                  );
                /*
                //reduce the senders balance
                await connection.execute(
                    `UPDATE accounts SET balance = :newBalance WHERE customer_no = :userId`,
                    { newBalance: currentBalance - Number(amount), userId }
                );
                console.log("New Balance: "+String(currentBalance - Number(amount)));
                //get the recievers current balance
                const res2 = await connection.execute(
                    `SELECT balance FROM accounts WHERE account_no = :targetAccount`,
                    { targetAccount }
                );
                const currentBalanceReciever = Number(res2.rows[0]);
                //increase the recievers balance
                console.log("Reciever current Balance: "+String(currentBalanceReciever));
                await connection.execute(
                    `UPDATE accounts SET balance = :newBalance WHERE account_no = :targetAccount`,
                    { newBalance: currentBalanceReciever + Number(amount), targetAccount }
                );
                console.log("Reciever New Balance: "+String(currentBalanceReciever + Number(amount)));
                //get the current users account id
                const useracc = await connection.execute(
                    `SELECT account_no FROM accounts WHERE customer_no = :userId`,
                    { userId }
                );
                console.log("Current user acc: "+String(useracc.rows[0]));
                //add the current transaction to the transaction history
                send_account_no=Number(useracc.rows[0]);
                dest_account_no=Number(acc.rows[0]);
                await connection.execute(
                    `INSERT INTO transfers (send_account_no, dest_account_no, amount) VALUES (:send_account_no, :dest_account_no, :amount)`,
                    { send_account_no, dest_account_no, amount }
                );
                */
                connection.execute(`commit`);
                const mes="Transfer Successful. Remaining balance: "+String(currentBalance - Number(amount))
                +"\nSent to account number "+String(targetAccount);
                console.log(mes);
                res.json({ success: true, message: mes });
            }

        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});






app.post('/withdraw', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId, amount } = req.body;
        console.log(req.body);

        // Validate the incoming data
        if (!userId || !amount || isNaN(amount) || amount <= 0) {
            res.status(400).json({ error: 'Invalid withdraw request.' });
            return;
        }

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            // Retrieve the current balance from the database
            const result = await connection.execute(
                `SELECT balance FROM accounts WHERE customer_no = :userId`,
                { userId }
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'User not found.' });
                return;
            }

            const currentBalance = Number(result.rows[0]);
            console.log(currentBalance);
            if(currentBalance-Number(amount)<0){
                res.json({ success: true, message: 'Withdrawal failed. Not enough Balance' });
            }
            else{
                // Update the balance in the database
                await connection.execute(
                    `BEGIN
                        WithdrawMoney(:userId, :amount);
                     END;`,
                    {
                      userId: userId,
                      amount: amount
                    }
                  );
                /*
                await connection.execute(
                    `UPDATE accounts SET balance = :newBalance WHERE customer_no = :userId`,
                    { newBalance: currentBalance - Number(amount), userId }
                );
                */
                //console.log('Current Balance:', currentBalance);
                //console.log('Amount:', amount);
                connection.execute(`commit`);
                //console.log(currentBalance - Number(amount));
                const mes="Withdrawal Successful. Remaining balance: "+String(currentBalance - Number(amount));
                console.log(mes);
                res.json({ success: true, message: mes });
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

        /*
        // Perform the deposit logic (this is a placeholder, update as needed)
        // You might want to save the deposit in your database, update user balance, etc.

        // Assuming a successful deposit for demonstration purposes
        res.json({ success: true, message: 'Deposit successful.' });
        */
    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/deposit', async (req, res) => {
    try {
        // Extract data from the request body
        const { userId, amount } = req.body;
        console.log(req.body);

        // Validate the incoming data
        if (!userId || !amount || isNaN(amount) || amount <= 0) {
            res.status(400).json({ error: 'Invalid deposit request.' });
            return;
        }

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            // Retrieve the current balance from the database
            const result = await connection.execute(
                `SELECT balance FROM accounts WHERE customer_no = :userId`,
                { userId }
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'User not found.' });
                return;
            }

            const currentBalance = Number(result.rows[0]);
            console.log(currentBalance);
            // Update the balance in the database
            await connection.execute(
                `BEGIN
                    DepositMoney(:userId, :amount);
                 END;`,
                {
                  userId: userId,
                  amount: amount
                }
              );
            /*
            await connection.execute(
                `UPDATE accounts SET balance = :newBalance WHERE customer_no = :userId`,
                { newBalance: currentBalance + Number(amount), userId }
            );
            */
            console.log('Current Balance:', currentBalance);
            console.log('Amount:', amount);
            connection.execute(`commit`);
            console.log(currentBalance + Number(amount));
            const mes="Deposit Successful. Remaining balance: "+String(currentBalance + Number(amount));
            console.log(mes);
            res.json({ success: true, message: mes });

        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }

        /*
        // Perform the deposit logic (this is a placeholder, update as needed)
        // You might want to save the deposit in your database, update user balance, etc.

        // Assuming a successful deposit for demonstration purposes
        res.json({ success: true, message: 'Deposit successful.' });
        */
    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});





app.post('/updateProfile', async (req, res) => {
    try {
        const userId = req.body.userId; // Assuming userId is included in the request body
        const firstName = req.body.firstName;
        const middleName = req.body.middleName;
        const lastName = req.body.lastName;
        const nationality = req.body.nationality;
        const street = req.body.street;
        const city = req.body.city;
        const country = req.body.country;
        const phoneNo = req.body.phoneNo;
        // Add more variables for other profile attributes
        console.log(req.body);
        // Validate the incoming data
        /*
        if (!userId || !firstName || !lastName) {
            res.status(400).json({ error: 'Invalid request. userId, firstName, and lastName are required.' });
            return;
        }
        */

        // Establish a database connection
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            // Update the profile information in the database
            const result = await connection.execute(
                `UPDATE customers
                 SET first_name = :firstName,
                     middle_name = :middleName,
                     last_name = :lastName,
                     nationality = :nationality,
                     addr_street = :street,
                     addr_city = :city,
                     addr_country = :country,
                     phone_No = :phoneNo
                 WHERE customer_no = :userId`,
                {
                    userId,
                    firstName,
                    middleName,
                    lastName,
                    nationality,
                    street,
                    city,
                    country,
                    phoneNo
                }
            );
            connection.execute(`commit`);
            // Check if the update was successful
            if (result.rowsAffected > 0) {
                res.json({ success: true, message: 'Profile updated successfully.' });
            } else {
                res.status(404).json({ error: 'Profile not found or no changes made.' });
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});







app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Connect to the Oracle Database
        const connection = await oracledb.getConnection(dbConfig);

        // Query the database for the provided username and password
        const result = await connection.execute(
            'SELECT Email,Login_Password FROM Cust_Login_Info WHERE Email = :username AND Login_Password = :password',
            { username, password }
        );

        // Check if the user was found
        if (result.rows.length > 0) {
            // Query the database for the customer number based on the username
            const id_of_user = await connection.execute(
                'SELECT Customer_No FROM Customers WHERE Email = :username',
                { username }
            );
            // Check if the user was found in the second query
            if (id_of_user.rows.length > 0) {
                const user = id_of_user.rows[0];
                const userId = user[0]; // Assuming Customer_No is the first column in the result

                // Send a JSON response with user ID
                res.json({ message: 'Login successful', userID: userId });
            } else {
                res.status(401).send('User not found'); // Send an unauthorized status
            }
            /*
            const user = id_of_user.rows[0];
            const userId = user[0]; // Assuming User_ID is the first column in the result
            // Send a JSON response with user ID
            res.json({message:'Login successful',userID:userId}); // Send a success message
            */
        } else {
            res.status(401).send('Invalid username or password'); // Send an unauthorized status
        }

        // Release the Oracle Database connection
        await connection.close();
    } catch (error) {
        console.error('Error connecting to Oracle Database:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Define a route to handle the getBalance request
app.get('/getBalance', async (req, res) => {
    try {
        // Extract the user ID from the query parameters
        const userId = req.query.userId;
        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);
            // Query the database to fetch currency_type and balance for the provided userId
            const result = await connection.execute(
                'SELECT currency_type, balance FROM accounts WHERE customer_no = :userId',
                { userId }
            );
            if (result.rows.length > 0) {
                const rowData = result.rows[0];
                const currency_type = rowData[0]; // Access the values by index
                const balance = rowData[1];
                //console.log(result.rows[0]);
                res.json({ currency_type, balance });
            } else {
                throw new Error('User not found');
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching balance:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define a route to handle the getProfile request
app.get('/getProfile', async (req, res) => {
    try {
        // Extract the user ID from the query parameters (assuming it's passed as a query parameter)
        const userId = req.query.userId;

        // Validate userId and establish a database connection
        if (!userId) {
            res.status(400).json({ error: 'User ID is required.' });
            return;
        }

        let connection;

        try {
            connection = await oracledb.getConnection(dbConfig);

            // Query the database to fetch profile information for the provided userId
            const result = await connection.execute(
                `SELECT
                    first_name,
                    middle_name,
                    last_name,
                    nationality,
                    addr_street,
                    addr_city,
                    addr_country,
                    phone_no
                 FROM customers
                 WHERE customer_no = :userId`,
                { userId }
                //,{ outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length > 0) {
                // Send the profile information as JSON
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Profile not found.' });
            }
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err.message);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
// Example function to fetch the user's balance from the database
async function fetchBalanceFromDatabase(userId) {
    // Replace this with your actual database query logic
    // Use the userId to query the database and retrieve the user's balance
    // Return the balance information as an object
    // return {
    //     balance: 1000.0, // Replace with the actual balance value
    //     currency_type: 'USD' // Replace with the actual currency type
    // };


}


// Define a route to handle the getBalance request
app.get('/getBalance', async (req, res) => {
    try {
        // Extract the user ID from the query parameters
        const userId = req.query.userId;

        // Use the userId to fetch the user's balance from the database
        // Replace this with your actual database query logic
        const result = await fetchBalanceFromDatabase(userId);
        // Send the balance information as JSON
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching balance:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Example function to fetch the user's balance from the database
async function fetchBalanceFromDatabase(userId) {
    // Replace this with your actual database query logic
    // Use the userId to query the database and retrieve the user's balance
    // Return the balance information as an object
    // return {
    //     balance: 1000.0, // Replace with the actual balance value
    //     currency_type: 'USD' // Replace with the actual currency type
    // };
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Query the database to fetch currency_type and balance for the provided userId
        const result = await connection.execute(
            'SELECT currency_type, balance FROM accounts WHERE customer_no = :userId',
            { userId }
            //,{ outFormat: oracledb.OUT_FORMAT_OBJECT } // Specify the result format
        );
        if (result.rows.length > 0) {
            const { currency_type, balance } = result.rows[0];
            console.log(result.rows[0]);
            return { "currency_type":currency_type, "balance":balance };

        } else {
            throw new Error('User not found');
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err.message);
            }
        }
    }

}

*/
// Handle POST request for login
/*
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Connect to the Oracle Database
        const connection = await oracledb.getConnection(dbConfig);

        // Query the database for the provided username and password
        const result = await connection.execute(
            `SELECT * FROM users WHERE username = :username AND password = :password`,
            { username, password }
        );

        // Check if the user was found
        if (result.rows.length > 0) {
            res.send('Login successful'); // Send a success message
        } else {
            res.status(401).send('Invalid username or password'); // Send an unauthorized status
        }

        // Release the Oracle Database connection
        await connection.close();
    } catch (error) {
        console.error('Error connecting to Oracle Database:', error);
        res.status(500).send('Internal Server Error');
    }
});
*/
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

