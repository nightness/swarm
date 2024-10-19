import sqlite3 from "sqlite3";

let conn: sqlite3.Database | null = null;

function getConnection(): sqlite3.Database {
  if (!conn) {
    conn = new sqlite3.Database("application.db", (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Connected to the database.");
      }
    });
  }
  return conn;
}

function createDatabase() {
  const conn = getConnection();

  conn.serialize(() => {
    // Create Users table
    conn.run(
      `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT
      )`
    );

    // Create PurchaseHistory table
    conn.run(
      `CREATE TABLE IF NOT EXISTS PurchaseHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date_of_purchase TEXT,
        item_id INTEGER,
        amount REAL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )`
    );

    // Create Products table
    conn.run(
      `CREATE TABLE IF NOT EXISTS Products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        price REAL NOT NULL
      )`
    );
  });
}

function initializeDatabase() {
  const conn = getConnection();

  // Check if the Users table exists
  conn.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='Users';",
    (err, row) => {
      if (err) {
        console.error("Error checking database existence:", err);
        return;
      }

      // If Users table exists, we assume the database has already been initialized
      if (row) {
        console.log("Database already initialized, skipping reinitialization.");
      } else {
        console.log("Initializing database...");
        createDatabase(); // Create the tables

        // Add initial users, purchases, and products
        const initialUsers = [
          [1, "Alice", "Smith", "alice@test.com", "123-456-7890"],
          [2, "Bob", "Johnson", "bob@test.com", "234-567-8901"],
          [3, "Sarah", "Brown", "sarah@test.com", "555-567-8901"],
        ];

        const initialPurchases = [
          [1, "2024-01-01", 101, 99.99], // Ensure 'date_of_purchase' is string
          [2, "2023-12-25", 100, 39.99],
          [3, "2023-11-14", 307, 49.99],
        ];

        const initialProducts = [
          [7, "Hat", 19.99],
          [8, "Wool socks", 29.99],
          [9, "Shoes", 39.99],
        ];

        // Pass the correct types for addUser
        initialUsers.forEach((user) => {
          addUser(
            user[0] as number,
            user[1] as string,
            user[2] as string,
            user[3] as string,
            user[4] as string
          );
        });

        // Pass the correct types for addPurchase
        initialPurchases.forEach((purchase) => {
          addPurchase(
            purchase[0] as number,
            purchase[1] as string,
            purchase[2] as number,
            purchase[3] as number
          );
        });

        // Pass the correct types for addProduct
        initialProducts.forEach((product) => {
          addProduct(
            product[0] as number,
            product[1] as string,
            product[2] as number
          );
        });
      }
    }
  );
}

function addUser(
  user_id: number,
  first_name: string,
  last_name: string,
  email: string,
  phone: string
) {
  const conn = getConnection();

  // Check if the user already exists based on the email
  conn.get("SELECT * FROM Users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Error querying database:", err);
      return;
    }

    if (row) {
      console.log(
        `User with email ${email} already exists, skipping insertion.`
      );
      return; // Exit if the user already exists
    }

    // Insert the user if not found
    conn.run(
      `INSERT INTO Users (user_id, first_name, last_name, email, phone)
         VALUES (?, ?, ?, ?, ?)`,
      [user_id, first_name, last_name, email, phone],
      (err) => {
        if (err) {
          console.error("Error inserting into database:", err);
          return;
        }
        console.log(`User with email ${email} added successfully.`);
      }
    );
  });
}

function addPurchase(
  user_id: number,
  date_of_purchase: string,
  item_id: number,
  amount: number
) {
  const conn = getConnection();
  conn.run(
    `INSERT INTO PurchaseHistory (user_id, date_of_purchase, item_id, amount)
     VALUES (?, ?, ?, ?)`,
    [user_id, date_of_purchase, item_id, amount]
  );
}

function addProduct(product_id: number, product_name: string, price: number) {
  const conn = getConnection();

  // Check if the product already exists based on the product_id
  conn.get(
    "SELECT * FROM Products WHERE product_id = ?",
    [product_id],
    (err, row) => {
      if (err) {
        console.error("Error querying database:", err);
        return;
      }

      if (row) {
        console.log(
          `Product with product_id ${product_id} already exists, skipping insertion.`
        );
        return; // Exit if the product already exists
      }

      // Insert the product if not found
      conn.run(
        `INSERT INTO Products (product_id, product_name, price)
         VALUES (?, ?, ?)`,
        [product_id, product_name, price],
        (err) => {
          if (err) {
            console.error("Error inserting product into database:", err);
            return;
          }
          console.log(`Product ${product_name} added successfully.`);
        }
      );
    }
  );
}

function previewTable(table_name: string) {
  const conn = getConnection();
  conn.all(`SELECT * FROM ${table_name} LIMIT 5`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    console.log(`Preview of ${table_name}:`);
    rows.forEach((row) => {
      console.log(row);
    });
  });
}

export {
  initializeDatabase,
  addUser,
  addPurchase,
  addProduct,
  previewTable,
  getConnection,
};
