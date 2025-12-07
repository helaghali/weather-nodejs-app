# Weather Snapshot 🌤️

A modern, Dockerized Node.js web app to check the current weather for any city. Features a clean, responsive UI, emoji-based weather display, and supports both Open-Meteo (no API key needed) and OpenWeatherMap (optional API key).

---

## Features
- 🔍 Search any city and get live weather (temperature, wind, emoji, etc.)
- 🌐 Uses Open-Meteo (free, no key) or OpenWeatherMap (if you set `OPENWEATHER_API_KEY`)
- 🖥️ Responsive, single-page frontend (vanilla JS)
- 🐳 Docker-ready, lightweight image
- ✅ GitHub Actions CI included

---

## Quick Start

### Local
```powershell
cd .\app
npm install
npm start
# Visit http://localhost:3000
```

### Docker
```powershell
docker build -t weather-app -f dockerfile .
docker run -p 3000:3000 weather-app
# Visit http://localhost:3000
```

### Use OpenWeatherMap (optional)
1. Get a free API key from https://openweathermap.org/
2. Run with the env var set:
   - Docker:
     ```powershell
     docker run -e OPENWEATHER_API_KEY=your_key -p 3000:3000 weather-app
     ```
   - Local:
     ```powershell
     $env:OPENWEATHER_API_KEY = "your_key"
     cd .\app
     npm start
     ```

---

## Project Structure

```
weather-snapshot/
├── app/
│   ├── server.js         # Express backend (API + static frontend)
│   ├── package.json      # Node.js dependencies
│   └── public/           # SPA frontend
│       ├── index.html
│       ├── app.js
│       └── styles.css
├── dockerfile            # Docker build instructions
├── .gitignore            # Git ignore rules
├── .dockerignore         # Docker ignore rules
├── LICENSE               # MIT License
├── README.md             # This file
└── .github/workflows/ci.yml # GitHub Actions CI
```

---

## Contributing
Pull requests and issues welcome!

---

## License
MIT — see [LICENSE](LICENSE)





