import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// DB Connection
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

try {
  db.connect();
  console.log("Connected to the database");
} catch (error) {
  console.error("Error connecting to the database:", error);
}

let items = [
  { id: 1, title: "Test title"},
  { id: 2, title: "Test title 2"},
  { id: 3, title: "Test title 3"}
];

let items2 = [
  { id: 1, title: "Test title"},
  { id: 2, title: "Test title 2"},
  { id: 3, title: "Test title 3"}
];

// GET
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM donow ORDER BY id");
    // let items = result.rows;
    console.log(result.rows);

    res.render("index.ejs", {
      listItems: items,
      bagItems: items2
    });
  } catch (error) {
    console.error("Error retrieving items from the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ADD
app.post("/add", async (req, res) => {
//   try {
//     const item = req.body.newItem;
//     const result = await db.query("INSERT INTO items (title) VALUES ($1) RETURNING *", [item]);
//     // console.log(result.rows);

//     res.redirect("/");
//   } catch (error) {
//     console.error("Error adding item to the database:", error);
//     res.status(500).send("Internal Server Error");
//   }
});

//EDIT
app.post("/edit", async (req, res) => {
//   try {
//     const itemId = req.body.updatedItemId;
//     const newValue = req.body.updatedItemTitle;

//     const result = await db.query("UPDATE items SET title = $1 WHERE id = $2 RETURNING *", [newValue, itemId]);
//     // console.log(result.rows);
//     res.redirect("/");
//   } catch (error) {
//     console.error("Error updating item in the database:", error);
//     res.status(500).send("Internal Server Error");
//   }
});

//DELETE
app.post("/delete", async (req, res) => {
//   try {
//     const deleteId = req.body.deleteItemId;

//     const result = await db.query("DELETE FROM items WHERE id = $1 RETURNING *", [deleteId]);
//     // console.log(result.rows);
//     res.redirect("/");
//   } catch (error) {
//     console.error("Error deleting item from the database:", error);
//     res.status(500).send("Internal Server Error");
//   }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
