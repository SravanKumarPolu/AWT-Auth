require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

// Middleware to parse JSON request bodies
app.use(express.json());

let refreshTokens = []; // Renamed to refreshTokens to avoid conflict

app.post("/token", (req, res) => {
  const token = req.body.token; // Renamed to token for clarity
  if (token == null) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken); // Store the token in the array
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "150s" });
}

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
