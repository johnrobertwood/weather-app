const express = require("express");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;

app.use(express.static(path.join(__dirname, "/")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/getWeather", (req, res) => {
  // Default coordinates of Brentwood, TN
  let lat = "35.98185553789852";
  let lon = "-86.79039428600794";
  if (req.queryStringParameters) {
    ({ lat, lon } = req.queryStringParameters);
  }
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;

  return new Promise((resolve, reject) => {
    https
      .get(apiUrl, (response) => {
        let data = "";

        // Collect response data chunks
        response.on("data", (chunk) => {
          data += chunk;
        });

        // On end of response, return the data
        response.on("end", () => {
          resolve({
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: data,
          });
        });
      })
      .on("error", (error) => {
        // Handle errors
        reject({
          statusCode: 500,
          body: JSON.stringify({
            error: "Failed to fetch data from API",
            details: error.message,
          }),
        });
      });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
