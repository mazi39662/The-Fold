<template>
  <ion-page class="settings-page">

    <ion-content :fullscreen="true" class="settings-content">
      <div class="paper-overlay"></div>

      <div class="settings-container">
        <!-- Masthead -->
        <div class="masthead">
          <div class="masthead-top">
            <span class="masthead-edition">ARCHIVE BUREAU</span>
            <span class="masthead-price">VOL. I</span>
          </div>
          <h1 class="settings-title">Settings</h1>
          <div class="masthead-bottom">
            <div class="motto">"Configuring your daily dispatches"</div>
            <div class="date">{{ currentFormattedDate }}</div>
          </div>
        </div>

        <!-- Settings List -->
        <div class="parchment">
          
          <!-- Preferences Section -->
          <section class="settings-section">
            <h2 class="section-title">PREFERENCES</h2>
            
            <div class="setting-row" @click="goToSources">
              <div class="setting-info">
                <h3 class="setting-name">Configure Wires</h3>
                <p class="setting-desc">Select the agencies that supply your news.</p>
              </div>
              <ion-icon :icon="libraryOutline" class="setting-icon"></ion-icon>
            </div>


            
            <div class="article-separator"></div>
          </section>

          <!-- Information Section -->
          <section class="settings-section">
            <h2 class="section-title">INFORMATION</h2>
            
            <div class="setting-row" @click="showCredits = !showCredits">
              <div class="setting-info">
                <h3 class="setting-name">Application Credits</h3>
                <p class="setting-desc">The hands that built the press.</p>
              </div>
              <ion-icon :icon="showCredits ? chevronUpOutline : chevronDownOutline" class="setting-icon"></ion-icon>
            </div>

            <!-- Credits Details (Expandable) -->
            <div v-if="showCredits" class="credits-expanded fade-in">
              <div class="credit-item">
                <h4 class="credit-heading">Meteorological Data</h4>
                <p class="credit-text">Open-Meteo wire service. Real-time atmospheric snapshots.</p>
              </div>
              <div class="credit-item">
                <h4 class="credit-heading">Navigation Signals</h4>
                <p class="credit-text">IPAPI & OpenStreetMap Nominatim for station detection.</p>
              </div>
              <div class="credit-item">
                <h4 class="credit-heading">News Wires</h4>
                <p class="credit-text">Comprehensive collection of RSS feeds from: Manila Times, Philstar, GMA News, ABS-CBN News, Rappler, Inquirer, Manila Bulletin, BBC, Reuters, Al Jazeera, The Guardian, CNN, NYT, TechCrunch, The Verge, Wired, Engadget, Mashable, Financial Times, Bloomberg, Forbes, WSJ, ESPN, Scientific American, Nature, and WHO.</p>
              </div>
            </div>

            <div class="setting-row" @click="showAbout">
              <div class="setting-info">
                <h3 class="setting-name">What is The Fold?</h3>
                <p class="setting-desc">The history and philosophy behind our name.</p>
              </div>
              <ion-icon :icon="informationCircleOutline" class="setting-icon"></ion-icon>
            </div>

            <div class="article-separator"></div>
          </section>

          <!-- Press Gallery Section -->
          <section class="settings-section">
            <p class="correspondent-note">A registry of our global correspondents and wire services.</p>
            <div class="logo-cloud">
              <div v-for="source in newsSources" :key="source.domain" class="source-logo-item">
                <div class="icon-wrapper">
                  <img :src="`https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`" :alt="source.name" class="source-icon" />
                </div>
                <span class="source-mini-name">{{ source.name }}</span>
              </div>
            </div>
          </section>

          <footer class="settings-footer">
            <p class="old-font motto">"All the news that's fit to feed"</p>
            <p class="version-tag">THE FOLD • VERSION 1.0.0</p>
          </footer>
        </div>
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
  IonIcon,
  alertController
} from '@ionic/vue';
import { 

  libraryOutline,
  informationCircleOutline,
  chevronDownOutline,
  chevronUpOutline
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showCredits = ref(false);

const newsSources = [
  { name: 'Manila Times', domain: 'manilatimes.net' },
  { name: 'Philstar', domain: 'philstar.com' },
  { name: 'GMA News', domain: 'gmanetwork.com' },
  { name: 'ABS-CBN', domain: 'abs-cbn.com' },
  { name: 'Rappler', domain: 'rappler.com' },
  { name: 'Inquirer', domain: 'inquirer.net' },
  { name: 'Manila Bulletin', domain: 'mb.com.ph' },
  { name: 'BBC News', domain: 'bbc.com' },
  { name: 'Reuters', domain: 'reuters.com' },
  { name: 'Al Jazeera', domain: 'aljazeera.com' },
  { name: 'The Guardian', domain: 'theguardian.com' },
  { name: 'CNN', domain: 'cnn.com' },
  { name: 'New York Times', domain: 'nytimes.com' },
  { name: 'TechCrunch', domain: 'techcrunch.com' },
  { name: 'The Verge', domain: 'theverge.com' },
  { name: 'Wired', domain: 'wired.com' },
  { name: 'Engadget', domain: 'engadget.com' },
  { name: 'Mashable', domain: 'mashable.com' },
  { name: 'Financial Times', domain: 'ft.com' },
  { name: 'Bloomberg', domain: 'bloomberg.com' },
  { name: 'Forbes', domain: 'forbes.com' },
  { name: 'WSJ', domain: 'wsj.com' },
  { name: 'ESPN', domain: 'espn.com' },
  { name: 'SciAm', domain: 'scientificamerican.com' },
  { name: 'Nature', domain: 'nature.com' },
  { name: 'WHO', domain: 'who.int' }
];

const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();
});



const goToSources = () => {
  router.push('/tabs/tab4');
};

const showAbout = async () => {
  const alert = await alertController.create({
    header: 'What is The Fold?',
    message: "The Fold is a simple news app that brings together stories from multiple sources in one place, so you don't have to switch between apps or websites. In newspapers, the fold is where the most important stories appear first. The Fold is built around that idea—showing what matters most, clearly and without distractions. All content belongs to its original publishers. Credits are listed in Settings.",
    buttons: ['DONE']
  });
  await alert.present();
};
</script>

<style scoped>
.settings-page {
  --background: var(--ion-background-color);
}

.settings-content {
  --background: transparent;
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

.settings-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.vintage-toolbar {
  --background: var(--ion-toolbar-background);
  --border-bottom: 3px double var(--ion-text-color);
  --color: var(--ion-toolbar-color);
}

.vintage-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 3px;
  text-align: center;
}

.masthead {
  padding: 20px 20px 10px;
  border-bottom: 5px double var(--ion-text-color);
  margin-bottom: 25px;
  text-align: center;
}

.masthead-top {
  display: flex;
  justify-content: space-between;
  font-family: 'Old Standard TT', serif;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--ion-text-color);
  padding-bottom: 5px;
  margin-bottom: 10px;
  color: var(--ion-text-color);
  text-transform: uppercase;
}

.settings-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 900;
  margin: 10px 0;
  text-transform: uppercase;
  color: var(--ion-text-color);
  line-height: 1;
}

.masthead-bottom {
  display: flex;
  justify-content: space-between;
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 700;
  border-top: 1px solid var(--ion-text-color);
  padding-top: 5px;
  margin-top: 5px;
  color: var(--ion-text-color);
}

.parchment {
  padding: 0 15px 120px;
}

.section-title {
  font-family: 'Old Standard TT', serif;
  font-size: 1.2rem;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 2px solid var(--ion-text-color);
  padding-bottom: 5px;
  margin: 35px 0 15px;
  color: var(--ion-text-color);
  letter-spacing: 2px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.setting-row:hover {
  transform: translateX(5px);
}

.setting-name {
  font-family: 'Old Standard TT', serif;
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0;
  color: var(--ion-text-color);
  text-transform: uppercase;
}

.setting-desc {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  color: var(--ion-text-color);
  opacity: 0.8;
  margin: 2px 0 0;
}

.setting-icon {
  font-size: 1.4rem;
  color: var(--ion-text-color);
}

.credits-expanded {
  background: rgba(0,0,0,0.03);
  padding: 20px;
  margin: 10px 0;
  border-left: 4px solid var(--ion-text-color);
}

.credit-item {
  margin-bottom: 15px;
}

.credit-heading {
  font-family: 'Old Standard TT', serif;
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--ion-text-color);
  margin-bottom: 2px;
  text-transform: uppercase;
}

.credit-text {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--ion-text-color);
  margin: 0;
}

.article-separator {
  height: 4px;
  border-top: 1px solid var(--ion-text-color);
  border-bottom: 1px solid var(--ion-text-color);
  margin: 30px 0;
}

.correspondent-note {
  font-family: 'EB Garamond', serif;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--ion-text-color);
  opacity: 0.7;
  text-align: center;
  margin-bottom: 20px;
}

.logo-cloud {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

.source-logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: var(--parchment-white);
  border: 1px solid var(--ion-text-color);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 var(--ion-text-color);
  transition: all 0.3s ease;
}

.source-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: grayscale(1) sepia(0.3) contrast(1.1);
  opacity: 0.8;
}

.source-logo-item:hover .icon-wrapper {
  transform: translateY(-5px);
  box-shadow: 4px 4px 0 var(--ion-text-color);
}

.source-logo-item:hover .source-icon {
  filter: none;
  opacity: 1;
}

.source-mini-name {
  font-family: 'Old Standard TT', serif;
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 8px;
  color: var(--ion-text-color);
  opacity: 0.6;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.settings-footer {
  text-align: center;
  margin-top: 40px;
  padding-bottom: 40px;
}

.motto {
  font-style: italic;
  font-size: 1rem;
  color: var(--ion-text-color);
}

.version-tag {
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--ion-text-color);
  opacity: 0.6;
  letter-spacing: 2px;
  margin-top: 10px;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
