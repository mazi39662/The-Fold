<template>
  <ion-page class="newspaper-page">
    <!-- Mini-header that appears on scroll -->
    <ion-header :translucent="true" class="header-fade" :class="{ 'header-visible': showAppTitle }">
      <ion-toolbar class="sticky-toolbar">
        <ion-title class="mini-title">{{ currentSource }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="newspaper-content" :scroll-events="true" @ionScroll="handleScroll">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          :pulling-icon="chevronDownCircleOutline"
          pulling-text="Pull to retrieve latest dispatches..."
          refreshing-spinner="lines-sharp"
          refreshing-text="Fetching news from the wire..."
        ></ion-refresher-content>
      </ion-refresher>

      <div class="paper-overlay"></div>

      <!-- Main Masthead (Scrolls away) -->
      <div class="masthead">
        <div class="masthead-top">
          <span class="masthead-date">{{ currentFormattedDate }}</span>
          <span class="masthead-edition">DAILY EDITION</span>
          <span class="masthead-price">VOL. {{ currentVolume }}</span>
        </div>
        <h1 class="newspaper-title">The Fold</h1>
        <div class="masthead-bottom">
          <div class="weather">{{ currentWeather }}</div>
          <div class="motto">"All the News That's Fit to Feed"</div>
          <div class="location">{{ currentLocation }}</div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container parchment">
        <ion-spinner name="lines-sharp"></ion-spinner>
        <p class="old-font">Retrieving Dispatches...</p>
      </div>

      <div v-else-if="error" class="error-container parchment">
        <p class="old-font">{{ error }}</p>
        <ion-button fill="clear" @click="fetchNews" class="vintage-button">RETRY DISPATCH</ion-button>
      </div>

      <!-- Empty State -->
      <div v-else-if="newsItems.length === 0" class="empty-state-container parchment">
        <ion-icon :icon="newspaperOutline" class="empty-icon"></ion-icon>
        <h2 class="old-font">Your Wire is Quiet</h2>
        <p class="empty-description">You haven't selected any news sources yet, or your selected wires have no current dispatches for the moment.</p>
        <ion-button @click="goToSources" class="vintage-button">
          CONFIGURE SOURCES
          <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- News Layout -->
      <div v-else class="newspaper-layout">
        <div 
          v-for="(item, index) in displayedNewsItems" 
          :key="index" 
          :class="['news-article', index === 0 ? 'headline-article' : 'standard-article']"
          ref="articleRefs"
        >
          <div class="article-inner">
            <!-- Sticky Article Information -->
            <div class="article-header-sticky">
              <h2 class="article-title">{{ item.title }}</h2>
              
              <div class="article-meta">
                <span class="byline" v-if="item.creator">By {{ item.creator }}</span>
                <span class="dateline">{{ formatDate(item.pubDate) }}</span>
              </div>

              <!-- Action Buttons for articles WITHOUT images -->
              <div class="article-actions no-image-actions" v-if="!item.image" @click.stop>
                <ion-button 
                  fill="clear" 
                  size="small"
                  :class="{ 'active': isLiked(item.link) }"
                  @click="toggleLike(item)"
                >
                  <ion-icon slot="icon-only" :icon="isLiked(item.link) ? heart : heartOutline"></ion-icon>
                </ion-button>
                <ion-button 
                  fill="clear" 
                  size="small"
                  :class="{ 'active': isSaved(item.link) }"
                  @click="toggleSave(item)"
                >
                  <ion-icon slot="icon-only" :icon="isSaved(item.link) ? bookmark : bookmarkOutline"></ion-icon>
                </ion-button>
                <ion-button 
                  fill="clear" 
                  size="small"
                  @click="shareArticle(item)"
                >
                  <ion-icon slot="icon-only" :icon="shareSocialOutline"></ion-icon>
                </ion-button>
              </div>

              <!-- Image inside sticky header as requested -->
              <div class="article-image-container" v-if="item.image">
                <img 
                  :src="item.image" 
                  :alt="item.title" 
                  class="vintage-image" 
                  @click.stop="openImageFullscreen(item.image)"
                />
                
                <!-- Action Buttons -->
                <div class="article-actions" @click.stop>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    :class="{ 'active': isLiked(item.link) }"
                    @click="toggleLike(item)"
                  >
                    <ion-icon slot="icon-only" :icon="isLiked(item.link) ? heart : heartOutline"></ion-icon>
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    :class="{ 'active': isSaved(item.link) }"
                    @click="toggleSave(item)"
                  >
                    <ion-icon slot="icon-only" :icon="isSaved(item.link) ? bookmark : bookmarkOutline"></ion-icon>
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    @click="shareArticle(item)"
                  >
                    <ion-icon slot="icon-only" :icon="shareSocialOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>

            </div>
            
            <div class="article-body">
              <p class="article-lead">
                {{ item.description }}
              </p>
              
              <!-- Read More Button -->
              <button class="read-more-btn" @click="openArticle(item.link)">
                Read Full Article →
              </button>
            </div>
            <div class="article-separator"></div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="loadingMore" class="loading-more">
          <ion-spinner name="lines-sharp"></ion-spinner>
          <p class="old-font">Loading more dispatches...</p>
        </div>
      </div>
    </ion-content>
    
    <!-- Fullscreen Image Modal -->
    <div v-if="fullscreenImage" class="fullscreen-modal" @click="closeFullscreen">
      <!-- Fixed Close Button -->
      <div class="vintage-close-wrapper" @click.stop="closeFullscreen">
        <button class="vintage-close-btn" aria-label="Close Image">
          <ion-icon :icon="close"></ion-icon>
        </button>
      </div>
      
      <div class="fullscreen-content" @click.stop>
        <img :src="fullscreenImage" alt="Fullscreen" class="fullscreen-img" />
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar,
  IonTitle,
  IonContent, 
  IonSpinner,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  toastController
} from '@ionic/vue';
import { 
  heart, 
  heartOutline, 
  bookmark, 
  bookmarkOutline, 
  shareSocialOutline, 
  newspaperOutline, 
  arrowForwardOutline,
  chevronDownCircleOutline,
  close
} from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image: string;
  creator: string;
  category: string;
  source: string;
}

// Reactive State
const newsItems = ref<NewsItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showAppTitle = ref(false);
const articleRefs = ref<HTMLElement[]>([]);
const likedArticles = ref<string[]>([]);
const savedArticles = ref<string[]>([]);
const currentSource = ref('News Feed');
const currentPage = ref(1);
const itemsPerPage = 20;
const loadingMore = ref(false);
const fullscreenImage = ref<string | null>(null);
const currentLocation = ref('MANILA, PHILIPPINES');
const currentWeather = ref('FAIR & SUNNY');

const router = useRouter();

// Computed property for lazy loading
const displayedNewsItems = computed(() => {
  return newsItems.value.slice(0, currentPage.value * itemsPerPage);
});

// Computed
const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();
});

const currentVolume = computed(() => {
  // Foundation set to 1849 (2026 - 1849 + 1 = 178)
  const currentYear = new Date().getFullYear();
  const volumeNumber = currentYear - 1849 + 1;
  return romanize(volumeNumber);
});

function romanize(num: number) {
  const lookup: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

const updateWeatherAndLocation = async () => {
  try {
    // 1. Get Location & Coordinates
    const locResponse = await fetch('https://ipapi.co/json/');
    if (!locResponse.ok) throw new Error('LOCATION SIGNAL LOST');
    const locData = await locResponse.json();
    
    if (locData.city && locData.country_name) {
      currentLocation.value = `${locData.city.toUpperCase()}, ${locData.country_name.toUpperCase()}`;
    }

    // 2. Get Real Weather using coordinates
    if (locData.latitude && locData.longitude) {
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&current=weather_code`);
      const weatherData = await weatherResponse.json();
      const code = weatherData.current.weather_code;

      // 3. Map to Vintage Newspaper Terms
      const weatherMap: Record<number, string> = {
        0: 'FAIR & CLOUDLESS',
        1: 'FAIR & SUNNY',
        2: 'PARTLY CLOUDY',
        3: 'OVERCAST SKIES',
        45: 'MISTY MORNING',
        48: 'FOGGY CONDITIONS',
        51: 'LIGHT DRIZZLE',
        61: 'STEADY RAIN',
        80: 'HEAVY SHOWERS',
        95: 'STORMY WINDS'
      };

      // Find best match or default
      currentWeather.value = weatherMap[code] || (code > 60 ? 'RAINING HEAVILY' : 'FAIR & SUNNY');
    }
  } catch (e) {
    console.error('Weather/Location wire failure. Defaulting to heritage data.');
    // Keep internal fallbacks if API fails
  }
};

// Methods
const handleScroll = (event: any) => {
  const scrollTop = event.detail.scrollTop;
  showAppTitle.value = scrollTop > 150;

  // Header height when visible
  const headerHeight = showAppTitle.value ? 56 : 0;

  // Lazy loading - load more when near bottom
  const scrollElement = event.target;
  const scrollHeight = scrollElement.scrollHeight;
  const clientHeight = scrollElement.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight * 0.8 && !loadingMore.value) {
    if (displayedNewsItems.value.length < newsItems.value.length) {
      loadingMore.value = true;
      setTimeout(() => {
        currentPage.value++;
        loadingMore.value = false;
      }, 500);
    }
  }

  // Calculate shrinking for each article and track visible source
  let topMostSource = '';
  let minDiff = Infinity;

  articleRefs.value.forEach((el, idx) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const stickyHeader = el.querySelector('.article-header-sticky') as HTMLElement;
    if (!stickyHeader) return;

    // Track the source of the article closest to the top of the viewport
    // but below the mini-header
    const topOffset = rect.top - headerHeight;
    if (topOffset >= -200 && topOffset < minDiff) {
      minDiff = topOffset;
      const article = displayedNewsItems.value[idx];
      if (article) {
        topMostSource = article.source;
      }
    }

    // Adjust sticky header top position based on main header visibility
    stickyHeader.style.top = `${headerHeight}px`;

    // Trigger shrink when heading towards the top, starting from mid-screen
    const triggerStart = window.innerHeight * 0.6; // Start shrinking at 60% scroll down
    const triggerEnd = headerHeight + 56; // Account for main header + some space
    
    // progress 0 (full) to 1 (minimized)
    const progress = Math.min(Math.max((triggerStart - rect.top) / (triggerStart - triggerEnd), 0), 1);
    stickyHeader.style.setProperty('--shrink-ratio', progress.toString());
  });

  if (topMostSource && topMostSource !== currentSource.value) {
    currentSource.value = topMostSource;
  }
};

// Helper to extract source name from URL
const getSourceName = (url: string): string => {
  const sourceMap: Record<string, string> = {
    'manilatimes.net': 'The Manila Times',
    'philstar.com': 'Philstar',
    'gmanetwork.com': 'GMA News',
    'abs-cbn.com': 'ABS-CBN News',
    'rappler.com': 'Rappler',
    'inquirer.net': 'Inquirer',
    'mb.com.ph': 'Manila Bulletin',
    'bbci.co.uk': 'BBC News',
    'reuters': 'Reuters',
    'aljazeera.com': 'Al Jazeera',
    'theguardian.com': 'The Guardian',
    'techcrunch.com': 'TechCrunch',
    'theverge.com': 'The Verge',
    'arstechnica.com': 'Ars Technica',
    'wired.com': 'Wired',
    'ft.com': 'Financial Times',
    'bloomberg.com': 'Bloomberg',
    'forbes.com': 'Forbes',
    'scientificamerican.com': 'Scientific American',
    'nature.com': 'Nature',
    'who.int': 'WHO',
    'variety.com': 'Variety',
    'hollywoodreporter.com': 'The Hollywood Reporter',
    'npr.org': 'NPR'
  };
  
  for (const [key, value] of Object.entries(sourceMap)) {
    if (url.includes(key)) {
      return value;
    }
  }
  return 'News Feed';
};

// Professional Caching System
const CACHE_KEY = 'news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB max cache size

interface CacheEntry {
  data: NewsItem[];
  timestamp: number;
  feedUrls: string[];
}

const getCacheKey = (feedUrls: string[]): string => {
  return feedUrls.sort().join('|');
};

const getCache = (feedUrls: string[]): NewsItem[] | null => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return null;
    
    const cache: Record<string, CacheEntry> = JSON.parse(cacheData);
    const key = getCacheKey(feedUrls);
    const entry = cache[key];
    
    if (!entry) return null;
    
    // Check if cache is still valid (TTL)
    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL) {
      // Cache expired, remove it
      delete cache[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return entry.data;
  } catch (e) {
    console.error('Cache read error:', e);
    return null;
  }
};

const setCache = (feedUrls: string[], data: NewsItem[]) => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    const cache: Record<string, CacheEntry> = cacheData ? JSON.parse(cacheData) : {};
    const key = getCacheKey(feedUrls);
    
    // Add new cache entry
    cache[key] = {
      data,
      timestamp: Date.now(),
      feedUrls
    };
    
    // Clean up old entries and manage size
    const cacheString = JSON.stringify(cache);
    const cacheSize = new Blob([cacheString]).size;
    
    if (cacheSize > MAX_CACHE_SIZE) {
      // Remove oldest entries until size is acceptable
      const entries = Object.entries(cache).sort((a, b) => a[1].timestamp - b[1].timestamp);
      while (new Blob([JSON.stringify(cache)]).size > MAX_CACHE_SIZE && entries.length > 1) {
        const [oldestKey] = entries.shift()!;
        delete cache[oldestKey];
      }
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Cache write error:', e);
    // If cache is full, clear it
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (clearError) {
      console.error('Cache clear error:', clearError);
    }
  }
};

const clearExpiredCache = () => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return;
    
    const cache: Record<string, CacheEntry> = JSON.parse(cacheData);
    const now = Date.now();
    let hasChanges = false;
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_TTL) {
        delete cache[key];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    console.error('Cache cleanup error:', e);
  }
};

const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Get selected feeds from localStorage
    const STORAGE_KEY = 'selected_rss_feeds';
    const savedFeeds = localStorage.getItem(STORAGE_KEY);
    const feedUrls = savedFeeds 
      ? JSON.parse(savedFeeds) 
      : ['https://www.manilatimes.net/news/feed/']; // Default feed
    
    // Try to get from cache first
    const cachedData = getCache(feedUrls);
    if (cachedData && cachedData.length > 0) {
      newsItems.value = cachedData;
      loading.value = false;
      
      // Update current source
      if (cachedData.length > 0) {
        const sources = cachedData.map(a => a.source);
        const uniqueSources = [...new Set(sources)];
        currentSource.value = uniqueSources.length === 1 ? uniqueSources[0] : 'Mixed Sources';
      }
      
      // Fetch fresh data in background
      fetchFreshNews(feedUrls);
      return;
    }
    
    // Fetch all selected feeds in parallel
    const fetchPromises = feedUrls.map(async (url: string) => {
      try {
        // Use CORS proxy for feeds that block direct access
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('COMMUNICATION FAILURE');
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const items = xmlDoc.querySelectorAll('item');
        const sourceName = getSourceName(url);
        return Array.from(items).map(item => {
          return {
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            description: cleanDescription(item.querySelector('description')?.textContent || ''),
            pubDate: item.querySelector('pubDate')?.textContent || '',
            creator: item.getElementsByTagName('dc:creator')[0]?.textContent || item.querySelector('author')?.textContent || '',
            category: item.querySelector('category')?.textContent || '',
            image: extractImage(item),
            source: sourceName
          };
        });
      } catch (err) {
        console.error(`Error fetching feed ${url}:`, err);
        return []; // Return empty array if a feed fails
      }
    });
    
    // Wait for all feeds to complete
    const allFeedResults = await Promise.all(fetchPromises);
    
    // Flatten and merge all articles
    const allArticles = allFeedResults.flat();
    
    // Sort by publication date (newest first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });
    
    newsItems.value = allArticles;
    
    // Save to cache
    setCache(feedUrls, allArticles);
    
    // Update current source based on articles
    if (allArticles.length > 0) {
      const sources = allArticles.map(a => a.source);
      const uniqueSources = [...new Set(sources)];
      currentSource.value = uniqueSources.length === 1 ? uniqueSources[0] : 'Mixed Sources';
    }
  } catch (err: any) {
    console.error('Error fetching news:', err);
    error.value = 'THE TELEGRAPH LINES ARE DOWN. PLEASE RETRY LATER.';
  } finally {
    loading.value = false;
  }
};

// Background fetch for fresh data (doesn't show loading)
const fetchFreshNews = async (feedUrls: string[]) => {
  try {
    const fetchPromises = feedUrls.map(async (url: string) => {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('COMMUNICATION FAILURE');
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const items = xmlDoc.querySelectorAll('item');
        const sourceName = getSourceName(url);
        return Array.from(items).map(item => {
          return {
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            description: cleanDescription(item.querySelector('description')?.textContent || ''),
            pubDate: item.querySelector('pubDate')?.textContent || '',
            creator: item.getElementsByTagName('dc:creator')[0]?.textContent || item.querySelector('author')?.textContent || '',
            category: item.querySelector('category')?.textContent || '',
            image: extractImage(item),
            source: sourceName
          };
        });
      } catch (err) {
        console.error(`Error fetching feed ${url}:`, err);
        return [];
      }
    });
    
    const allFeedResults = await Promise.all(fetchPromises);
    const allArticles = allFeedResults.flat();
    
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });
    
    // Update with fresh data
    newsItems.value = allArticles;
    setCache(feedUrls, allArticles);
    
    if (allArticles.length > 0) {
      const sources = allArticles.map(a => a.source);
      const uniqueSources = [...new Set(sources)];
      currentSource.value = uniqueSources.length === 1 ? uniqueSources[0] : 'Mixed Sources';
    }
  } catch (err) {
    console.error('Background fetch error:', err);
  }
};

const cleanDescription = (desc: string) => {
  let cleaned = desc.replace(/<[^>]*>?/gm, '').trim();
  // Aggressive cleanup of redundant datelines
  const prefixes = [
    /^MANILA, Philippines &mdash; /i,
    /^MANILA, Philippines — /i,
    /^MANILA, Philippines \/ /i,
    /^MANILA, Philippines: /i,
    /^MANILA — /i,
    /^MANILA \/ /i,
    /^CEBU CITY — /i,
    /^QUEZON CITY — /i,
    /^\(UPDATE\)/i,
    /^\(ADDED PHOTO\)/i
  ];
  prefixes.forEach(p => cleaned = cleaned.replace(p, ''));
  return cleaned;
};

const extractImage = (item: Element): string => {
  // 1. Check known media tags
  const mediaContent = item.getElementsByTagName('media:content')[0];
  const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0];
  const enclosure = item.querySelector('enclosure');
  const thumbImage = item.getElementsByTagName('thumbimage')[0];

  // Try attributes first
  let url = mediaContent?.getAttribute('url') || 
            mediaThumbnail?.getAttribute('url') || 
            enclosure?.getAttribute('url');

  // 2. Try text content if attributes fail (common for ABS-CBN and others)
  if (!url) {
    url = mediaContent?.textContent || 
          mediaThumbnail?.textContent || 
          thumbImage?.textContent;
  }

  // 3. Fallback: Search all tags for something that looks like an image URL
  if (!url || !url.trim()) {
    const allTags = item.querySelectorAll('*');
    for (const tag of Array.from(allTags)) {
      const content = tag.textContent?.trim();
      if (content && (content.endsWith('.jpg') || content.endsWith('.jpeg') || content.endsWith('.png') || content.includes('.jpg?') || content.includes('.jpeg?'))) {
        url = content;
        break;
      }
    }
  }

  // 4. Final Fallback: Check description for <img> tag
  if (!url || !url.trim()) {
    const description = item.querySelector('description')?.textContent || '';
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
    if (imgMatch) url = imgMatch[1];
  }

  return url?.trim() || '';
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date).toUpperCase();
  } catch (e) {
    return dateStr;
  }
};

const openArticle = (link: string) => {
  window.open(link, '_blank');
};

const goToSources = () => {
  router.push('/tabs/tab4');
};

const openImageFullscreen = (imageUrl: string) => {
  fullscreenImage.value = imageUrl;
};

const closeFullscreen = () => {
  fullscreenImage.value = null;
};

const handleRefresh = async (event: any) => {
  currentPage.value = 1; // Reset to first page
  await fetchNews();
  event.target.complete();
};

// Like/Save/Share Functions
const LIKED_KEY = 'liked_articles';
const SAVED_KEY = 'saved_articles';

const loadLikedAndSaved = () => {
  const liked = localStorage.getItem(LIKED_KEY);
  const saved = localStorage.getItem(SAVED_KEY);
  
  if (liked) likedArticles.value = JSON.parse(liked);
  if (saved) savedArticles.value = JSON.parse(saved);
};

const isLiked = (link: string) => {
  return likedArticles.value.includes(link);
};

const isSaved = (link: string) => {
  return savedArticles.value.includes(link);
};

const toggleLike = async (item: NewsItem) => {
  const index = likedArticles.value.indexOf(item.link);
  if (index > -1) {
    likedArticles.value.splice(index, 1);
  } else {
    likedArticles.value.push(item.link);
    // Also save the full article data
    const likedData = localStorage.getItem('liked_articles_data') || '[]';
    const articles = JSON.parse(likedData);
    articles.push(item);
    localStorage.setItem('liked_articles_data', JSON.stringify(articles));
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify(likedArticles.value));
  
  const toast = await toastController.create({
    message: index > -1 ? 'Removed from liked' : 'Added to liked!',
    duration: 1500,
    position: 'bottom'
  });
  await toast.present();
};

const toggleSave = async (item: NewsItem) => {
  const index = savedArticles.value.indexOf(item.link);
  if (index > -1) {
    savedArticles.value.splice(index, 1);
  } else {
    savedArticles.value.push(item.link);
    // Also save the full article data
    const savedData = localStorage.getItem('saved_articles_data') || '[]';
    const articles = JSON.parse(savedData);
    articles.push(item);
    localStorage.setItem('saved_articles_data', JSON.stringify(articles));
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(savedArticles.value));
  
  const toast = await toastController.create({
    message: index > -1 ? 'Removed from saved' : 'Saved for later!',
    duration: 1500,
    position: 'bottom'
  });
  await toast.present();
};

const shareArticle = async (item: NewsItem) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: item.title,
        text: item.description,
        url: item.link
      });
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(item.link);
    const toast = await toastController.create({
      message: 'Link copied to clipboard!',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
};

onMounted(() => {
  // Clean up expired cache entries
  clearExpiredCache();
  
  // SANITIZATION: Remove non-functional feeds from legacy selections
  const saved = localStorage.getItem('selected_rss_feeds');
  if (saved) {
    let feeds = JSON.parse(saved);
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
      localStorage.setItem('selected_rss_feeds', JSON.stringify([...new Set(feeds)]));
    }
  }

  loadLikedAndSaved();
  fetchNews();
  updateWeatherAndLocation();
  
  // Listen for RSS feed updates from settings page
  window.addEventListener('rss-feeds-updated', () => {
    fetchNews();
  });
});
</script>

<style scoped>
/* NEWSPAPER DESIGN SYSTEM */

.newspaper-page {
  --background: #f4ecd8;
}

.newspaper-content {
  --background: transparent;
  background-color: #f4ecd8;
  position: relative;
}

.header-fade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease, position 0s 0.3s;
  pointer-events: none;
  z-index: 100;
}

.header-visible {
  position: fixed;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition: opacity 0.3s ease, transform 0.3s ease, position 0s 0s;
}

.sticky-toolbar {
  --background: #f4ecda;
  --border-bottom: 2px solid #222;
  --color: #000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.mini-title {
  font-family: 'UnifrakturMaguntia', cursive;
  font-size: 1.5rem;
  text-align: center;
}

.masthead {
  padding: 20px 15px 10px;
  text-align: center;
  color: #1a1a1a;
  background: #f4ecd8;
  border-bottom: 5px double #222;
  margin-bottom: 20px;
}

.masthead-top {
  display: flex;
  justify-content: space-between;
  font-family: 'Old Standard TT', serif;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid #222;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.newspaper-title {
  font-family: 'UnifrakturMaguntia', cursive;
  font-size: 3.5rem;
  margin: 0;
  line-height: 1;
  letter-spacing: -1px;
}

.masthead-bottom {
  display: flex;
  justify-content: space-between;
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 700;
  border-top: 1px solid #222;
  padding-top: 5px;
  margin-top: 5px;
}

.motto {
  font-style: italic;
}

:root {
  --mini-header-height: 56px;
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
  z-index: 99;
}

.newspaper-layout {
  padding: 0 15px 20px;
  max-width: 900px;
  margin: 0 auto;
}

.news-article {
  margin-bottom: 40px;
  cursor: pointer;
}

.article-header-sticky {
  --shrink-ratio: 0;
  position: sticky;
  top: 0;
  background: #f4ecda;
  z-index: 10;
  padding: 10px 0;
  border-bottom: 1px solid #222;
  overflow: hidden;
  transition: padding 0.1s linear, top 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0 0 5px 0;
  line-height: 1.1;
  text-transform: uppercase;
  /* Shrink font size */
  font-size: calc(1.8rem - (0.8rem * var(--shrink-ratio)));
  transition: font-size 0.1s linear;
}

.headline-article .article-title {
  font-size: 1.8rem;
  text-align: center;
}

.article-meta {
  font-family: 'Old Standard TT', serif;
  font-size: calc(0.85rem - (0.2rem * var(--shrink-ratio)));
  border-top: 2px solid #222;
  border-bottom: 2px solid #222;
  padding: calc(6px - (4px * var(--shrink-ratio))) 0;
  margin-bottom: calc(15px - (10px * var(--shrink-ratio)));
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 1px;
  /* Keep author and date visible during scroll */
}

.byline {
  font-weight: 900;
  color: #000;
}

.dateline {
  font-weight: 700;
  color: #444;
}

.article-image-container {
  margin-bottom: calc(15px - (10px * var(--shrink-ratio)));
  border: 1px solid #222;
  padding: 2px;
  background: white;
  /* Reduced shrinking effect on width */
  max-width: calc(100% - (var(--shrink-ratio) * 30%));
  align-self: center;
}

.vintage-image {
  width: 100%;
  aspect-ratio: 16/9;
  /* Ensure image remains visible and respectable size even at full shrink */
  min-height: 120px;
  max-height: calc(400px * (1 - (var(--shrink-ratio) * 0.5)));
  object-fit: cover;
  filter: sepia(0.6) contrast(1.1) grayscale(0.5);
  display: block;
}

.image-caption {
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  padding: 8px 5px;
  background: #f4ecda;
  border-top: 1px solid #222;
  margin-top: 4px;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.article-body {
  font-family: 'EB Garamond', serif;
  font-size: 1.2rem;
  line-height: 1.5;
  color: #222;
  text-align: justify;
  padding-top: 15px;
}

.article-lead::first-letter {
  float: left;
  font-size: 4rem;
  line-height: 0.8;
  padding-top: 4px;
  padding-right: 8px;
  padding-left: 3px;
  font-family: 'Playfair Display', serif;
  font-weight: 900;
}

.article-separator {
  margin-top: 30px;
  height: 6px;
  border-top: 1px solid #222;
  border-bottom: 1px solid #222;
}

.loading-container, .error-container, .empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 5rem;
  color: #1a1a1a;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-description {
  font-family: 'EB Garamond', serif;
  font-size: 1.25rem;
  color: #444;
  max-width: 500px;
  margin: 15px auto 25px;
  line-height: 1.5;
  font-style: italic;
}

.old-font {
  font-family: 'Old Standard TT', serif;
  font-weight: 700;
  font-size: 1.2rem;
  margin-top: 15px;
  text-transform: uppercase;
  color: #1a1a1a;
}

.vintage-button {
  --background: #1a1a1a;
  --color: #f4ecda;
  --border-radius: 0;
  --border-style: solid;
  --border-width: 2px;
  --border-color: #000;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 20px;
  height: 50px;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s ease;
}

.vintage-button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}

/* Multi-column layout for larger screens */
@media (min-width: 768px) {
  .newspaper-layout {
    columns: 2;
    column-gap: 40px;
  }
  
  .headline-article {
    column-span: all;
  }
  
  .news-article {
    break-inside: avoid;
  }
}

/* Pull-to-refresh styling */
ion-refresher {
  z-index: 1;
}

.article-actions {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #ddd;
}

.no-image-actions {
  border-top: none;
  padding-top: 5px;
  margin-bottom: 5px;
}

.article-actions ion-button {
  --color: #444;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
}

.article-actions ion-button.active {
  --color: #1a1a1a;
}

.article-actions ion-icon {
  font-size: 1.3rem;
}

/* Loading More Indicator */
.loading-more {
  text-align: center;
  padding: 30px 20px;
}

.loading-more .old-font {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #444;
}

/* Read More Button */
.read-more-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #1a1a1a;
  color: #f4ecd8;
  border: 2px solid #222;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 2px 2px 0 #222;
  width: 100%;
}

.read-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 0 #222;
  background: #000;
}

.read-more-btn:active {
  transform: translateY(0);
  box-shadow: 1px 1px 0 #222;
}

/* Clickable Image Cursor */
.vintage-image {
  cursor: pointer;
}

/* Fullscreen Image Modal */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.fullscreen-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-img {
  max-width: 100%;
  max-height: 95vh;
  object-fit: contain;
  filter: none;
}

.vintage-close-wrapper {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 20px);
  right: 20px;
  z-index: 10005;
  cursor: pointer;
}

.vintage-close-btn {
  background: #fdfbf3; /* Parchment Theme */
  border: 3px solid #1a1a1a; /* Ink Theme */
  width: 54px;
  height: 54px;
  border-radius: 0; /* Square for newspaper feel */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 6px 6px 0 #1a1a1a;
  transition: all 0.2s ease;
  padding: 0;
}

.vintage-close-btn ion-icon {
  color: #1a1a1a;
  font-size: 2.2rem;
  --ionicon-stroke-width: 48px;
}

.vintage-close-wrapper:hover .vintage-close-btn {
  transform: translate(-2px, -2px);
  background: #f4ecda;
  box-shadow: 8px 8px 0 #1a1a1a;
}

.vintage-close-wrapper:active .vintage-close-btn {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1a1a1a;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
