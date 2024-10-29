"use strict";

// Moving JS to seperate file
class Test {
  constructor() {
    // Changing to return the element instead of HTML collection
    this.testResults = document.getElementsByClassName("test-results")[0];
  }

  /**
   * A function that gets the user's location and fetches weather data.
   */
  async getUserLocation() {
    console.log(
      new Date().toISOString(),
      "Running user location weather data fetch"
    );
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            this.setLoading();
            // Fetch weather data with user's location as query params
            const response = await axios.get(
              `https://40df8yfdul.execute-api.us-east-1.amazonaws.com/prod/getWeather?lat=${latitude}&lon=${longitude}`
            );
            this.setResults(response.data);
          } catch (error) {
            this.setError(error.message);
          }
        },
        (error) => {
          // User denied geolocation permission
          this.setError(error.message);
        }
      );
    } else {
      this.setError("Geolocation is not available in your browser");
    }
  }

  async getBrentwoodWeather() {
    console.log(
      new Date().toISOString(),
      "Running Brentwood weather data fetch"
    );

    try {
      this.setLoading();
      // Moving api call to server to avoid exposing api key
      const response = await axios.get(
        "https://40df8yfdul.execute-api.us-east-1.amazonaws.com/prod/getWeather"
      );
      this.setResults(response.data);
    } catch (error) {
      this.setError(error.message);
    }
  }

  setError(message) {
    // Changing to return a HTML string with error message
    this.testResults.innerHTML = `<p class="error">Error fetching data: ${message}</p>`;
  }

  setLoading() {
    // Return a HTML string with loading message
    this.testResults.innerHTML = "<h2>Loading...</h2>";
  }

  setResults(results) {
    // Parse and display the results
    const name = results.name || "Unknown location";
    const temperature = results.main
      ? Math.floor((results.main.temp - 273.15) * 1.8 + 32)
      : "Unknown temperature"; // Convert Kelvin to Fahrenheit
    const description =
      results.weather[0]?.description ?? "No description available";
    const humidity = results.main?.humidity || "Unknown humidity";
    const wind = Math.floor(results.wind.speed * 2.23) ?? "Unknown wind speed"; // Convert m/s to mph
    const icon = results.weather[0]?.icon || "01d";

    const HTMLString = `
    <div>
        <h2>Current Weather in ${name}</h2>
        <p><strong>Temperature:</strong> ${temperature} °F</p>
        <p><strong>Conditions:</strong> ${description}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind} mph</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
    </div>
      `;
    // Setting results to HTML string instead of data HTTP call, don't need to convert to string
    this.testResults.innerHTML = HTMLString || "";
  }
}

/**
 * Creates a button for kicking off the test and adds it to the DOM.
 *
 * @param {HTMLElement} context  the parent element to add the button to
 * @param {Test}        test     the test to be executed
 * @returns {HTMLElement} the button added to the test
 */
function addButtonForTest(context, test) {
  // Changed let to const
  const testButton = document.createElement("button");

  testButton.type = "button";
  // Changing text to say Brentwood instead of Nashville
  testButton.innerText = "Brentwood Weather";
  testButton.onclick = () => test.getBrentwoodWeather();

  context.appendChild(testButton);

  // Removed unnessesary return statement since we are just setting things
}

/**
 * Creates a button for finding user location and adds it to the DOM.
 *
 * @param {HTMLElement} context  the parent element to add the button to
 * @param {Test}        test     the test to be executed
 * @returns {HTMLElement} the button added to the test
 */
function addButtonForGeoLocation(context, test) {
  const locationButton = document.createElement("button");

  locationButton.type = "button";
  locationButton.className = "location-button";
  locationButton.innerText = "\u2316";
  locationButton.onclick = () => test.getUserLocation();

  context.appendChild(locationButton);
}

// Create the Test and add buttons to the UI Brentwood and user location
const test = new Test();
const buttonContainer = document.getElementsByClassName("button-container")[0];
addButtonForTest(buttonContainer, test);
addButtonForGeoLocation(buttonContainer, test);
