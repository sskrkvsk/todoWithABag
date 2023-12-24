import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;
let settings = false;
let message = "";
let bagMessage = "";

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

    const bool = await db.query("SELECT * FROM user_settings");
    settings = bool.rows[0].state;

    res.render("index.ejs", {
      settingsState :settings,
      listItems: items,
      bagItems: items2, 
      alert: message,
      bagAlert: bagMessage
    });
    message = "";
    bagMessage = "";
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
    if (item) {message = "added";};
    if (item2) {bagMessage ="added";};
    
     
    res.redirect("/");
  } catch (error) {
    console.error("Error adding item to the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Collapsing status
app.post("/userSettings", async (req, res) => {
  try {
    const bool = await db.query("SELECT * FROM user_settings");

    if (bool.rows.length > 0) {
      const currentState = bool.rows[0].state;
      const updatedState = !currentState;

     const result = await db.query("UPDATE user_settings SET state = $1 RETURNING *", [updatedState]);
} else {
  const set = Boolean(req.body.settings);
  await db.query("INSERT INTO user_settings (state) VALUES ($1) RETURNING *", [set]);
}
    res.redirect("/");
  } catch (error) {
    console.error("Error toggling section state:", error);
    res.status(500).send("Internal Server Error");
  }
});

//EDIT
app.post("/edit", async (req, res) => {
  try {
    const itemId = req.body.updatedItemId;
    const newValue = req.body.updatedItemTitle;

    const bagItemId = req.body.updatedBagItemId;
    const bagNewValue = req.body.updatedBagItemTitle;

    // console.log("itemId: " + bagItemId + "newValue: " + bagNewValue);

  
    const result = await db.query("UPDATE donow SET title = $1 WHERE id = $2 RETURNING *", [newValue, itemId]);
    const bagResult = await db.query("UPDATE bag SET title = $1 WHERE id = $2 RETURNING *", [bagNewValue, bagItemId]);

    if (newValue) {message = "edited";}
    if (bagNewValue) {bagMessage ="edited";}
    res.redirect("/");
  } catch (error) {
    console.error("Error updating item in the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

//DELETE
app.post("/delete", async (req, res) => {

  try {
    const deleteId = req.body.deleteItemId;
    const deleteBagId = req.body.deleteBagItemId;

    const result = await db.query("DELETE FROM donow WHERE id = $1 RETURNING *", [deleteId]);

    const bagResult = await db.query("DELETE FROM bag WHERE id = $1 RETURNING *", [deleteBagId]);

    if (deleteId) {message = "done";}
    if (deleteBagId) {bagMessage ="done";}
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting item from the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

//MOVE
app.post("/move", async (req, res) => {

  try {
    const deleteBagId = req.body.deleteBagItemId;

    const result = await db.query("INSERT INTO donow (title) SELECT title FROM bag WHERE id = $1", [deleteBagId]);

    const bagResult = await db.query("DELETE FROM bag WHERE id = $1 RETURNING *", [deleteBagId]);

    if (deleteBagId) {bagMessage ="moved";}
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting item from the database:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
