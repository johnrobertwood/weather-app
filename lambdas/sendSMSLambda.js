const axios = require("axios");
const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

exports.handler = async (event) => {
  const lat = "35.98185553789852";
  const lon = "-86.79039428600794";
  const phoneNumber = event.queryStringParameters?.phoneNumber;

  if (!phoneNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Phone number is required" }),
    };
  }

  try {
    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    );

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
    const message = await client.messages.create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, messageSid: message.sid }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send SMS",
        details: error.message,
      }),
    };
  }
};
