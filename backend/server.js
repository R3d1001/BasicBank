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
                    date_of_birth,
                    age,
                    gender,
                    nationality,
                    cnic,
                    addr_street,
                    addr_city,
                    addr_country,
                    phone_number,
                    email
                 FROM profiles
                 WHERE user_id = :userId`,
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

