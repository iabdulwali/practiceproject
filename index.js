const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const secretKey = "1abba";

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the request contains the 'Authorization' header
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    // If there's no 'Authorization' header, return unauthorized status
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the token from the 'Authorization' header
  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, secretKey , (err, user) => {
    if (err) {
      // If the token is invalid, return unauthorized status
      return res.status(401).json({ error: 'Invalid token!' });
    }

    // If the token is valid, attach the user object to the request for further use
    req.user = user;
    console.log(req.user);

    // Call next to proceed to the authenticated routes
    next();
  });
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
