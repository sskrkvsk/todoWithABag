import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;
let isSectionCollapsed = true;

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

// GET
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM donow ORDER BY id");
    let items = result.rows;

    const bagResult = await db.query("SELECT * FROM bag ORDER BY id");
    let items2 = bagResult.rows;

    res.render("index.ejs", {
      listItems: items,
      bagItems: items2,
      isSectionCollapsed 
    });
  } catch (error) {
    console.error("Error retrieving items from the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ADD
app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    const item2 = req.body.newBagItem;

    if (item) {
      const result = await db.query("INSERT INTO donow (title) VALUES ($1) RETURNING *", [item]);
    } else {
      if (item2) {
        const bagResult = await db.query("INSERT INTO bag (title) VALUES ($1) RETURNING *", [item2]);
      }
    }
    
    res.redirect("/");
  } catch (error) {
    console.error("Error adding item to the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/toggleState", (req, res) => {
  try {
    isSectionCollapsed = !isSectionCollapsed;
    res.status(200).end();
  } catch (error) {
    console.error("Error toggling section state:", error);
    res.status(500).send("Internal Server Error");
  }
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
