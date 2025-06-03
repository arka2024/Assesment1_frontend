import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function App() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const getWeather = async (location) => {
    try {
      setLoading(true);
      setError('');
      setIsSearching(true);
      
      const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: location,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const forecastResponse = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: location,
          appid: API_KEY,
          units: 'metric'
        }
      });

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
    } catch (err) {
      setError('Location not found. Please try again.');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLoading(true);
            setError('');
            setIsSearching(true);
            
            const { latitude, longitude } = position.coords;
            const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
              params: {
                lat: latitude,
                lon: longitude,
                appid: API_KEY,
                units: 'metric'
              }
            });

            const forecastResponse = await axios.get(`${BASE_URL}/forecast`, {
              params: {
                lat: latitude,
                lon: longitude,
                appid: API_KEY,
                units: 'metric'
              }
            });

            setWeather(weatherResponse.data);
            setForecast(forecastResponse.data);
            setLocation(weatherResponse.data.name);
          } catch (err) {
            setError('Failed to fetch weather data for your location.');
          } finally {
            setLoading(false);
            setIsSearching(false);
          }
        },
        (error) => {
          setError('Unable to retrieve your location.');
          setIsSearching(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      getWeather(location);
    }
  };

  useEffect(() => {
    if (!location) return;

    axios.get(`http://localhost:4000/weather?location=${location}`)
      .then(response => {
        console.log('Backend response:', response.data);
      })
      .catch(error => {
        console.error('Error connecting to backend:', error);
      });
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-center text-white mb-4 animate-slide-down">
          Weather Forecast
        </h1>
        <p className="text-xl text-center text-gray-400 mb-12 animate-fade-in">
          Discover the weather anywhere in the world
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
          <div className="flex-1 relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name, zip code, or coordinates"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-3.5 animate-spin text-gray-400" />
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              Search
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <MapPinIcon className="h-5 w-5" />
              Current Location
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl relative mb-8 animate-scale-in">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {weather && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 animate-scale-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold text-white">{weather.name}</h2>
                <p className="text-gray-400 text-lg">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="w-24 h-24 animate-bounce-slow"
                />
                <p className="text-3xl font-bold text-white">{Math.round(weather.main.temp)}°C</p>
                <p className="text-gray-400 capitalize text-lg">{weather.weather[0].description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors duration-300">
                <p className="text-gray-400 text-lg">Feels Like</p>
                <p className="text-2xl font-semibold text-white">{Math.round(weather.main.feels_like)}°C</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors duration-300">
                <p className="text-gray-400 text-lg">Humidity</p>
                <p className="text-2xl font-semibold text-white">{weather.main.humidity}%</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 transition-colors duration-300">
                <p className="text-gray-400 text-lg">Wind Speed</p>
                <p className="text-2xl font-semibold text-white">{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}

        {forecast && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.list.slice(0, 5).map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-lg font-semibold text-white">
                  {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img
                  src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].main}
                  className="w-16 h-16 mx-auto my-2 animate-bounce-slow"
                />
                <p className="text-center text-2xl font-bold text-white">
                  {Math.round(item.main.temp)}°C
                </p>
                <p className="text-center text-gray-400 capitalize">
                  {item.weather[0].main}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
