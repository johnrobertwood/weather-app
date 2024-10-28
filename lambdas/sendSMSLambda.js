const axios = require("axios");
const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

exports.handler = (event) => {
  const lat = "35.98185553789852";
  const lon = "-86.79039428600794";
  const phoneNumber = event.queryStringParameters?.phoneNumber;

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
        ? Math.floor(main.temp - 273.15)
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
};
