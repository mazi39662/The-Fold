<template>
  <ion-page class="onboarding-page">
    <ion-content :fullscreen="true" class="onboarding-content">
      <div class="paper-overlay"></div>
      
      <div class="content-container">
        <!-- Step 1: Welcome Poster -->
        <div v-if="currentStep === 1" class="onboarding-step fade-in">
          <div class="onboarding-card">
            <img src="/assets/onboarding/welcome.png" alt="Welcome to The Fold" class="onboarding-poster" />
            <div class="onboarding-text">
              <h1 class="vintage-headline">Welcome to The Fold</h1>
              <p class="vintage-copy">A premium broadsheet experience for the digital age. Authenticity in every dispatch.</p>
            </div>
          </div>
          <button class="vintage-btn primary" @click="nextStep">PROCEED</button>
        </div>

        <!-- Step 2: Features Poster -->
        <div v-else-if="currentStep === 2" class="onboarding-step fade-in">
          <div class="onboarding-card">
            <img src="/assets/onboarding/features.png" alt="Our Features" class="onboarding-poster" />
            <div class="onboarding-text">
              <h1 class="vintage-headline">The Ritual of Priority</h1>
              <p class="vintage-copy">In the era of the daily broadsheet, 'The Fold' was the ultimate divider. Newsboys delivered the priority dispatches right to your doorstep, folded to reveal only the most critical stories of the day.</p>
            </div>
          </div>
          <div class="btn-group">
            <button class="vintage-btn secondary-btn" @click="currentStep--">GO BACK</button>
            <button class="vintage-btn primary" @click="nextStep">PROCEED</button>
          </div>
        </div>

        <!-- Step 3: Source Selection -->
        <div v-else-if="currentStep === 3" class="onboarding-step fade-in">
          <div class="sources-setup">
            <h1 class="vintage-headline">SELECT YOUR NEWS WIRES</h1>
            <p class="vintage-copy">Choose the sources you wish to receive dispatches from.</p>
            
            <ion-searchbar 
              v-model="searchQuery"
              placeholder="Filter agencies..."
              class="vintage-searchbar"
              mode="md"
            ></ion-searchbar>
            
            <div class="onboarding-quick-actions">
              <button class="small-vintage-btn" @click="selectAll">SELECT ALL</button>
              <button class="small-vintage-btn" @click="clearAll">CLEAR ALL</button>
            </div>
            
            <div class="onboarding-sources-scroll">
              <div 
                v-for="category in filteredCategories" 
                :key="category.name" 
                class="category-block"
              >
                <div class="category-header" @click="toggleCategory(category.name)">
                  <div class="category-left">
                    <span class="expand-indicator">{{ expandedCategories.includes(category.name) ? '▼' : '▶' }}</span>
                    <ion-icon :icon="getCategoryIcon(category.name)" class="category-icon"></ion-icon>
                    <h2 class="category-title">{{ category.name }}</h2>
                  </div>
                  <div class="category-right">
                    <span class="category-count">{{ getSelectedCount(category) }}/{{ category.feeds.length }}</span>
                  </div>
                </div>

                <div v-show="expandedCategories.includes(category.name)" class="category-content">
                  <div 
                    v-for="(feed, index) in category.feeds" 
                    :key="index"
                    class="feed-item"
                    :class="{ 'selected': selectedFeeds.includes(feed.url) }"
                    @click="toggleFeed(feed.url)"
                  >
                    <div class="feed-main">
                      <div class="custom-checkbox" :class="{ 'checked': selectedFeeds.includes(feed.url) }">
                        <span v-if="selectedFeeds.includes(feed.url)" class="checkmark">✓</span>
                      </div>
                      <div class="feed-details">
                        <h3 class="feed-name">{{ feed.name }}</h3>
                        <p class="feed-description" v-if="feed.description">{{ feed.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="onboarding-footer sticky-bottom">
              <p class="selection-count">{{ selectedFeeds.length }} SOURCES SELECTED</p>
              <button 
                class="vintage-btn primary" 
                :disabled="selectedFeeds.length === 0"
                @click="completeOnboarding"
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent, 
  IonIcon, 
  IonSearchbar, 
  toastController 
} from '@ionic/vue';
import { 
  newspaperOutline, 
  globeOutline, 
  hardwareChipOutline, 
  cashOutline, 
  flaskOutline, 
  filmOutline 
} from 'ionicons/icons';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentStep = ref(1);
const searchQuery = ref('');
const selectedFeeds = ref<string[]>([]);
const expandedCategories = ref<string[]>(['Philippines News']);

const feedCategories = ref([
  {
    name: 'Philippines News',
    feeds: [
      { name: 'Manila Times - Headlines', url: 'https://www.manilatimes.net/news/feed/', description: 'National and local dispatches' },
      { name: 'Manila Times - Business', url: 'https://www.manilatimes.net/business/feed/', description: 'Markets and commerce news' },
      { name: 'Philstar - Headlines', url: 'https://www.philstar.com/rss/headlines', description: 'Major stories in the archipelago' },
      { name: 'Philstar - Nation', url: 'https://www.philstar.com/rss/nation', description: 'Provincial news on the wire' },
      { name: 'GMA News', url: 'https://www.gmanetwork.com/news/rss', description: 'Serbisyong Totoo dispatches' },
      { name: 'ABS-CBN News', url: 'https://news.abs-cbn.com/feed', description: 'In the service of the Filipino' },
      { name: 'Rappler', url: 'https://www.rappler.com/feed', description: 'Independent and fearless journalism' },
      { name: 'Inquirer.net', url: 'https://www.inquirer.net/fullfeed', description: 'Balanced news, fearless views' },
      { name: 'Manila Bulletin', url: 'https://mb.com.ph/feed/', description: 'The nation\'s leading newspaper' }
    ]
  },
  {
    name: 'International News',
    feeds: [
      { name: 'BBC News - World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', description: 'Global dispatches from the London wire' },
      { name: 'Reuters - World News', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', description: 'Instant worldwide reports' },
      { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', description: 'Middle East and global perspective' },
      { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', description: 'International analysis and reports' },
      { name: 'CNN International', url: 'http://rss.cnn.com/rss/edition_world.rss', description: 'Worldwide breaking news' },
      { name: 'NYT - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', description: 'Global coverage from New York' }
    ]
  },
  {
    name: 'Technology',
    feeds: [
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', description: 'The latest in machines and industry' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', description: 'Future technology and culture' },
      { name: 'Wired', url: 'https://www.wired.com/feed/rss', description: 'Modern technology and its impact' },
      { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', description: 'Gadgets and hardware reports' },
      { name: 'Mashable', url: 'https://mashable.com/feeds/rss/all', description: 'Tech, media, and digital trends' }
    ]
  },
  {
    name: 'Business & Finance',
    feeds: [
      { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', description: 'Global financial analysis' },
      { name: 'Bloomberg - Markets', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', description: 'Stock markets and wealth' },
      { name: 'Forbes - Real Time', url: 'https://www.forbes.com/real-time/feed2/', description: 'Business leadership and news' },
      { name: 'WSJ - World News', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', description: 'Wall Street international wire' }
    ]
  },
  {
    name: 'Sports & Leisure',
    feeds: [
      { name: 'ESPN - Top News', url: 'https://www.espn.com/espn/rss/news', description: 'Athletic world updates' },
      { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', description: 'Sports reporting from across the globe' }
    ]
  },
  {
    name: 'Science & Health',
    feeds: [
      { name: 'Scientific American', url: 'https://www.scientificamerican.com/feed/', description: 'Human discovery and science' },
      { name: 'Nature News', url: 'https://www.nature.com/nature.rss', description: 'Research and academic dispatches' },
      { name: 'WHO - Global Health', url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml', description: 'World health updates' }
    ]
  }
]);

const selectAll = () => {
  const allUrls = feedCategories.value.flatMap(cat => cat.feeds.map(f => f.url));
  selectedFeeds.value = [...allUrls];
};

const clearAll = () => {
  selectedFeeds.value = [];
};

const getSelectedCount = (category: any) => {
  return category.feeds.filter((feed: any) => selectedFeeds.value.includes(feed.url)).length;
};

const filteredCategories = computed(() => {
  if (!searchQuery.value) return feedCategories.value;
  const query = searchQuery.value.toLowerCase();
  return feedCategories.value
    .map(category => ({
      ...category,
      feeds: category.feeds.filter(feed => feed.name.toLowerCase().includes(query))
    }))
    .filter(category => category.feeds.length > 0);
});

const nextStep = () => {
  currentStep.value++;
};

const toggleCategory = (name: string) => {
  const idx = expandedCategories.value.indexOf(name);
  if (idx > -1) {
    expandedCategories.value = expandedCategories.value.filter(n => n !== name);
  } else {
    expandedCategories.value = [...expandedCategories.value, name];
  }
};

const toggleFeed = (url: string) => {
  const index = selectedFeeds.value.indexOf(url);
  if (index > -1) {
    selectedFeeds.value = selectedFeeds.value.filter(u => u !== url);
  } else {
    selectedFeeds.value = [...selectedFeeds.value, url];
  }
};

const getCategoryIcon = (categoryName: string) => {
  const iconMap: any = {
    'Philippines News': newspaperOutline,
    'International News': globeOutline,
    'Technology': hardwareChipOutline,
    'Business & Finance': cashOutline,
    'Science & Health': flaskOutline,
    'Entertainment & Culture': filmOutline
  };
  return iconMap[categoryName] || newspaperOutline;
};

const completeOnboarding = async () => {
  localStorage.setItem('has_completed_onboarding', 'true');
  localStorage.setItem('selected_rss_feeds', JSON.stringify(selectedFeeds.value));
  window.dispatchEvent(new Event('rss-feeds-updated'));
  
  const toast = await toastController.create({
    message: 'Welcome to The Fold. Your wire is live.',
    duration: 3000,
    position: 'bottom'
  });
  await toast.present();
  
  router.push('/tabs/tab1');
};

watch(searchQuery, (newVal) => {
  if (newVal) {
    const matchingNames = filteredCategories.value.map(c => c.name);
    expandedCategories.value = Array.from(new Set([...expandedCategories.value, ...matchingNames]));
  }
});

onMounted(() => {
  // Default selection
  selectedFeeds.value = ['https://www.manilatimes.net/news/feed/'];
});
</script>

<style scoped>
.onboarding-page {
  --background: #f4ecd8;
}

.onboarding-content {
  --background: transparent;
  background-color: #f4ecd8;
}

.paper-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/paper-texture.png');
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.content-container {
  padding: 20px 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Better for scrolling */
  position: relative;
  z-index: 1;
}

@media (min-height: 700px) {
  .content-container {
    justify-content: center;
  }
}

.onboarding-step {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.onboarding-card {
  background: var(--parchment-white);
  border: 3px solid #222;
  box-shadow: 8px 8px 0 #222;
  padding: 10px;
}

.onboarding-poster {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  display: block;
}

.onboarding-text {
  padding: 24px 10px;
  text-align: center;
}

.vintage-headline {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 1.8rem;
  color: #1a1a1a;
  letter-spacing: 1px;
}

.vintage-copy {
  font-family: 'EB Garamond', serif;
  font-size: 1.2rem;
  color: #444;
  line-height: 1.4;
  font-style: italic;
  margin: 0 0 20px 0;
}

.vintage-btn {
  width: 100%;
  padding: 16px;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 3px solid #000;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-group {
  display: flex;
  gap: 15px;
  width: 100%;
}

.btn-group .vintage-btn {
  flex: 1 1 0%;
  width: 0;
  white-space: nowrap;
  font-size: 0.8rem; /* Slightly smaller to fit longer text */
}

.secondary-btn {
  background: var(--parchment-white);
  color: #1a1a1a;
  box-shadow: 6px 6px 0 #1a1a1a;
}

.secondary-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1a1a1a;
}

.vintage-btn.primary {
  background: #f4ecda;
  color: #1a1a1a;
  box-shadow: 6px 6px 0 #1a1a1a;
}

.vintage-btn.primary:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1a1a1a;
}

.vintage-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Source Selection Styles */
.sources-setup {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background: var(--parchment-white);
  border: 4px solid #222;
  box-shadow: 12px 12px 0 #222;
  padding: 20px 16px;
  margin-bottom: 20px;
}

.onboarding-quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.small-vintage-btn {
  background: var(--parchment-white);
  border: 2px solid #222;
  padding: 8px 12px;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.75rem;
  cursor: pointer;
  box-shadow: 2px 2px 0 #222;
  text-transform: uppercase;
  color: #1a1a1a;
}

.small-vintage-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #222;
}

.onboarding-sources-scroll {
  max-height: 45vh;
  overflow-y: auto;
  padding: 10px 4px;
  margin-bottom: 20px;
  border-top: 1px solid #222;
  border-bottom: 1px solid #222;
}

.category-block {
  background: var(--parchment-white);
  border: 2px solid #222;
  margin-bottom: 15px;
  box-shadow: 3px 3px 0 #222;
}

.category-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f4ecda;
  border-bottom: 2px solid #222;
  cursor: pointer;
}

.category-right {
  display: flex;
  align-items: center;
}

.category-count {
  font-family: 'EB Garamond', serif;
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--parchment-white);
  padding: 2px 6px;
  border: 1px solid #222;
  color: #1a1a1a;
}

.category-icon {
  color: #1a1a1a;
  font-size: 1.1rem;
}

.expand-indicator {
  color: #1a1a1a;
  font-size: 0.7rem;
}

.category-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.9rem;
  margin: 0;
  text-transform: uppercase;
  margin-left: 10px;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.category-content {
  padding: 4px;
}

.feed-item {
  padding: 10px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  cursor: pointer;
}

.feed-item.selected {
  background: #f4ecda;
  border: 1px solid #222;
  box-shadow: 1px 1px 0 #222;
}

.feed-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--parchment-white);
  margin-top: 2px;
}

.custom-checkbox.checked {
  background: #1a1a1a;
}

.checkmark {
  color: #fdfbf3;
  font-size: 0.8rem;
}

.feed-name {
  font-family: 'Old Standard TT', serif;
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0;
  color: #1a1a1a;
}

.feed-description {
  font-family: 'EB Garamond', serif;
  font-size: 0.8rem;
  color: #666;
  margin: 2px 0 0 0;
  line-height: 1.3;
}

.vintage-searchbar {
  --background: var(--parchment-white);
  --color: #1a1a1a !important;
  --placeholder-color: #666;
  --icon-color: #1a1a1a !important;
  --clear-button-color: #1a1a1a !important;
  --border-radius: 0;
  border: 3px solid #222;
  box-shadow: 4px 4px 0 #222;
  margin-bottom: 15px;
}

.onboarding-footer {
  padding-top: 15px;
}

.selection-count {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 12px;
  color: #1a1a1a;
  letter-spacing: 1px;
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.mb-20 { margin-bottom: 20px; }
</style>
