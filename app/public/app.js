document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const cityInput = document.getElementById('city');
  const placeEl = document.getElementById('place');
  const summaryEl = document.getElementById('summary');
  const rawEl = document.getElementById('raw');

  function showError(text) {
    placeEl.textContent = '';
    summaryEl.textContent = text;
    rawEl.style.display = 'none';
  }

  async function fetchWeather(city) {
    summaryEl.textContent = 'Loading...';
    placeEl.textContent = '';
    rawEl.style.display = 'none';
    try {
      const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${resp.status}`);
      }
      const data = await resp.json();
      const cw = data.current;
      if (!cw) {
        showError('No current weather data available');
        return;
      }

      placeEl.textContent = data.city;
      document.getElementById('source').textContent = data.source ? `Source: ${data.source}` : '';

      const weatherInfo = mapWeatherCode(cw.weathercode);
      const iconEl = document.getElementById('icon');
      iconEl.textContent = weatherInfo.icon;

      summaryEl.innerHTML = `
        <div style="font-size:28px;font-weight:700">${cw.temperature}°C</div>
        <div class="muted">${weatherInfo.label}</div>
      `.trim();

      document.getElementById('details').innerHTML = `
        <div><strong>Wind:</strong> ${cw.windspeed} km/h • ${cw.winddirection}°</div>
        <div><strong>Time:</strong> ${new Date().toLocaleString()}</div>
      `.trim();

      rawEl.textContent = JSON.stringify(data, null, 2);
      rawEl.classList.add('visible');
    } catch (err) {
      showError('Error: ' + (err.message || 'Failed to fetch'));
    }
  }

  // Toggle raw JSON panel
  const toggleBtn = document.getElementById('toggle-raw');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (rawEl.classList.contains('visible')) {
        rawEl.classList.remove('visible');
        toggleBtn.textContent = 'Show JSON';
      } else {
        rawEl.classList.add('visible');
        toggleBtn.textContent = 'Hide JSON';
      }
    });
  }

  function mapWeatherCode(code) {
    // Basic mapping of Open-Meteo weathercode to emoji + label
    const mapping = {
      0: ['☀️', 'Clear sky'],
      1: ['🌤️', 'Mainly clear'],
      2: ['⛅', 'Partly cloudy'],
      3: ['☁️', 'Overcast'],
      45: ['🌫️', 'Fog'],
      48: ['🌫️', 'Depositing rime fog'],
      51: ['🌦️', 'Light drizzle'],
      53: ['🌧️', 'Moderate drizzle'],
      55: ['🌧️', 'Dense drizzle'],
      61: ['🌧️', 'Slight rain'],
      63: ['🌧️', 'Moderate rain'],
      65: ['⛈️', 'Heavy rain'],
      71: ['🌨️', 'Slight snow'],
      73: ['🌨️', 'Moderate snow'],
      75: ['🌨️', 'Heavy snow'],
      95: ['⛈️', 'Thunderstorm'],
      96: ['⛈️', 'Thunderstorm with slight hail'],
      99: ['⛈️', 'Thunderstorm with heavy hail']
    };
    return mapping[code] || ['❓', `Weather code ${code}`];
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(city);
  });
});
