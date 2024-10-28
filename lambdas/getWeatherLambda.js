const https = require("https");

exports.handler = async (event) => {
  // Default coordinates of Brentwood, TN
  let lat = "35.98185553789852";
  let lon = "-86.79039428600794";
  if (event.queryStringParameters) {
    ({ lat, lon } = event.queryStringParameters);
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
};
