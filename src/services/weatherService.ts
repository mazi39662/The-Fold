import { ref } from 'vue';

export const sharedWeatherState = ref({
    location: 'MANILA, PHILIPPINES',
    condition: 'FAIR & SUNNY',
    temp: 0,
    lat: 14.5995,
    lon: 120.9842,
    isLoaded: false
});

export const updateSharedWeather = async () => {
    try {
        let lat = 14.5995;
        let lon = 120.9842;

        // 1. Precise Geolocation
        const getCoords = () => {
            return new Promise<{ lat: number, lon: number }>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject('Geolocation not supported');
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                    (err) => reject(err),
                    { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
                );
            });
        };

        try {
            const coords = await getCoords();
            lat = coords.lat;
            lon = coords.lon;

            // Use BigDataCloud's client-side reverse geocoding (CORS friendly and no key needed)
            const geoResp = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const geoData = await geoResp.json();

            const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'STATION';
            const state = geoData.principalSubdivision || '';
            const country = geoData.countryName || 'EARTH';

            if (city && state && city !== state) {
                sharedWeatherState.value.location = `${city.toUpperCase()}, ${state.toUpperCase()}`;
            } else {
                sharedWeatherState.value.location = `${city.toUpperCase()}, ${country.toUpperCase()}`;
            }
        } catch (e) {
            console.warn('GPS or Geocoding failed, falling back to IP detection.');
            // IP Fallback
            const locResponse = await fetch('https://ipapi.co/json/');
            if (locResponse.ok) {
                const locData = await locResponse.json();
                lat = locData.latitude;
                lon = locData.longitude;
                if (locData.city) {
                    sharedWeatherState.value.location = locData.region
                        ? `${locData.city.toUpperCase()}, ${locData.region.toUpperCase()}`
                        : `${locData.city.toUpperCase()}, ${locData.country_name.toUpperCase()}`;
                }
            }
        }

        sharedWeatherState.value.lat = lat;
        sharedWeatherState.value.lon = lon;

        // 2. Weather Data
        if (lat && lon) {
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m`);
            const weatherData = await weatherResponse.json();
            const code = weatherData.current.weather_code;
            sharedWeatherState.value.temp = Math.round(weatherData.current.temperature_2m);

            const weatherMap: Record<number, string> = {
                0: 'FAIR & CLOUDLESS',
                1: 'FAIR & SUNNY',
                2: 'PARTLY CLOUDY',
                3: 'OVERCAST',
                45: 'MISTY MORNING',
                48: 'FOGGY CONDITIONS',
                51: 'LIGHT DRIZZLE',
                61: 'STEADY RAIN',
                80: 'HEAVY SHOWERS',
                95: 'STORMY WINDS'
            };

            sharedWeatherState.value.condition = weatherMap[code] || (code > 60 ? 'RAINING HEAVILY' : 'FAIR & SUNNY');
            sharedWeatherState.value.isLoaded = true;
        }
    } catch (err) {
        console.error('Weather wire failure:', err);
    }
};
