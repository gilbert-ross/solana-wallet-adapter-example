require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello World!"));

// Our Goodreads relay route!
app.get("/api/auth", async (req, res) => {
    try {
        // This uses string interpolation to make our search query string
        // it pulls the posted query param and reformats it for goodreads
        const searchString = `q=${req.query.q}`;
        process.env.SECRET_KEY
        return res.json({
            success: true,
            results
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
})

// This spins up our sever and generates logs for us to use.
// Any console.log statements you use in node for debugging will show up in your
// terminal, not in the browser console!
app.listen(port, () => console.log(`Example app listening on port ${port}!`));