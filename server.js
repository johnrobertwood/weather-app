const express = require("express");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/test.html"));
});

app.get("/weather", (req, res) => {
  axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=35.98185553789852&lon=-86.79039428600794&appid=${weatherApiKey}`
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((err) => res.send(err));
});

app.get("/getWeather", (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
    )
    .then((response) => {
      res.json(response.data);
    })
    .catch((err) => res.send(err));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
