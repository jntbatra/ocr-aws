import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import config from "../config.js";

const client = jwksClient({
  jwksUri: `https://cognito-idp.${config.region}.amazonaws.com/${config.cognitoUserPoolId}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(
    "Auth middleware - checking authorization header:",
    authHeader ? "Present" : "Missing"
  );

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Auth middleware - no token found in Authorization header");
    return res.status(401).json({ error: "Access token required" });
  }

  console.log("Auth middleware - token found, verifying...");
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      console.error(
        "Auth middleware - token verification failed:",
        err.message
      );
      return res
        .status(403)
        .json({ error: "Invalid token", details: err.message });
    }

    console.log("Auth middleware - token verified for user:", decoded.sub);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded["cognito:username"],
    };
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        username: decoded["cognito:username"],
      };
    }
    next();
  });
};
