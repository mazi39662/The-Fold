<template>
  <ion-page class="newspaper-page">
    <ion-header :translucent="true">
      <ion-toolbar class="vintage-toolbar">
        <ion-title class="vintage-title">NEWS SOURCES</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="newspaper-content">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          :pulling-icon="chevronDownCircleOutline"
          pulling-text="Pull to refresh sources list..."
          refreshing-spinner="lines-sharp"
          refreshing-text="Updating wires..."
        ></ion-refresher-content>
      </ion-refresher>

      <div class="paper-overlay"></div>

      <div class="sources-container">
        <!-- Search Bar -->
        <div class="search-section">
          <ion-searchbar 
            v-model="searchQuery"
            placeholder="Search news sources..."
            class="vintage-searchbar"
            mode="md"
            animated
          ></ion-searchbar>
        </div>

        <!-- No Results Message -->
        <div v-if="filteredCategories.length === 0" class="no-results">
          <ion-icon :icon="newspaperOutline" class="no-results-icon"></ion-icon>
          <p class="old-font">No news sources match your search.</p>
          <button class="quick-btn" @click="searchQuery = ''">Clear Search</button>
        </div>

        <!-- Instruction and Quick Actions -->
        <div class="top-info">
          <p class="instruction-text">Tap any source below to add or remove it from your personal news feed.</p>
          
          <div class="quick-actions">
            <button class="quick-btn" @click="selectAll">Select All</button>
            <button class="quick-btn" @click="clearAll">Clear All</button>
            <button class="quick-btn secondary" @click="resetToDefaults">Reset</button>
          </div>
        </div>

        <!-- Feed Categories -->
        <div class="categories-section">
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
                <span class="category-selected">{{ getSelectedCount(category) }}/{{ category.feeds.length }}</span>
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
                  <div class="feed-checkbox">
                    <div class="custom-checkbox" :class="{ 'checked': selectedFeeds.includes(feed.url) }">
                      <span v-if="selectedFeeds.includes(feed.url)" class="checkmark">✓</span>
                    </div>
                  </div>
                  <div class="feed-details">
                    <h3 class="feed-name">{{ feed.name }}</h3>
                    <p class="feed-description">{{ feed.description }}</p>
                  </div>
                </div>
              </div>
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
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonIcon,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue';
import { 
  newspaperOutline, 
  globeOutline, 
  hardwareChipOutline, 
  cashOutline, 
  flaskOutline, 
  filmOutline,
  chevronDownCircleOutline 
} from 'ionicons/icons';
import { ref, computed, onMounted, watch } from 'vue';

interface RSSFeed {
  name: string;
  url: string;
  description: string;
}

interface FeedCategory {
  name: string;
  feeds: RSSFeed[];
}

const searchQuery = ref('');
const selectedFeeds = ref<string[]>([]);
const expandedCategories = ref<string[]>(['Philippines News']);

const feedCategories = ref<FeedCategory[]>([
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

const totalFeeds = computed(() => {
  return feedCategories.value.reduce((sum, cat) => sum + cat.feeds.length, 0);
});

const filteredCategories = computed(() => {
  if (!searchQuery.value) return feedCategories.value;
  
  const query = searchQuery.value.toLowerCase();
  return feedCategories.value
    .map(category => ({
      ...category,
      feeds: category.feeds.filter(feed => 
        feed.name.toLowerCase().includes(query) ||
        feed.description.toLowerCase().includes(query)
      )
    }))
    .filter(category => category.feeds.length > 0);
});

const toggleCategory = (name: string) => {
  const idx = expandedCategories.value.indexOf(name);
  if (idx > -1) {
    expandedCategories.value = expandedCategories.value.filter(n => n !== name);
  } else {
    expandedCategories.value = [...expandedCategories.value, name];
  }
};

// Auto-expand search results
watch(searchQuery, (newVal) => {
  if (newVal) {
    const matchingNames = filteredCategories.value.map(c => c.name);
    expandedCategories.value = Array.from(new Set([...expandedCategories.value, ...matchingNames]));
  }
});

const toggleFeed = (url: string) => {
  const index = selectedFeeds.value.indexOf(url);
  if (index > -1) {
    selectedFeeds.value = selectedFeeds.value.filter(u => u !== url);
  } else {
    selectedFeeds.value = [...selectedFeeds.value, url];
  }
};

// Automatic Save Watcher
watch(selectedFeeds, (newVal) => {
  localStorage.setItem('selected_rss_feeds', JSON.stringify(newVal));
  window.dispatchEvent(new Event('rss-feeds-updated'));
}, { deep: true });



const selectAll = () => {
  const allUrls = feedCategories.value.flatMap(cat => cat.feeds.map(f => f.url));
  selectedFeeds.value = [...allUrls];
};

const clearAll = () => {
  selectedFeeds.value = [];
};

const getSelectedCount = (category: FeedCategory) => {
  return category.feeds.filter(feed => selectedFeeds.value.includes(feed.url)).length;
};

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, string> = {
    'Philippines News': newspaperOutline,
    'International News': globeOutline,
    'Technology': hardwareChipOutline,
    'Business & Finance': cashOutline,
    'Science & Health': flaskOutline,
    'Entertainment & Culture': filmOutline
  };
  return iconMap[categoryName] || newspaperOutline;
};

const resetToDefaults = async () => {
  selectedFeeds.value = ['https://www.manilatimes.net/news/feed/'];
  
  const toast = await toastController.create({
    message: 'Reset to default source',
    duration: 2000,
    position: 'bottom'
  });
  await toast.present();
};

const handleRefresh = (event: any) => {
  // Simulate a refresh delay
  setTimeout(() => {
    const saved = localStorage.getItem('selected_rss_feeds');
    if (saved) {
      selectedFeeds.value = JSON.parse(saved);
    }
    event.target.complete();
  }, 1000);
};

onMounted(() => {
  const saved = localStorage.getItem('selected_rss_feeds');
  if (saved) {
    let feeds = JSON.parse(saved);
    // SANITIZATION: Redirect faulty legacy feeds
    const faultyMap: Record<string, string> = {
      'https://onenews.ph/feed': 'https://www.rappler.com/feed',
      'http://www.mb.com.ph/rss/articles': 'https://mb.com.ph/feed/'
    };
    
    let changed = false;
    feeds = feeds.map((url: string) => {
      if (faultyMap[url]) {
        changed = true;
        return faultyMap[url];
      }
      return url;
    });

    if (changed) {
      const sanitized = [...new Set(feeds)] as string[];
      selectedFeeds.value = sanitized;
      localStorage.setItem('selected_rss_feeds', JSON.stringify(sanitized));
    } else {
      selectedFeeds.value = feeds;
    }
  } else {
    selectedFeeds.value = ['https://www.manilatimes.net/news/feed/'];
  }
});
</script>

<style scoped>
.newspaper-page {
  --background: #f4ecd8;
}

.newspaper-content {
  --background: transparent;
  background-color: #f4ecd8;
  position: relative;
}

.paper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/paper-texture.png');
  background-repeat: repeat;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.vintage-toolbar {
  --background: #f4ecda;
  --border-bottom: 3px double #222;
  --color: #000;
}

.vintage-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 3px;
  text-align: center;
}

.sources-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px 120px;
  position: relative;
  z-index: 1;
}

/* Instruction and Quick Actions */
.top-info {
  margin-bottom: 25px;
  text-align: center;
}

.instruction-text {
  font-family: 'Old Standard TT', serif;
  font-size: 1.1rem;
  color: #1a1a1a;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  line-height: 1.5;
  border-bottom: 2px solid #222;
  display: inline-block;
  padding-bottom: 5px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.quick-btn {
  background: #fff;
  border: 2px solid #222;
  padding: 10px 20px;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #222;
}

.quick-btn.secondary {
  background: #f4ecda;
  border-style: dashed;
  color: #1a1a1a;
}

.quick-btn:hover {
  background: #1a1a1a;
  color: #fff;
  border-style: solid;
}

.vintage-searchbar {
  --background: #fff;
  --color: #1a1a1a;
  --placeholder-color: #666;
  --icon-color: #1a1a1a;
  --clear-button-color: #1a1a1a;
  --border-radius: 0;
  padding: 0;
  margin-bottom: 25px;
  border: 3px solid #222;
  box-shadow: 4px 4px 0 #222;
}

.vintage-searchbar :deep(.searchbar-input-container) {
  background: #fff !important;
}

.vintage-searchbar :deep(.searchbar-input) {
  font-family: 'EB Garamond', serif !important;
  font-size: 1.1rem !important;
  box-shadow: none !important;
  padding-left: 50px !important;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border: 2px dashed #222;
  margin-bottom: 20px;
}

.no-results-icon {
  font-size: 3rem;
  color: #1a1a1a;
  opacity: 0.5;
  margin-bottom: 15px;
}

/* Categories */
.categories-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.category-block {
  background: #fff;
  border: 2px solid #222;
  box-shadow: 3px 3px 0 #222;
}

.category-header {
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 2px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f0f0f0;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  font-size: 1.2rem;
  color: #1a1a1a;
}

.category-title {
  font-family: 'Old Standard TT', serif;
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #1a1a1a;
}

.category-selected {
  font-family: 'EB Garamond', serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
  background: #eee;
  padding: 2px 8px;
  border: 1px solid #222;
}

.expand-indicator {
  font-size: 0.8rem;
  color: #1a1a1a;
  width: 20px;
  text-align: center;
}

.category-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Feed Items */
.feed-item {
  padding: 10px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.feed-item:hover {
  background: #f9f9f9;
}

.feed-item.selected {
  border: 1px solid #222;
  background: #f4ecda;
  box-shadow: 2px 2px 0 #222;
}

.feed-main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.feed-checkbox {
  flex-shrink: 0;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: background 0.2s;
}

.custom-checkbox.checked {
  background: #1a1a1a;
}

.checkmark {
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
}

.feed-details {
  flex: 1;
}

.feed-name {
  font-family: 'Old Standard TT', serif;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: #1a1a1a;
}

.feed-description {
  font-family: 'EB Garamond', serif;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
}

</style>
