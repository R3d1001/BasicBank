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
    Account_No NUMBER REFERENCES Accounts(Account_No) UNIQUE,
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
-- Insert into Employees
INSERT INTO Job_Roles (Job_Title, Customer_Perm, Staff_Perm, Transfer_Perm, Card_Perm, Loan_Perm)
VALUES ('Manager', 1, 0, 0, 0, 1);
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

insert into Cust_Login_Info (
    Email,
    Login_Password
) values (
'h.tariq@example.com',
'user'
);
commit;