// imports here for express and pg
const express = require("express"); // Import Express.js framework
const app = express(); // Create an Express application instance
const path = require("path"); // Import path module for working with file and directory paths
const pg = require("pg"); // Import pg module for PostgreSQL database interaction

// Set up PostgreSQL client with connection string
const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://localhost/acme_notes_db"
);

// static routes here (you only need these for deployment)
// Serve index.html file for root route
app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// app routes here
// Define API endpoint to retrieve notes from the database
app.get("/api/notes", async (req, res, next) => {
    try {
        const SQL = `
        SELECT * from notes;
      `;
        const response = await client.query(SQL); // Execute SQL query to fetch notes
        res.send(response.rows); // Send fetched notes as response
    } catch (ex) {
        next(ex); // Pass any errors to the Express error handler middleware
    }
});

// create your init function
// Initialize the Express application and database
const init = async () => {
    await client.connect(); // Connect to the PostgreSQL database

    // SQL script to create notes table and seed initial data
    const SQL = `
      DROP TABLE IF EXISTS notes;
      CREATE TABLE notes(
        id SERIAL PRIMARY KEY,
        txt VARCHAR(255),
        starred BOOLEAN DEFAULT FALSE
      );
      INSERT INTO notes(txt, starred) VALUES('learn express', false);
      INSERT INTO notes(txt, starred) VALUES('write SQL queries', true);
      INSERT INTO notes(txt) VALUES('create routes');
    `;
    await client.query(SQL); // Execute SQL script to create table and insert data

    console.log("data seeded");

    const port = process.env.PORT || 3000; // Set the port for Express server
    app.listen(port, () => console.log(`listening on port ${port}`)); // Start Express server
};

// init function invocation
init(); // Call the init function to initialize the application
