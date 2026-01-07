<template>
  <ion-page class="newspaper-page">
    <ion-header :translucent="true" class="header-fade" :class="{ 'header-visible': showHeaderTitle }">
      <ion-toolbar class="sticky-toolbar">
        <ion-title class="mini-title">Collection</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="newspaper-content" :scroll-events="true" @ionScroll="handleScroll">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          :pulling-icon="chevronDownCircleOutline"
          pulling-text="Pull to update collection..."
          refreshing-spinner="lines-sharp"
          refreshing-text="Cataloging dispatches..."
        ></ion-refresher-content>
      </ion-refresher>

      <div class="paper-overlay"></div>
 
      <!-- Collection Masthead -->
      <div class="masthead">
        <div class="masthead-top">
          <span class="masthead-date">{{ currentFormattedDate }}</span>
          <span class="masthead-edition">PERSONAL ARCHIVES</span>
          <span class="masthead-price">VOL. I</span>
        </div>
        <h1 class="collection-title">My Collection</h1>
        <div class="masthead-bottom">
          <div class="motto">"Preserving the dispatches of the day"</div>
          <div class="article-count">{{ savedArticles.length + likedArticles.length }} ITEMS CATALOGED</div>
        </div>
      </div>

      <div class="collection-container">
        <!-- Segment to switch between Saved and Liked -->
        <ion-segment :value="activeSegment" @ionChange="segmentChanged($event)">
          <ion-segment-button value="saved">
            <ion-label>Saved</ion-label>
          </ion-segment-button>
          <ion-segment-button value="liked">
            <ion-label>Liked</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Saved Articles Section -->
        <div v-show="activeSegment === 'saved'">
          <div v-if="savedArticles.length === 0" class="empty-state">
            <h2 class="empty-title">No Saved Articles</h2>
            <p class="empty-text">Articles you save will appear here for easy access later.</p>
          </div>

          <div v-else class="newspaper-layout">
            <div 
              v-for="(item, index) in displayedSaved" 
              :key="'saved-' + index" 
              class="news-article"
            >
              <div class="article-inner" @click="openArticle(item.link)">
                <h2 class="article-title">{{ item.title }}</h2>
                
                <div class="article-meta">
                  <span class="byline" v-if="item.creator">By {{ item.creator }}</span>
                  <span class="dateline">{{ formatDate(item.pubDate) }}</span>
                </div>

                <div class="article-album-container" v-if="item.media && item.media.length > 0">
                  <div class="album-scroller" :class="{ 'single-item': item.media.length === 1 }">
                    <div 
                      v-for="(media, mIdx) in item.media" 
                      :key="mIdx" 
                      class="album-item"
                    >
                      <video 
                        v-if="media.type === 'video'"
                        class="vintage-video"
                        controls
                        playsinline
                        @click.stop
                      >
                        <source :src="media.url" />
                      </video>
                      <img v-else :src="media.url" :alt="item.title" class="vintage-image" loading="lazy" />
                    </div>
                  </div>
                  <div class="album-indicator" v-if="item.media.length > 1">
                    ARCHIVE: {{ item.media.length }}
                  </div>
                </div>

                <div class="article-body">
                  <p class="article-lead">{{ item.description }}</p>
                </div>

                <button class="remove-btn" @click.stop="removeArticle(item.link, 'saved')">
                  Remove from Saved
                </button>
              </div>
            </div>
            
            <!-- Loading indicator -->
            <div v-if="loadingSaved" class="loading-more">
              <ion-spinner name="lines-sharp"></ion-spinner>
            </div>
          </div>
        </div>

        <!-- Liked Articles Section -->
        <div v-show="activeSegment === 'liked'">
          <div v-if="likedArticles.length === 0" class="empty-state">
            <h2 class="empty-title">No Liked Articles</h2>
            <p class="empty-text">Articles you like will appear here so you can revisit your favorites.</p>
          </div>

          <div v-else class="newspaper-layout">
            <div 
              v-for="(item, index) in displayedLiked" 
              :key="'liked-' + index" 
              class="news-article"
            >
              <div class="article-inner" @click="openArticle(item.link)">
                <h2 class="article-title">{{ item.title }}</h2>
                
                <div class="article-meta">
                  <span class="byline" v-if="item.creator">By {{ item.creator }}</span>
                  <span class="dateline">{{ formatDate(item.pubDate) }}</span>
                </div>

                <div class="article-album-container" v-if="item.media && item.media.length > 0">
                  <div class="album-scroller" :class="{ 'single-item': item.media.length === 1 }">
                    <div 
                      v-for="(media, mIdx) in item.media" 
                      :key="mIdx" 
                      class="album-item"
                    >
                      <video 
                        v-if="media.type === 'video'"
                        class="vintage-video"
                        controls
                        playsinline
                        @click.stop
                      >
                        <source :src="media.url" />
                      </video>
                      <img v-else :src="media.url" :alt="item.title" class="vintage-image" loading="lazy" />
                    </div>
                  </div>
                  <div class="album-indicator" v-if="item.media.length > 1">
                    ARCHIVE: {{ item.media.length }}
                  </div>
                </div>

                <div class="article-body">
                  <p class="article-lead">{{ item.description }}</p>
                </div>

                <button class="remove-btn" @click.stop="removeArticle(item.link, 'liked')">
                  Remove from Liked
                </button>
              </div>
            </div>
            
            <!-- Loading indicator -->
            <div v-if="loadingLiked" class="loading-more">
              <ion-spinner name="lines-sharp"></ion-spinner>
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
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonSpinner, 
  IonIcon,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';

interface NewsMedia {
  type: 'image' | 'video';
  url: string;
}

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  media: NewsMedia[];
  creator: string;
  category: string;
  source: string;
}

const savedArticles = ref<NewsItem[]>([]);
const likedArticles = ref<NewsItem[]>([]);
const activeSegment = ref('saved');
const savedPage = ref(1);
const likedPage = ref(1);
const itemsPerPage = 10;
const loadingSaved = ref(false);
const loadingLiked = ref(false);
const showHeaderTitle = ref(false);

// Computed data for masthead
const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();
});

// Computed properties for lazy loading
const displayedSaved = computed(() => {
  return savedArticles.value.slice(0, savedPage.value * itemsPerPage);
});

const displayedLiked = computed(() => {
  return likedArticles.value.slice(0, likedPage.value * itemsPerPage);
});

const loadSavedArticles = () => {
  const savedData = localStorage.getItem('saved_articles_data');
  if (savedData) {
    savedArticles.value = JSON.parse(savedData);
  }
};

const loadLikedArticles = () => {
  const likedData = localStorage.getItem('liked_articles_data');
  if (likedData) {
    likedArticles.value = JSON.parse(likedData);
  }
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

const removeArticle = (link: string, type: 'saved' | 'liked') => {
  if (type === 'saved') {
    savedArticles.value = savedArticles.value.filter(a => a.link !== link);
    localStorage.setItem('saved_articles_data', JSON.stringify(savedArticles.value));
    localStorage.setItem('saved_articles', JSON.stringify(savedArticles.value.map(a => a.link)));
  } else {
    likedArticles.value = likedArticles.value.filter(a => a.link !== link);
    localStorage.setItem('liked_articles_data', JSON.stringify(likedArticles.value));
    localStorage.setItem('liked_articles', JSON.stringify(likedArticles.value.map(a => a.link)));
  }
};

const segmentChanged = (event: any) => {
  activeSegment.value = event.detail.value;
};

const handleRefresh = (event: any) => {
  loadSavedArticles();
  loadLikedArticles();
  savedPage.value = 1;
  likedPage.value = 1;
  setTimeout(() => {
    event.target.complete();
  }, 1000);
};

const handleScroll = (event: any) => {
  showHeaderTitle.value = event.detail.scrollTop > 150;
  
  const scrollElement = event.target;
  const scrollTop = scrollElement.scrollTop;
  const scrollHeight = scrollElement.scrollHeight;
  const clientHeight = scrollElement.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight * 0.8) {
    if (activeSegment.value === 'saved' && !loadingSaved.value) {
      if (displayedSaved.value.length < savedArticles.value.length) {
        loadingSaved.value = true;
        setTimeout(() => {
          savedPage.value++;
          loadingSaved.value = false;
        }, 500);
      }
    } else if (activeSegment.value === 'liked' && !loadingLiked.value) {
      if (displayedLiked.value.length < likedArticles.value.length) {
        loadingLiked.value = true;
        setTimeout(() => {
          likedPage.value++;
          loadingLiked.value = false;
        }, 500);
      }
    }
  }
};

onMounted(() => {
  loadSavedArticles();
  loadLikedArticles();
  
  window.addEventListener('storage', () => {
    loadSavedArticles();
    loadLikedArticles();
  });
});
</script>

<style scoped>
.newspaper-content {
  background-color: transparent !important;
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
  z-index: -1;
}

.sticky-toolbar {
  --background: var(--ion-toolbar-background);
  --color: var(--ion-toolbar-color);
  --border-bottom: 2px solid var(--ion-text-color);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.mini-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 3px;
  text-align: center;
  text-transform: uppercase;
}

.header-fade {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.header-visible {
  opacity: 1;
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

.collection-title {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
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

.motto {
  font-style: italic;
}

.collection-container {
  padding: 0 15px 120px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

ion-segment {
  margin-bottom: 20px;
  --background: var(--ion-toolbar-background);
  border: 2px solid var(--ion-text-color);
  border-radius: 4px;
}

ion-segment-button {
  --color: var(--ion-text-color) !important;
  --color-checked: var(--ion-background-color) !important;
  --indicator-color: var(--ion-text-color) !important;
  --background-checked: var(--ion-text-color) !important;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.85rem;
}

ion-segment-button.segment-button-checked ion-label {
  color: var(--ion-background-color) !important;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 1.8rem;
  color: var(--ion-text-color);
  margin: 0 0 15px 0;
}

.empty-text {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  color: var(--ion-text-color);
  opacity: 0.8;
  line-height: 1.6;
}

.newspaper-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-article {
  cursor: pointer;
  border-bottom: 2px solid var(--ion-text-color);
  padding-bottom: 15px;
}

.article-inner {
  background: transparent;
  padding: 0;
  border: none;
}

.article-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 1.3rem;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
  line-height: 1.1;
  text-transform: uppercase;
}

.article-meta {
  font-family: 'Old Standard TT', serif;
  font-size: 0.75rem;
  border-top: 2px solid var(--ion-text-color);
  border-bottom: 2px solid var(--ion-text-color);
  padding: 5px 0;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.byline {
  font-weight: 900;
  color: var(--ion-text-color);
}

.dateline {
  font-weight: 700;
  color: var(--ion-text-color);
  opacity: 0.7;
}

.article-album-container {
  margin-bottom: 10px;
  border: 1px solid var(--ion-text-color);
  padding: 2px;
  background: var(--parchment-white);
  position: relative;
  overflow: hidden;
}

.album-scroller {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.album-scroller::-webkit-scrollbar {
  display: none;
}

.album-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.album-scroller.single-item .album-item {
  background: transparent;
}

.vintage-video {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border: 1px solid var(--ion-text-color);
  filter: sepia(0.2) contrast(1.1);
  display: block;
}

.album-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-family: 'Old Standard TT', serif;
  font-size: 0.6rem;
  padding: 2px 6px;
  border: 1px solid rgba(255,255,255,0.2);
  pointer-events: none;
  z-index: 5;
}

.vintage-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  filter: sepia(0.6) contrast(1.1) grayscale(0.5);
  display: block;
}

.article-body {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--ion-text-color);
  text-align: justify;
}

.remove-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: var(--ion-text-color);
  color: var(--ion-background-color);
  border: 2px solid var(--ion-text-color);
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 2px 2px 0 var(--ion-text-color);
  width: 100%;
}

.remove-btn:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 0 var(--ion-text-color);
}

.remove-btn:active {
  transform: translateY(0);
  box-shadow: 1px 1px 0 var(--ion-text-color);
}

.loading-more {
  text-align: center;
  padding: 20px;
}
</style>
