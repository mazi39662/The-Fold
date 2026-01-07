<template>
  <ion-page class="weather-page">
    <ion-header :translucent="true" class="header-fade" :class="{ 'header-visible': showHeaderTitle }">
      <ion-toolbar class="sticky-toolbar">
        <ion-title class="mini-title">Weather Report</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="weather-content" :scroll-events="true" @ionScroll="handleScroll">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          :pulling-icon="chevronDownCircleOutline"
          pulling-text="Pull for latest atmospheric readings..."
          refreshing-spinner="lines-sharp"
          refreshing-text="Updating weather wire..."
        ></ion-refresher-content>
      </ion-refresher>

      <div class="paper-overlay"></div>

      <!-- Weather Masthead -->
      <div class="masthead">
        <div class="masthead-top">
          <span class="masthead-date">{{ currentFormattedDate }}</span>
          <span class="masthead-edition">METEOROLOGICAL BULLETIN</span>
        </div>
        <h1 class="weather-title">Weather Bulletin</h1>
        <div class="masthead-bottom">
          <div class="weather-condition">{{ weatherData?.current?.condition || 'OBSERVING...' }}</div>
          <div class="motto">"Clear skies and Fair winds"</div>
          <div class="location">{{ locationName || 'FINDING STATION...' }}</div>
        </div>
      </div>

      <div v-if="loading" class="loading-container parchment">
        <ion-spinner name="lines-sharp"></ion-spinner>
        <p class="old-font">Consulting the Barometer...</p>
      </div>

      <div v-else-if="error" class="error-container parchment">
        <p class="old-font">{{ error }}</p>
        <ion-button fill="clear" @click="fetchWeather" class="vintage-button">RETRY SIGNAL</ion-button>
      </div>

      <div v-else class="weather-layout">
        <!-- Current Conditions Section -->
        <section class="current-section parchment">
          <div class="current-main">
            <div class="temp-display">
              <span class="temp-value">{{ Math.round(weatherData?.current?.temperature || 0) }}°</span>
              <span class="temp-unit">C</span>
            </div>
            <div class="condition-icon-container">
              <ion-icon :icon="getWeatherIcon(weatherData?.current?.weatherCode)" class="main-weather-icon"></ion-icon>
            </div>
          </div>
          
          <div class="current-details">
            <div class="detail-item">
              <span class="detail-label">HUMIDITY</span>
              <span class="detail-value">{{ weatherData?.current?.humidity }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">WIND</span>
              <span class="detail-value">{{ weatherData?.current?.windspeed }} KM/H</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">PRECIP</span>
              <span class="detail-value">{{ weatherData?.current?.precipitation }} MM</span>
            </div>
          </div>
          
          <div class="article-separator"></div>
        </section>

        <!-- Hourly Forecast -->
        <section class="forecast-section parchment">
          <h2 class="section-title">Hourly Outlook</h2>
          <div class="hourly-scroll">
            <div v-for="(hour, index) in weatherData?.hourly" :key="index" class="hourly-item">
              <span class="hour-time">{{ formatHour(hour.time) }}</span>
              <ion-icon :icon="getWeatherIcon(hour.weatherCode)" class="hour-icon"></ion-icon>
              <span class="hour-temp">{{ Math.round(hour.temperature) }}°</span>
            </div>
          </div>
          <div class="article-separator"></div>
        </section>

        <!-- Daily Forecast -->
        <section class="daily-section parchment">
          <h2 class="section-title">7-Day Forecast</h2>
          <div class="daily-list">
            <div v-for="(day, index) in weatherData?.daily" :key="index" class="daily-row">
              <span class="day-name">{{ index === 0 ? 'Today' : formatDay(day.time) }}</span>
              <div class="day-condition">
                <ion-icon :icon="getWeatherIcon(day.weatherCode)" class="day-icon"></ion-icon>
                <span class="day-desc">{{ getWeatherDesc(day.weatherCode) }}</span>
              </div>
              <div class="day-temps">
                <span class="high-temp">{{ Math.round(day.tempMax) }}°</span>
                <span class="low-temp">{{ Math.round(day.tempMin) }}°</span>
              </div>
            </div>
          </div>
        </section>

        <footer class="weather-footer parchment">
          <div class="article-separator"></div>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent, 
  IonSpinner, 
  IonIcon, 
  IonButton
} from '@ionic/vue';
import { 
  chevronDownCircleOutline, 
  sunnyOutline, 
  partlySunnyOutline, 
  cloudyOutline, 
  rainyOutline, 
  thunderstormOutline, 
  snowOutline, 
  waterOutline,
  cloudyNightOutline
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';

// Types
interface DailyForecast {
  time: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
}

interface WeatherState {
  current: {
    temperature: number;
    weatherCode: number;
    humidity: number;
    windspeed: number;
    precipitation: number;
    condition: string;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

// State
const loading = ref(true);
const error = ref<string | null>(null);
const weatherData = ref<WeatherState | null>(null);
const locationName = ref('');
const showHeaderTitle = ref(false);

// Computed
const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();
});

// Weather Code Mapping
const weatherMap: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'CLEAR SKIES', icon: sunnyOutline },
  1: { desc: 'MAINLY FAIR', icon: sunnyOutline },
  2: { desc: 'PARTLY CLOUDY', icon: partlySunnyOutline },
  3: { desc: 'OVERCAST', icon: cloudyOutline },
  45: { desc: 'MISTY FOG', icon: cloudyOutline },
  48: { desc: 'RIME FOG', icon: cloudyOutline },
  51: { desc: 'LIGHT DRIZZLE', icon: rainyOutline },
  53: { desc: 'DRIZZLE', icon: rainyOutline },
  55: { desc: 'HEAVY DRIZZLE', icon: rainyOutline },
  61: { desc: 'LIGHT RAIN', icon: rainyOutline },
  63: { desc: 'STEADY RAIN', icon: rainyOutline },
  65: { desc: 'HEAVY RAIN', icon: rainyOutline },
  71: { desc: 'LIGHT SNOW', icon: snowOutline },
  73: { desc: 'STEADY SNOW', icon: snowOutline },
  75: { desc: 'HEAVY SNOW', icon: snowOutline },
  80: { desc: 'RAIN SHOWERS', icon: rainyOutline },
  81: { desc: 'HEAVY SHOWERS', icon: rainyOutline },
  82: { desc: 'STORM SHOWERS', icon: rainyOutline },
  95: { desc: 'THUNDERSTORM', icon: thunderstormOutline },
  96: { desc: 'TS WITH HAIL', icon: thunderstormOutline },
  99: { desc: 'SEVERE STORM', icon: thunderstormOutline }
};

const getWeatherIcon = (code: number | undefined) => {
  if (code === undefined) return sunnyOutline;
  return weatherMap[code]?.icon || sunnyOutline;
};

const getWeatherDesc = (code: number | undefined) => {
  if (code === undefined) return 'UNKNOWN';
  return weatherMap[code]?.desc || 'FAIR';
};

const formatHour = (timeStr: string) => {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const formatDay = (timeStr: string) => {
  const date = new Date(timeStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Logic
const fetchWeather = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 1. Get Location (Browser Geolocation API First)
    let lat = 14.5995, lon = 120.9842; // Manila defaults
    
    const getCoords = () => {
      return new Promise<{lat: number, lon: number}>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject('Geolocation not supported');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 10000 }
        );
      });
    };

    try {
      const coords = await getCoords();
      lat = coords.lat;
      lon = coords.lon;
      
      // Get City Name via Reverse Geocoding (OpenStreetMap - Free)
      const geoResp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      const geoData = await geoResp.json();
      const city = geoData.address.city || geoData.address.town || geoData.address.village || 'STATION';
      const country = geoData.address.country || 'EARTH';
      locationName.value = `${city.toUpperCase()}, ${country.toUpperCase()}`;
    } catch (e) {
      console.warn('High-accuracy signals lost. Falling back to IP detection.');
      // Fallback to IP Geolocation
      const locResponse = await fetch('https://ipapi.co/json/');
      const locData = await locResponse.json();
      if (locData.latitude && locData.longitude) {
        lat = locData.latitude;
        lon = locData.longitude;
        locationName.value = `${locData.city?.toUpperCase() || 'STATION'}, ${locData.country_name?.toUpperCase() || 'WIRE'}`;
      }
    }

    // 2. Get Weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('WIRE SIGNAL INTERRUPTED');
    const data = await response.json();

    // 3. Process Data
    weatherData.value = {
      current: {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windspeed: data.current.wind_speed_10m,
        precipitation: data.current.precipitation,
        condition: getWeatherDesc(data.current.weather_code)
      },
      hourly: data.hourly.time.slice(0, 24).map((time: string, i: number) => ({
        time,
        temperature: data.hourly.temperature_2m[i],
        weatherCode: data.hourly.weather_code[i]
      })),
      daily: data.daily.time.map((time: string, i: number) => ({
        time,
        weatherCode: data.daily.weather_code[i],
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i]
      }))
    };
  } catch (err: any) {
    console.error('Weather error:', err);
    error.value = 'THE TELEGRAPH LINES ARE DOWN. PLEASE RETRY LATER.';
  } finally {
    loading.value = false;
  }
};

const handleScroll = (event: any) => {
  showHeaderTitle.value = event.detail.scrollTop > 150;
};

const handleRefresh = async (event: any) => {
  await fetchWeather();
  event.target.complete();
};

onMounted(() => {
  fetchWeather();
});
</script>

<style scoped>


.weather-page {
  --background: var(--ion-background-color) !important;
}

.weather-content {
  --background: transparent !important;
  background-color: transparent !important;
}

.paper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/paper-texture.png');
  pointer-events: none;
  z-index: -1;
  opacity: 0.15;
}

.parchment {
  background-color: transparent;
  padding: 0 20px;
}

/* Masthead Styles - Reusing News Feed style for consistency */
.masthead {
  padding: 20px 20px 10px;
  border-bottom: 3px double var(--ion-text-color);
  text-align: center;
  background: transparent;
}

.masthead-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--ion-text-color);
  padding-bottom: 5px;
  margin-bottom: 15px;
  font-family: 'Old Standard TT', serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ion-text-color);
}

.weather-title {
  font-family: 'Playfair Display', serif;
  font-size: min(10vw, 3.2rem);
  font-weight: 900;
  margin: 5px 0;
  letter-spacing: -1px;
  text-transform: uppercase;
  color: var(--ion-text-color);
  line-height: 1;
}

.masthead-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--ion-text-color);
  padding-top: 8px;
  margin-top: 10px;
  font-family: 'Old Standard TT', serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ion-text-color);
  letter-spacing: 0.5px;
}

.motto {
  font-style: italic;
  font-weight: 400;
}

/* Current Section */
.current-main {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding-bottom: 20px;
}

.temp-display {
  display: flex;
  align-items: flex-start;
}

.temp-value {
  font-family: 'Playfair Display', serif;
  font-size: min(20vw, 5.5rem);
  font-weight: 900;
  line-height: 1;
  color: var(--ion-text-color);
}

.temp-unit {
  font-family: 'Old Standard TT', serif;
  font-size: 2rem;
  font-weight: 700;
  margin-top: 10px;
  color: var(--ion-text-color);
}

.main-weather-icon {
  font-size: min(18vw, 5rem);
  color: var(--ion-text-color);
}

.current-details {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 20px 0;
  border-top: 1px solid var(--ion-text-color);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detail-label {
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--ion-text-color);
  opacity: 0.8;
  letter-spacing: 1.5px;
}

.detail-value {
  font-family: 'Old Standard TT', serif;
  font-size: 1rem;
  font-weight: 900;
  color: var(--ion-text-color);
}

/* Sections */
.section-title {
  font-family: 'Old Standard TT', serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 2px solid var(--ion-text-color);
  padding-bottom: 5px;
  margin: 25px 0 15px;
  color: var(--ion-text-color);
}

/* Hourly Forecast */
.hourly-scroll {
  display: flex;
  overflow-x: auto;
  padding: 10px 0 20px;
  gap: 20px;
  -webkit-overflow-scrolling: touch;
}

.hourly-scroll::-webkit-scrollbar {
  display: none;
}

.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.hour-time {
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: var(--ion-text-color);
}

.hour-icon {
  font-size: 1.5rem;
  margin: 5px 0;
  color: var(--ion-text-color);
}

.hour-temp {
  font-family: 'Old Standard TT', serif;
  font-size: 1rem;
  font-weight: 900;
  color: var(--ion-text-color);
}

/* Daily Forecast */
.daily-list {
  padding-bottom: 20px;
}

.daily-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-text-color);
  opacity: 0.9;
}

.day-name {
  font-family: 'Old Standard TT', serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ion-text-color);
  width: 80px;
}

.day-condition {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.day-icon {
  font-size: 1.2rem;
  color: var(--ion-text-color);
}

.day-desc {
  font-family: 'Old Standard TT', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ion-text-color);
}

.day-temps {
  display: flex;
  gap: 15px;
  font-family: 'Old Standard TT', serif;
}

.high-temp {
  font-weight: 900;
  color: var(--ion-text-color);
}

.low-temp {
  color: var(--ion-text-color);
  opacity: 0.6;
}

/* Separator */
.article-separator {
  height: 4px;
  border-top: 1px solid var(--ion-text-color);
  border-bottom: 1px solid var(--ion-text-color);
  margin: 20px 0;
}

/* Sticky Header */
.sticky-toolbar {
  --background: var(--ion-toolbar-background);
  --color: var(--ion-toolbar-color);
  --border-width: 0;
}

.mini-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.header-fade {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.header-visible {
  opacity: 1;
}

/* Loading & Error */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.old-font {
  font-family: 'Old Standard TT', serif;
  font-size: 1.2rem;
  margin-top: 10px;
}

.vintage-button {
  --color: var(--ion-text-color);
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  border: 2px solid var(--ion-text-color);
}

.weather-footer {
  text-align: center;
  padding: 30px 20px;
}

.source-credit {
  font-family: 'Old Standard TT', serif;
  font-size: 0.65rem;
  color: var(--ion-text-color);
  opacity: 0.7;
  font-weight: 700;
  text-transform: uppercase;
}
</style>
