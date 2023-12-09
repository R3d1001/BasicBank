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
    Account_Type VARCHAR2(255),
    Customer_No NUMBER REFERENCES Customers(Customer_No),
    Account_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Loans (
    Loan_No NUMBER PRIMARY KEY,
    Loan_Rate DECIMAL(5),
    Date_Of_Loan DATE,
    Initial_Amount DECIMAL,
    Outstanding_Balance DECIMAL,
    Next_Payable DATE,
    Next_Payable_Amount DECIMAL,
    Account_No NUMBER REFERENCES Accounts(Account_No) unique,
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
    Account_No NUMBER REFERENCES Accounts(Account_No) UNIQUE,
    Transaction_Status NUMBER REFERENCES Status_Info(Status_Code)
);
CREATE TABLE Withdrawals (
    Transaction_No NUMBER PRIMARY KEY,
    W_Date DATE,
    W_Time TIMESTAMP,
    Amount NUMBER(12,2),
    Account_No NUMBER REFERENCES Accounts(Account_No) UNIQUE ,
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
    'Checking',
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
    Date_Of_Loan,
    Initial_Amount,
    Outstanding_Balance,
    Next_Payable,
    Next_Payable_Amount,
    Account_No,
    Loan_Status
) VALUES (
    0.03,
    TO_DATE('2022-03-01', 'YYYY-MM-DD'),
    5000.00,
    4500.00,
    TO_DATE('2022-04-01', 'YYYY-MM-DD'),
    1500.00,
    1,
    1
);

INSERT INTO Loans (
    Loan_Rate,
    Date_Of_Loan,
    Initial_Amount,
    Outstanding_Balance,
    Next_Payable,
    Next_Payable_Amount,
    Account_No,
    Loan_Status
) VALUES (
    0.025,
    TO_DATE('2021-10-15', 'YYYY-MM-DD'),
    8000.00,
    7000.00,
    TO_DATE('2021-11-15', 'YYYY-MM-DD'),
    2000.00,
    2,
    1
);

-- Inserts for Transfers table
INSERT INTO Transfers (
    Send_Account_No,
    Dest_Account_No,
    T_Date,
    T_Time,
    Amount,
    Transaction_Status
) VALUES (
    1,
    2,
    TO_DATE('2022-05-10', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-05-10 08:30:00', 'YYYY-MM-DD HH24:MI:SS'),
    1000.00,
    1
);

INSERT INTO Transfers (
    Transaction_No,
    Send_Account_No,
    Dest_Account_No,
    T_Date,
    T_Time,
    Amount,
    Transaction_Status
) VALUES (
    2002,
    2,
    3,
    TO_DATE('2022-06-20', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-06-20 14:45:00', 'YYYY-MM-DD HH24:MI:SS'),
    1500.00,
    1
);


-- Inserts for Deposits table
INSERT INTO Deposits (
    D_Date,
    D_Time,
    Amount,
    Account_No,
    Transaction_Status
) VALUES (
    TO_DATE('2022-03-01', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-03-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    500.00,
    1,
    1
);

INSERT INTO Deposits (
    D_Date,
    D_Time,
    Amount,
    Account_No,
    Transaction_Status
) VALUES (
    TO_DATE('2022-04-15', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-04-15 13:30:00', 'YYYY-MM-DD HH24:MI:SS'),
    800.00,
    2,
    1
);


-- Inserts for Withdrawals table
INSERT INTO Withdrawals (
    W_Date,
    W_Time,
    Amount,
    Account_No,
    Transaction_Status
) VALUES (
    TO_DATE('2022-02-10', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-02-10 11:45:00', 'YYYY-MM-DD HH24:MI:SS'),
    30.00,
    1,
    1
);

INSERT INTO Withdrawals (
    W_Date,
    W_Time,
    Amount,
    Account_No,
    Transaction_Status
) VALUES (
    TO_DATE('2022-07-05', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-07-05 16:15:00', 'YYYY-MM-DD HH24:MI:SS'),
    1200.00,
    3,
    1
);

INSERT INTO Transfer_Number (
    Account_No,
    Transaction_No
) VALUES (
    1,
    1
);
INSERT INTO Transfer_Number (
    Account_No,
    Transaction_No
) VALUES (
    2,
    2
);
commit;
set serveroutput on;
set autocommit on;
select * from cust_login_info;
select * from accounts;
select * from customers;    
select * from loans;
select * from transfers;
select * from credit_cards;
select * from debit_cards;
SELECT * FROM transfers WHERE send_account_no = 1 OR dest_account_no = 1;

INSERT INTO Transfers (
    Transaction_No,
    Send_Account_No,
    Dest_Account_No,
    T_Date,
    T_Time,
    Amount,
    Transaction_Status
) VALUES (
    20319,
    1,
    3,
    TO_DATE('2022-06-20', 'YYYY-MM-DD'),
    TO_TIMESTAMP('2022-06-20 14:45:00', 'YYYY-MM-DD HH24:MI:SS'),
    1500.00,
    1
);

INSERT INTO Loans (
    Loan_Rate,
    Date_Of_Loan,
    Initial_Amount,
    Outstanding_Balance,
    Next_Payable,
    Next_Payable_Amount,
    Account_No,
    Loan_Status
) VALUES (
    0.2,
    TO_DATE('2022-03-01', 'YYYY-MM-DD'),
    5000.00,
    4500.00,
    TO_DATE('2022-04-01', 'YYYY-MM-DD'),
    1500.00,
    1,
    1
);

SELECT CONSTRAINT_NAME
FROM USER_CONS_COLUMNS
WHERE TABLE_NAME = 'LOANS' AND COLUMN_NAME = 'ACCOUNT_NO';

ALTER TABLE Loans
DROP CONSTRAINT SYS_C008451;
ALTER TABLE Loans
DROP CONSTRAINT SYS_C008452;
ALTER TABLE Loans
ADD CONSTRAINT SYS_C008452 FOREIGN KEY (Account_No) REFERENCES Accounts(Account_No);

commit;