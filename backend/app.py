from flask import Flask, render_template
import oracledb

app = Flask(__name__)

# Define your Oracle DB connection details as a variable
oracle_db = {
    "user": "C##project",
    "password": "1234",
    "dsn": "localhost:1521/orcl"
}

@app.route('/')
def home():
    # Use the oracle_db variable here
    connection = oracledb.connect(user=oracle_db["user"], password=oracle_db["password"], dsn=oracle_db["dsn"])
    cursor = connection.cursor()

    # Execute a query
    cursor.execute("""
        select * from Customers where age=22
    """)

    # Fetch the results and column names
    results = cursor.fetchall()
    column_names = [desc[0] for desc in cursor.description]
    print(results)

    # Don't forget to close the connection
    cursor.close()
    connection.close()

    # Pass the results and column names to a template
    return render_template('index.html', results=results, column_names=column_names)

if __name__ == '__main__':
    app.run(debug=True)
