const express = require("express");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config();
const twilio = require("twilio");
const app = express();
const port = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

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

app.get("/weatherSMS", (req, res) => {
  const lat = "35.98185553789852";
  const lon = "-86.79039428600794";
  const phoneNumber = req.queryStringParameters?.phoneNumber;

  if (!phoneNumber) {
    return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ error: "Phone number is required" }),
    });
  }

  // Fetch weather data
  return axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    )
    .then((weatherResponse) => {
      const { main, weather, name } = weatherResponse.data;
      const temperature = main.temp
        ? Math.floor((results.main.temp - 273.15) * 1.8 + 32)
        : "Unknown temperature";
      const description = weather[0]?.description ?? "No description available";
      const location = name ?? "Unknown location";

      const messageBody = `From John Wood LLC Weather update for ${location}: ${temperature}°C with ${description}. Text STOP to end.`;

      // Initialize Twilio client
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      // Send SMS
      return client.messages.create({
        body: messageBody,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    })
    .then((message) => {
      // Return success response
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ success: true, messageSid: message.sid }),
      };
    })
    .catch((error) => {
      // Handle errors and return a failure response
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to send SMS",
          details: error.message,
        }),
      };
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
