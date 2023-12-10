DECLARE
  table_count NUMBER;
BEGIN
  -- Disable foreign key constraints
  EXECUTE IMMEDIATE 'ALTER SESSION SET CONSTRAINTS = DEFERRED';

  -- Drop tables
  FOR tables IN (SELECT table_name FROM user_tables) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || tables.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;

  -- Enable foreign key constraints
  EXECUTE IMMEDIATE 'ALTER SESSION SET CONSTRAINTS = IMMEDIATE';
END;
/
DROP SEQUENCE Card_No_Seq;
DROP SEQUENCE Loan_No_Seq;
DROP SEQUENCE Account_No_Seq;
DROP SEQUENCE Transaction_No_Seq;
DROP SEQUENCE Customer_No_Seq;
DROP SEQUENCE Employee_No_Seq;





commit;


--Tables
--Using Number(1) for boolean 1=true and 0=false
CREATE TABLE Status_Info (
    Status_Code NUMBER PRIMARY KEY,
    Description VARCHAR2(255)
);
CREATE TABLE Customers (
    Customer_No NUMBER PRIMARY KEY,
    First_Name VARCHAR2(30),
    Middle_Name VARCHAR2(30),
    Last_Name VARCHAR2(30),
    Date_Of_Birth DATE,
    Age NUMBER(3),
    Gender VARCHAR2(6),
    Nationality VARCHAR2(50),
    CNIC NUMBER(13),
    Addr_Street VARCHAR2(255),
    Addr_City VARCHAR2(255),
    Addr_Country VARCHAR2(255),
    Phone_No NUMBER(12),
    Email VARCHAR2(255) UNIQUE
);
CREATE TABLE Cust_Login_Info (
    Email VARCHAR2(255) PRIMARY KEY,
    Login_Password VARCHAR2(255),
    Mother_Name VARCHAR2(255),
    Security_Question_1 VARCHAR2(255),
    Security_Answer_1 VARCHAR2(255),
    Security_Question_2 VARCHAR2(255),
    Security_Answer_2 VARCHAR2(255),
    Last_Login TIMESTAMP,
    CONSTRAINT Customers_FK FOREIGN KEY (Email) REFERENCES Customers(Email)
);
CREATE TABLE Job_Roles (
    Job_Title VARCHAR2(255) PRIMARY KEY,
    Customer_Perm NUMBER(1),
    Staff_Perm NUMBER(1),
    Transfer_Perm NUMBER(1),
    Card_Perm NUMBER(1),
    Loan_Perm NUMBER(1)
);
CREATE TABLE Employees (
    Employee_No NUMBER PRIMARY KEY,
    First_Name VARCHAR2(30),
    Middle_Name VARCHAR2(30),
    Last_Name VARCHAR2(30),
    Date_Of_Birth DATE,
    Age NUMBER(3),
    Gender VARCHAR2(6),
    Nationality VARCHAR2(50),
    CNIC NUMBER(13),
    Addr_Street VARCHAR2(255),
    Addr_City VARCHAR2(255),
    Addr_Country VARCHAR2(255),
    Phone_No NUMBER(12),
    Email VARCHAR2(255),
    Hire_Date DATE,
    Salary NUMBER(12,2),
    Manager_No NUMBER,
    Job_Title VARCHAR2(255),
    Employee_Status NUMBER,
    CONSTRAINT Status_Info_FK_Emp FOREIGN KEY (Employee_Status) REFERENCES Status_Info(Status_Code),
    CONSTRAINT Employees_FK FOREIGN KEY (Manager_No) REFERENCES Employees(Employee_No),
    CONSTRAINT Job_Roles_FK FOREIGN KEY (Job_Title) REFERENCES Job_Roles(Job_Title)
);
CREATE TABLE Accounts (
    Account_No NUMBER PRIMARY KEY,
    Date_Opened DATE,
    Currency_Type VARCHAR2(30),
    Balance NUMBER(12,2),
    Interest_Rate NUMBER(5,2),
    Account_Type VARCHAR2(255) CHECK (Account_Type IN ('Current','Savings')),
    Customer_No NUMBER REFERENCES Customers(Customer_No),
    Account_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Loans (
    Loan_No NUMBER PRIMARY KEY,
    Loan_Rate NUMBER(10,2),
    Date_Of_Loan DATE,
    Initial_Amount DECIMAL,
    Outstanding_Balance DECIMAL,
    Next_Payable DATE,
    Next_Payable_Amount DECIMAL,
    Account_No NUMBER REFERENCES Accounts(Account_No),
    Loan_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Emp_Login_Info (
    Employee_No NUMBER REFERENCES Employees(Employee_No)PRIMARY KEY,
    Login_Password VARCHAR2(255),
    Last_Login TIMESTAMP
);
CREATE TABLE Credit_Cards (
    Card_No NUMBER PRIMARY KEY,
    CardHolder_Name VARCHAR2(50),
    Card_Pin NUMBER(4),
    CVV_Code NUMBER(3),
    Card_Activation_Date DATE,
    Expiration_Date DATE,
    Credit_For_Spending NUMBER,
    Daily_Transaction_Limit NUMBER,
    Account_No NUMBER REFERENCES Accounts(Account_No) UNIQUE,
    Card_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Debit_Cards (
    Card_No NUMBER PRIMARY KEY,
    CardHolder_Name VARCHAR2(50),
    Card_Pin NUMBER(4),
    CVV_Code NUMBER(3),
    Card_Activation_Date DATE,
    Expiration_Date DATE,
    Daily_Transaction_Limit NUMBER,
    Account_No NUMBER REFERENCES Accounts(Account_No) UNIQUE,
    Card_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Transfers (
    Transaction_No NUMBER PRIMARY KEY,
    Send_Account_No NUMBER,
    Dest_Account_No NUMBER,
    T_Date DATE,
    T_Time TIMESTAMP,
    Amount NUMBER(12,2),
    Transaction_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Deposits (
    Transaction_No NUMBER PRIMARY KEY,
    D_Date DATE,
    D_Time TIMESTAMP,
    Amount NUMBER(12,2),
    Account_No NUMBER REFERENCES Accounts(Account_No),
    Transaction_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Withdrawals (
    Transaction_No NUMBER PRIMARY KEY,
    W_Date DATE,
    W_Time TIMESTAMP,
    Amount NUMBER(12,2),
    Account_No NUMBER REFERENCES Accounts(Account_No),
    Transaction_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Transfer_Number (
    Account_No NUMBER REFERENCES Accounts(Account_No),
    Transaction_No NUMBER REFERENCES Transfers(Transaction_No),
    PRIMARY KEY (Account_No, Transaction_No)
);

-- Create sequences and triggers

CREATE SEQUENCE Card_No_Seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE Loan_No_Seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE Account_No_Seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE Transaction_No_Seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE Customer_No_Seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE Employee_No_Seq START WITH 1 INCREMENT BY 1;

--Triggers
-- Trigger for Credit_Cards
CREATE OR REPLACE TRIGGER Credit_Card_BI_Trigger
BEFORE INSERT ON Credit_Cards
FOR EACH ROW
BEGIN
    SELECT Card_No_Seq.NEXTVAL INTO :NEW.Card_No FROM DUAL;
END;
/

-- Trigger for Debit_Cards
CREATE OR REPLACE TRIGGER Debit_Card_BI_Trigger
BEFORE INSERT ON Debit_Cards
FOR EACH ROW
BEGIN
    SELECT Card_No_Seq.NEXTVAL INTO :NEW.Card_No FROM DUAL;
END;
/

-- Trigger for Loans
CREATE OR REPLACE TRIGGER Loan_BI_Trigger
BEFORE INSERT ON Loans
FOR EACH ROW
BEGIN
    SELECT Loan_No_Seq.NEXTVAL INTO :NEW.Loan_No FROM DUAL;
    SELECT SYSDATE INTO :NEW.Date_Of_Loan FROM DUAL;
    :NEW.Next_Payable := ADD_MONTHS(SYSDATE, 1);
    :NEW.Loan_Status := 0;
END;
/


-- Trigger for Accounts
CREATE OR REPLACE TRIGGER Account_BI_Trigger
BEFORE INSERT ON Accounts
FOR EACH ROW
BEGIN
    SELECT Account_No_Seq.NEXTVAL INTO :NEW.Account_No FROM DUAL;
END;
/

-- Trigger for Transfers
CREATE OR REPLACE TRIGGER Transfer_BI_Trigger
BEFORE INSERT ON Transfers
FOR EACH ROW
BEGIN
    SELECT Transaction_No_Seq.NEXTVAL INTO :NEW.Transaction_No FROM DUAL;
    :NEW.T_Date := SYSDATE; -- Set the current date
    :NEW.T_Time := CURRENT_TIMESTAMP; -- Set the current timestamp
END;
/

-- Trigger for Deposits
CREATE OR REPLACE TRIGGER Deposit_BI_Trigger
BEFORE INSERT ON Deposits
FOR EACH ROW
BEGIN
    SELECT Transaction_No_Seq.NEXTVAL INTO :NEW.Transaction_No FROM DUAL;
END;
/

-- Trigger for Withdrawals
CREATE OR REPLACE TRIGGER Withdrawal_BI_Trigger
BEFORE INSERT ON Withdrawals
FOR EACH ROW
BEGIN
    SELECT Transaction_No_Seq.NEXTVAL INTO :NEW.Transaction_No FROM DUAL;
END;
/

-- Trigger for Customers
CREATE OR REPLACE TRIGGER Customer_BI_Trigger
BEFORE INSERT ON Customers
FOR EACH ROW
BEGIN
    SELECT Customer_No_Seq.NEXTVAL INTO :NEW.Customer_No FROM DUAL;
END;
/

-- Trigger for Employees
CREATE OR REPLACE TRIGGER Employee_BI_Trigger
BEFORE INSERT ON Employees
FOR EACH ROW
BEGIN
    :NEW.Employee_No := Employee_No_Seq.NEXTVAL;
END;
/

INSERT INTO Status_Info (Status_Code, Description) VALUES (1, 'Active');
INSERT INTO Status_Info (Status_Code, Description) VALUES (0, 'Inactive');
-- Insert into Customers
INSERT INTO Customers (
    First_Name,
    Middle_Name,
    Last_Name,
    Date_Of_Birth,
    Age,
    Gender,
    Nationality,
    CNIC,
    Addr_Street,
    Addr_City,
    Addr_Country,
    Phone_No,
    Email
) VALUES (
    'Huzaifa', 
    'Bin', 
    'Tariq', 
    TO_DATE('2001-03-25', 'YYYY-MM-DD'), 
    22, 
    'Male', 
    'Pakistani', 
    1234567890123, 
    'Gulshan', 
    'Karachi', 
    'Pakistan', 
    123456789012, 
    'h.tariq@example.com'
);
INSERT INTO Customers (
    First_Name,
    Middle_Name,
    Last_Name,
    Date_Of_Birth,
    Age,
    Gender,
    Nationality,
    CNIC,
    Addr_Street,
    Addr_City,
    Addr_Country,
    Phone_No,
    Email
) VALUES (
    'Ahmar', 
    ' ', 
    'Ayaz', 
    TO_DATE('2002-03-25', 'YYYY-MM-DD'), 
    21, 
    'Male', 
    'Pakistani', 
    1234567890123, 
    'Gulshan', 
    'Karachi', 
    'Pakistan', 
    123456789012, 
    'a.ayaz@example.com'
);
INSERT INTO Customers (
    First_Name,
    Middle_Name,
    Last_Name,
    Date_Of_Birth,
    Age,
    Gender,
    Nationality,
    CNIC,
    Addr_Street,
    Addr_City,
    Addr_Country,
    Phone_No,
    Email
) VALUES (
    'Hasan', 
    'Ali', 
    'Vejlani', 
    TO_DATE('2002-03-25', 'YYYY-MM-DD'), 
    21, 
    'Male', 
    'Pakistani', 
    1234567890123, 
    'Gulshan', 
    'Karachi', 
    'Pakistan', 
    123456789012, 
    'h.ali@example.com'
);
-- Insert into Employees and job roles
INSERT INTO Job_Roles (Job_Title, Customer_Perm, Staff_Perm, Transfer_Perm, Card_Perm, Loan_Perm)
VALUES ('Manager', 1, 0, 0, 0, 1);
INSERT INTO Job_Roles (Job_Title, Customer_Perm, Staff_Perm, Transfer_Perm, Card_Perm, Loan_Perm)
VALUES ('Supervisor', 1, 1, 1, 0, 1);

INSERT INTO Employees (
    First_Name,
    Middle_Name,
    Last_Name,
    Date_Of_Birth,
    Age,
    Gender,
    Nationality,
    CNIC,
    Addr_Street,
    Addr_City,
    Addr_Country,
    Phone_No,
    Email,
    Hire_Date,
    Salary,
    Job_Title,
    Employee_Status
) VALUES (
    'John',
    'Robert',
    'Doe',
    TO_DATE('1990-10-15', 'YYYY-MM-DD'),
    32,
    'Male',
    'American',
    1234567890123,
    '789 Pine St',
    'New York',
    'USA',
    123456789012,
    'john.doe@example.com',
    TO_DATE('2015-03-20', 'YYYY-MM-DD'),
    60000,
    'Supervisor',
    1
);

INSERT INTO Employees (
    First_Name,
    Middle_Name,
    Last_Name,
    Date_Of_Birth,
    Age,
    Gender,
    Nationality,
    CNIC,
    Addr_Street,
    Addr_City,
    Addr_Country,
    Phone_No,
    Email,
    Hire_Date,
    Salary,
    Job_Title,
    Employee_Status
) VALUES (
    'Jane',
    'Lee',
    'Wong',
    TO_DATE('1985-05-20', 'YYYY-MM-DD'),
    37,
    'Female',
    'Chinese',
    9876543210987,
    '456 Oak St',
    'San Francisco',
    'USA',
    987654321098,
    'jane.lee@example.com',
    TO_DATE('2010-08-15', 'YYYY-MM-DD'),
    75000,
    'Manager',
    1 
);

-- Insert into Accounts
INSERT INTO Accounts (
    Date_Opened,
    Currency_Type,
    Balance,
    Interest_Rate,
    Account_Type,
    Customer_No,
    Account_Status
) VALUES (
    TO_DATE('2020-01-01', 'YYYY-MM-DD'),
    'USD',
    5000.00,
    0.025,
    'Savings',
    1,
    1
);

INSERT INTO Accounts (
    Date_Opened,
    Currency_Type,
    Balance,
    Interest_Rate,
    Account_Type,
    Customer_No,
    Account_Status
) VALUES (
    TO_DATE('2021-05-10', 'YYYY-MM-DD'),
    'EUR',
    8000.00,
    0.03,
    'Savings',
    2,
    1
);
INSERT INTO Accounts (
    Date_Opened,
    Currency_Type,
    Balance,
    Interest_Rate,
    Account_Type,
    Customer_No,
    Account_Status
) VALUES (
    TO_DATE('2019-08-25', 'YYYY-MM-DD'),
    'GBP',
    10000.00,
    0.02,
    'Current',
    3,
    1
);
--Credit and debot cards
INSERT INTO Credit_Cards (
    CardHolder_Name,
    Card_Pin,
    CVV_Code,
    Card_Activation_Date,
    Expiration_Date,
    Credit_For_Spending,
    Daily_Transaction_Limit,
    Account_No,
    Card_Status
) VALUES (
    'Huzaifa',
    1234,
    789,
    TO_DATE('2022-01-01', 'YYYY-MM-DD'),
    TO_DATE('2024-01-01', 'YYYY-MM-DD'),
    5000.00,
    1000.00,
    1,
    1
);
INSERT INTO Credit_Cards (
    CardHolder_Name,
    Card_Pin,
    CVV_Code,
    Card_Activation_Date,
    Expiration_Date,
    Credit_For_Spending,
    Daily_Transaction_Limit,
    Account_No,
    Card_Status
) VALUES (
    'Hasan',
    1234,
    789,
    TO_DATE('2022-01-01', 'YYYY-MM-DD'),
    TO_DATE('2024-01-01', 'YYYY-MM-DD'),
    5000.00,
    1000.00,
    2,
    1
);
INSERT INTO Debit_Cards (
    CardHolder_Name,
    Card_Pin,
    CVV_Code,
    Card_Activation_Date,
    Expiration_Date,
    Daily_Transaction_Limit,
    Account_No,
    Card_Status
) VALUES (
    'Ahmar',
    1111,
    222,
    TO_DATE('2020-05-10', 'YYYY-MM-DD'),
    TO_DATE('2022-05-10', 'YYYY-MM-DD'),
    2000.00,
    3,
    1
);
INSERT INTO Debit_Cards (
    CardHolder_Name,
    Card_Pin,
    CVV_Code,
    Card_Activation_Date,
    Expiration_Date,
    Daily_Transaction_Limit,
    Account_No,
    Card_Status
) VALUES (
    'Huzaifa',
    1111,
    222,
    TO_DATE('2020-05-10', 'YYYY-MM-DD'),
    TO_DATE('2022-05-10', 'YYYY-MM-DD'),
    2000.00,
    1,
    1
);

--Cust login info

INSERT INTO Cust_Login_Info (
    Email,
    Login_Password,
    Mother_Name,
    Security_Question_1,
    Security_Answer_1,
    Security_Question_2,
    Security_Answer_2,
    Last_Login
) VALUES (
    'h.ali@example.com',
    'password123',
    'Mother',
    'What is your favorite color?',
    'Blue',
    'In which city were you born?',
    'New York',
    SYSTIMESTAMP
);
INSERT INTO Cust_Login_Info (
    Email,
    Login_Password,
    Mother_Name,
    Security_Question_1,
    Security_Answer_1,
    Security_Question_2,
    Security_Answer_2,
    Last_Login
) VALUES (
    'h.tariq@example.com',
    'securepassword456',
    'Ammi',
    'What is your pet name?',
    'Fluffy',
    'Your favorite book?',
    'a Mockingbird',
    SYSTIMESTAMP
);

--Emp login info

INSERT INTO Emp_Login_Info (
    Employee_No,
    Login_Password,
    Last_Login
) VALUES (
    1,
    'emp_password123',
    SYSTIMESTAMP
);

INSERT INTO Emp_Login_Info (
    Employee_No,
    Login_Password,
    Last_Login
) VALUES (
    2,
    'secure_emp_password456',
    SYSTIMESTAMP
);

--Loans
INSERT INTO Loans (
    Loan_Rate,
    Initial_Amount,
    Outstanding_Balance,
    Next_Payable_Amount,
    Account_No
) VALUES (
    0.03,
    5000.00,
    4500.00,
    1500.00,
    1
);

INSERT INTO Loans (
    Loan_Rate,
    Initial_Amount,
    Outstanding_Balance,
    Next_Payable_Amount,
    Account_No
) VALUES (
    0.025,
    8000.00,
    7000.00,
    2000.00,
    2
);

-- Inserts for Transfers table
INSERT INTO Transfers (
    Send_Account_No,
    Dest_Account_No,
    Amount,
    Transaction_Status
) VALUES (
    1,
    2,
    1000.00,
    1
);

INSERT INTO Transfers (
    Send_Account_No,
    Dest_Account_No,
    Amount,
    Transaction_Status
) VALUES (
    2,
    3,
    1500.00,
    1
);
-- Create a procedure for withdrawing money from an account
CREATE OR REPLACE PROCEDURE WithdrawMoney(
    p_CustomerNo IN NUMBER,
    p_Amount IN NUMBER
) AS
    v_AccountNo NUMBER;
    v_CurrentBalance NUMBER;
BEGIN
    -- Get the account number associated with the customer
    SELECT Account_No INTO v_AccountNo
    FROM Accounts
    WHERE Customer_No = p_CustomerNo;

    IF v_AccountNo IS NOT NULL THEN
        -- Get the current balance of the account
        SELECT Balance INTO v_CurrentBalance
        FROM Accounts
        WHERE Account_No = v_AccountNo;

        -- Check if there's enough balance to withdraw
        IF v_CurrentBalance >= p_Amount THEN
            -- Update the balance after withdrawal
            UPDATE Accounts
            SET Balance = v_CurrentBalance - p_Amount
            WHERE Account_No = v_AccountNo;

            -- Insert the withdrawal transaction
            INSERT INTO Withdrawals (
                Transaction_No,
                W_Date,
                W_Time,
                Amount,
                Account_No,
                Transaction_Status
            ) VALUES (
                Transaction_No_Seq.NEXTVAL,
                SYSDATE,
                CURRENT_TIMESTAMP,
                p_Amount,
                v_AccountNo,
                1
            );

            DBMS_OUTPUT.PUT_LINE('Withdrawal successful.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Insufficient funds for withdrawal.');
        END IF;
    ELSE
        DBMS_OUTPUT.PUT_LINE('No account found for the given customer.');
    END IF;
END;
/
CREATE OR REPLACE PROCEDURE DepositMoney(
    p_CustomerNo IN NUMBER,
    p_Amount IN NUMBER
) AS
    v_AccountNo NUMBER;
    v_CurrentBalance NUMBER;
BEGIN
    -- Get the account number associated with the customer
    SELECT Account_No INTO v_AccountNo
    FROM Accounts
    WHERE Customer_No = p_CustomerNo;

    IF v_AccountNo IS NOT NULL THEN
        -- Get the current balance of the account
        SELECT Balance INTO v_CurrentBalance
        FROM Accounts
        WHERE Account_No = v_AccountNo;

        -- Update the balance after deposit
        UPDATE Accounts
        SET Balance = v_CurrentBalance + p_Amount
        WHERE Account_No = v_AccountNo;

        -- Insert the deposit transaction
        INSERT INTO Deposits (
            Transaction_No,
            D_Date,
            D_Time,
            Amount,
            Account_No,
            Transaction_Status
        ) VALUES (
            Transaction_No_Seq.NEXTVAL,
            SYSDATE,
            CURRENT_TIMESTAMP,
            p_Amount,
            v_AccountNo,
            1
        );

        DBMS_OUTPUT.PUT_LINE('Deposit successful.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('No account found for the given customer.');
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE TransferMoney(
    p_SenderAccountNo IN NUMBER,
    p_DestAccountNo IN NUMBER,
    p_Amount IN NUMBER
) AS
    p_SenderBalance NUMBER;
BEGIN
    IF p_SenderAccountNo IS NOT NULL AND p_DestAccountNo IS NOT NULL THEN
        -- Get the current balance of the sender's account
        SELECT Balance INTO p_SenderBalance
        FROM Accounts
        WHERE Account_No = p_SenderAccountNo;

        -- Check if there's enough balance to transfer
        IF p_SenderBalance >= p_Amount THEN
            -- Update the balance of the sender's account after transfer
            UPDATE Accounts
            SET Balance = p_SenderBalance - p_Amount
            WHERE Account_No = p_SenderAccountNo;

            -- Update the balance of the destination account after transfer
            UPDATE Accounts
            SET Balance = Balance + p_Amount
            WHERE Account_No = p_DestAccountNo;

            -- Insert the transfer transaction
            INSERT INTO Transfers (
                Send_Account_No,
                Dest_Account_No,
                T_Date,
                T_Time,
                Amount,
                Transaction_Status
            ) VALUES (
                p_SenderAccountNo,
                p_DestAccountNo,
                SYSDATE,
                CURRENT_TIMESTAMP,
                p_Amount,
                1
            );
            DBMS_OUTPUT.PUT_LINE('Transfer successful.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Insufficient funds for transfer.');
        END IF;
    ELSE
        DBMS_OUTPUT.PUT_LINE('Invalid customer or account information.');
    END IF;
END;
/
CREATE OR REPLACE PROCEDURE RequestLoan(
    p_CustomerNo IN NUMBER,
    p_LoanAmount IN NUMBER
) AS
    v_AccountNo NUMBER;
    v_InterestRate NUMBER;
    v_OutstandingBalance NUMBER;
BEGIN
    -- Get the account number associated with the customer
    SELECT Account_No INTO v_AccountNo
    FROM Accounts
    WHERE Customer_No = p_CustomerNo;

    IF v_AccountNo IS NOT NULL THEN
        -- Get the interest rate from the associated account
        SELECT Interest_Rate INTO v_InterestRate
        FROM Accounts
        WHERE Account_No = v_AccountNo;
            -- Insert a new loan request
            INSERT INTO Loans (
                Loan_Rate,
                Date_Of_Loan,
                Initial_Amount,
                Outstanding_Balance,
                Next_Payable,
                Next_Payable_Amount,
                Account_No
            ) VALUES (
                v_InterestRate,
                SYSDATE,
                p_LoanAmount,
                p_LoanAmount, -- Initial Outstanding Balance is the same as the loan amount
                ADD_MONTHS(SYSDATE, 1),
                (p_LoanAmount * (1 + v_InterestRate))- p_LoanAmount,
                v_AccountNo
            );
    ELSE
        DBMS_OUTPUT.PUT_LINE('No account found for the given customer.');
    END IF;
END;
/
-- Create a procedure for approving a loan
CREATE OR REPLACE PROCEDURE ApproveLoan(
    p_LoanNo IN NUMBER
) AS
    v_AccountNo NUMBER;
    v_LoanAmount NUMBER;
BEGIN
    -- Get the account number associated with the loan
    SELECT Account_No, Initial_Amount INTO v_AccountNo, v_LoanAmount
    FROM Loans
    WHERE Loan_No = p_LoanNo;

    IF v_AccountNo IS NOT NULL THEN
        -- Update the loan status to approved (1) and add the loan amount to the account balance
        UPDATE Loans
        SET Loan_Status = 1
        WHERE Loan_No = p_LoanNo;

        UPDATE Accounts
        SET Balance = Balance + v_LoanAmount
        WHERE Account_No = v_AccountNo;

        DBMS_OUTPUT.PUT_LINE('Loan approved and amount added to the account.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Invalid loan number.');
    END IF;
END;
/
BEGIN
    RequestLoan(2,5000);
END;
/
BEGIN
    WithdrawMoney(1, 1000);
END;
/
BEGIN
    DepositMoney(1, 20000);
END;
/
BEGIN
    TransferMoney(2, 3, 10000);
END;
/
BEGIN
    ApproveLoan(4);
END;
/
-- Create a procedure for deleting a credit card
CREATE OR REPLACE PROCEDURE DeleteCreditCard(
    p_CardNo IN NUMBER
) AS
BEGIN
    -- Delete the credit card based on Card_No
    DELETE FROM Credit_Cards
    WHERE Card_No = p_CardNo;

    DBMS_OUTPUT.PUT_LINE('Credit card deleted successfully.');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Credit card not found for the given Card_No.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('An error occurred: ' || SQLCODE || ' - ' || SQLERRM);
END;
/
-- Create a procedure for deleting a debit card
CREATE OR REPLACE PROCEDURE DeleteDebitCard(
    p_CardNo IN NUMBER
) AS
BEGIN
    -- Delete the debit card based on Card_No
    DELETE FROM Debit_Cards
    WHERE Card_No = p_CardNo;

    DBMS_OUTPUT.PUT_LINE('Debit card deleted successfully.');
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Debit card not found for the given Card_No.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('An error occurred: ' || SQLCODE || ' - ' || SQLERRM);
END;
/
BEGIN
    DeleteCreditCard(2);
END;
/
BEGIN
    DeleteDebitCard(3);
END;
/
select * from transfers;
select * from accounts;
select * from loans;
select * from Credit_Cards;
select * from Debit_Cards;