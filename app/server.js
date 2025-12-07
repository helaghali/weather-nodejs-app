const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple JSON API used by the SPA
app.get('/api/hello', (req, res) => {
  res.json({
    name: 'Dockerized Node App',
    message: 'Hello from the API! 🚀',
    timestamp: new Date().toISOString()
  });
});

// Weather endpoint: uses Nominatim (OpenStreetMap) for geocoding
// and Open-Meteo for current weather (no API key required).
// Example: GET /api/weather?city=London
const weatherCache = new Map(); // simple in-memory cache
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

app.get('/api/weather', async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.status(400).json({ error: 'Missing `city` query parameter' });

  const key = city.toLowerCase();
  const now = Date.now();
  const cached = weatherCache.get(key);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return res.json({ source: 'cache', ...cached.data });
  }

  try {
    // 1) Geocode the city name using Nominatim
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;
    const geoResp = await fetch(geocodeUrl, { headers: { 'User-Agent': 'docker-node-webapp/1.0' } });
    if (!geoResp.ok) throw new Error('Geocoding request failed');
    const geoJson = await geoResp.json();
    if (!Array.isArray(geoJson) || geoJson.length === 0) return res.status(404).json({ error: 'Location not found' });

    const place = geoJson[0];
    const lat = Number(place.lat);
    const lon = Number(place.lon);

    // 2) Request current weather
    // If OPENWEATHER_API_KEY is set, prefer OpenWeatherMap (richer data), otherwise use Open-Meteo.
    let payload;
    const owKey = process.env.OPENWEATHER_API_KEY;
    if (owKey) {
      const owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${owKey}&units=metric`;
      const owResp = await fetch(owUrl);
      if (!owResp.ok) {
        const txt = await owResp.text().catch(() => '');
        throw new Error(`OpenWeatherMap request failed: ${owResp.status} ${txt}`);
      }
      const ow = await owResp.json();
      payload = {
        city: ow.name ? `${ow.name}, ${ow.sys?.country || ''}` : place.display_name || city,
        lat,
        lon,
        current: {
          temperature: ow.main?.temp ?? null,
          windspeed: ow.wind?.speed ? Math.round(ow.wind.speed * 3.6 * 10) / 10 : null, // m/s -> km/h
          winddirection: ow.wind?.deg ?? null,
          weathercode: ow.weather?.[0]?.id ?? null,
          description: ow.weather?.[0]?.description ?? ''
        }
      };
    } else {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
      const wResp = await fetch(weatherUrl);
      if (!wResp.ok) throw new Error('Weather request failed');
      const wJson = await wResp.json();
      payload = {
        city: place.display_name || city,
        lat,
        lon,
        current: wJson.current_weather || null
      };
    }

    // cache and respond
    weatherCache.set(key, { ts: now, data: payload });
    res.json({ source: 'api', ...payload });
  } catch (err) {
    console.error('Error in /api/weather:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Fallback to serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
