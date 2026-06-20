const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("Database Connection Failed");
    return;
  }

  console.log("MySQL Connected");
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const sql =
    "INSERT INTO contacts (name,email,message) VALUES (?,?,?)";

  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false
      });
    }

    res.json({
      success: true,
      message: "Message saved successfully"
    });
  });
});
app.get("/", (req, res) => {
  console.log("GET / called");
  res.status(200).send("Backend Working Successfully!");
});
app.get("/contacts", (req, res) => {
  db.query("SELECT * FROM contacts ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.send("Database Error");
    }

    let html = `
    <html>
    <head>
      <title>Contact Messages</title>
      <style>
        body{
          font-family: Arial, sans-serif;
          padding:20px;
          background:#f4f4f4;
        }

        table{
          width:100%;
          border-collapse:collapse;
          background:white;
        }

        th,td{
          border:1px solid #ddd;
          padding:12px;
          text-align:left;
        }

        th{
          background:#4f8ef7;
          color:white;
        }

        tr:nth-child(even){
          background:#f9f9f9;
        }

        h1{
          margin-bottom:20px;
        }
      </style>
    </head>
    <body>

    <h1>Contact Messages</h1>

    <table>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Message</th>
        <th>Date</th>
      </tr>
    `;

    results.forEach(row => {
      html += `
      <tr>
        <td>${row.id}</td>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.message}</td>
        <td>${row.created_at}</td>
      </tr>
      `;
    });

    html += `
      </table>
    </body>
    </html>
    `;

    res.send(html);
  });
});
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});