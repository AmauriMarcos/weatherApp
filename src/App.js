import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles/app.module.css";
import Geocode from "react-geocode";

function App() {
  const [currentWeather, setCurrentWeather] = useState("");
  const [daily, setDaily] = useState([]);
  const [latitude, setLatitude] = useState(43.320904);
  const [longitude, setLongitude] = useState(21.89576);
  const [mySearch, setMySearch] = useState("Niš");
  const [cityName, setCityName] = useState("");
  const [temperature, setTemperature] = useState("");
  const [calendarDay, setCalendarDay] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [currentTime, setCurrentTime] = useState([]);
  

  var weekday = new Array(7);
  weekday[0] = "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat";

  useEffect(() => {
    fetchData();
  }, [latitude, longitude, cityName]);

  const handleSearch = (e) => {
    setMySearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    Geocode.setApiKey(`${process.env.REACT_APP_KEY}`);
    Geocode.setLanguage("en");

    Geocode.setLocationType("ROOFTOP");

    // Enable or disable logs. Its optional.
    Geocode.enableDebug();

    Geocode.fromAddress(`${mySearch}`).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        setLatitude(lat);
        setLongitude(lng);

        let countryName;

        if (response.results[0].address_components.length === 4) {
          countryName = response.results[0].address_components[3].long_name;
        } else if (response.results[0].address_components.length === 5) {
          countryName = response.results[0].address_components[4].long_name;
        } else if (response.results[0].address_components.length === 2) {
          countryName = response.results[0].address_components[1].long_name;
        } else {
          countryName = response.results[0].address_components[2].long_name;
        }

        const nameOfTheCity =
          response.results[0].address_components[0].long_name;
        const officialName = `${nameOfTheCity}, ${countryName}`;

        setCityName(officialName);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const fetchData = () => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&exclude=minutely,hourly,alerts&appid=${process.env.REACT_APP_API}`
      )
      .then((res) => {
        let options1 = {
            timeZone: res.data.timezone,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          },
          formatter = new Intl.DateTimeFormat([], options1);

        const preFormatedData = formatter.format(new Date());
        const arrDataInfo = preFormatedData.split(",");

        setCurrentTime(arrDataInfo[1]);

        const dailyData = res.data.daily;
        const dailyWithoutCurrentDay = dailyData.slice(1, -1);
   
        setDaily(dailyWithoutCurrentDay);
        setCurrentWeather(res.data.current);
        console.log(currentWeather)

        /*  const options = { timeZone: res.data.timezone, timeZoneName: "short" }; */
        const today = new Date(res.data.current.dt * 1000);
          console.log(today)
        /*       const currentTimeData = today.toLocaleTimeString("en-GB", options); */

        const nameOfTheWeek = weekday[today.getDay()];
        console.log(nameOfTheWeek);
        setCurrentDay(nameOfTheWeek);

        const numberDay = today.toString().slice(8, 11);
        setCalendarDay(numberDay);

        const temperatureDate = Math.round(res.data.current.temp);
        setTemperature(temperatureDate);
      });
  };

  let days = [];
  let windSpeed = null;
  if(currentWeather.wind_speed < 1){
    windSpeed = "Calm (< 1 km/h)"
  }else if(currentWeather.wind_speed >= 1 && currentWeather.wind_speed < 2){
    windSpeed = "Light Air (1 to 5 km/h)"
  }else if(currentWeather.wind_speed >= 2 && currentWeather.wind_speed < 3){
    windSpeed = "Light Breeze (6 to 11 km/h)"
  }else if(currentWeather.wind_speed >= 3 && currentWeather.wind_speed < 4){
    windSpeed = "Gentle Breeze (12 to 19 km/h)"
  }else if(currentWeather.wind_speed >= 4 && currentWeather.wind_speed < 5){
    windSpeed = "Moderate Breeze (20 to 28 km/h)"
  }else if(currentWeather.wind_speed >= 5 && currentWeather.wind_speed < 6){
    windSpeed = "Fresh Breeze (29 to 38 km/h)"
  }else if(currentWeather.wind_speed >= 6 && currentWeather.wind_speed < 7){
    windSpeed = "Strong Breeze (38 to 49 km/h)"
  }

  return (
    <div className={styles.container}>
      <div className={styles.blur}>
        <div className={styles.header}>
          {cityName ? (
            <h1 className={styles.cityName}>{cityName}</h1>
          ) : (
            <h1 className={styles.cityName}>Niš</h1>
          )}
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              <p>Check the weather in</p>
              <input
                value={mySearch}
                onChange={handleSearch}
                className={styles.input}
                type="text"
                name="city"
              />
            </label>
            <button type="submit" className={styles.button}>
              Go
            </button>
          </form>
          <h4 className={styles.time}>{currentTime}</h4>
        </div>

        {currentWeather && (
          <div className={styles.weatherIcon}>
            <h2 className={styles.temperatureNumber}>{temperature}°</h2>
          </div>
        )}

        <div className={styles.weatherInfo}>
          {currentWeather && (
            <div className={styles.currentDay}>
              <div className={styles.dayNameAndIcon}>
                <img
                  className={styles.icon}
                  src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                  alt="weather icon"
                />
                <p className={styles.dayName}>
                  {currentDay} {calendarDay}
                </p>
              </div>

              <div className={styles.dayInfo}>
                <p>Humidity: {currentWeather.humidity}%</p>
                <p>Wind Speed: {windSpeed}</p>
                <p>Description: {currentWeather.weather[0].description}</p>
                <p>Feels like: {currentWeather.feels_like}°C</p>
              </div>
            </div>
          )}

          <div className={styles.restOfTheWeek}>
            {daily.map((day, idx) => {
              const dayOfTheWeek = new Date(day.dt * 1000);

              days.push(weekday[dayOfTheWeek.getDay()]);

              const dayOfTheWeekWithoutCurrentDay = days;

              return (
                <div key={day.dt} className={styles.eachDayOfTheWeek}>
                  <h2>{dayOfTheWeekWithoutCurrentDay[idx]}</h2>
                  <img
                    className={styles.dailyIcon}
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt="weather icon"
                  />
                  <p>{Math.round(day.temp.day)}°</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
