<template>
  <ion-page class="newspaper-page">
    <ion-header :translucent="true">
      <ion-toolbar class="vintage-toolbar">
        <ion-title class="vintage-title">MY COLLECTION</ion-title>
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

                <div class="article-image-container" v-if="item.image">
                  <img :src="item.image" :alt="item.title" class="vintage-image" loading="lazy" />
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

                <div class="article-image-container" v-if="item.image">
                  <img :src="item.image" :alt="item.title" class="vintage-image" loading="lazy" />
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

const savedArticles = ref<NewsItem[]>([]);
const likedArticles = ref<NewsItem[]>([]);
const activeSegment = ref('saved');
const savedPage = ref(1);
const likedPage = ref(1);
const itemsPerPage = 10;
const loadingSaved = ref(false);
const loadingLiked = ref(false);

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
    
    const savedLinks = JSON.parse(localStorage.getItem('saved_articles') || '[]');
    const updatedLinks = savedLinks.filter((l: string) => l !== link);
    localStorage.setItem('saved_articles', JSON.stringify(updatedLinks));
  } else {
    likedArticles.value = likedArticles.value.filter(a => a.link !== link);
    localStorage.setItem('liked_articles_data', JSON.stringify(likedArticles.value));
    
    const likedLinks = JSON.parse(localStorage.getItem('liked_articles') || '[]');
    const updatedLinks = likedLinks.filter((l: string) => l !== link);
    localStorage.setItem('liked_articles', JSON.stringify(updatedLinks));
  }
};

const segmentChanged = (event: any) => {
  activeSegment.value = event.detail.value;
};

const handleRefresh = (event: any) => {
  // Reload both lists
  loadSavedArticles();
  loadLikedArticles();
  
  // Reset pagination
  savedPage.value = 1;
  likedPage.value = 1;

  // Small delay for visual feedback
  setTimeout(() => {
    event.target.complete();
  }, 1000);
};

const handleScroll = (event: any) => {
  const scrollElement = event.target;
  const scrollTop = scrollElement.scrollTop;
  const scrollHeight = scrollElement.scrollHeight;
  const clientHeight = scrollElement.clientHeight;
  
  // Load more when near bottom (80% scrolled)
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
  
  // Listen for updates from Tab1
  window.addEventListener('storage', () => {
    loadSavedArticles();
    loadLikedArticles();
  });
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
  --border-bottom: 2px solid #222;
  --color: #000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.vintage-title {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 2px;
  text-align: center;
}

.collection-container {
  padding: 15px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

ion-segment {
  margin-bottom: 20px;
  --background: #f4ecda;
  border: 2px solid #222;
  border-radius: 4px;
}

ion-segment-button {
  --color: #444;
  --color-checked: #1a1a1a;
  --indicator-color: #1a1a1a;
  font-family: 'Old Standard TT', serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0 0 15px 0;
}

.empty-text {
  font-family: 'EB Garamond', serif;
  font-size: 1rem;
  color: #444;
  line-height: 1.6;
}

.newspaper-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-article {
  cursor: pointer;
  border-bottom: 2px solid #222;
  padding-bottom: 15px;
}

.article-inner {
  background: #fff;
  padding: 15px;
  border: 2px solid #222;
  box-shadow: 2px 2px 0 #222;
}

.article-title {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 1.3rem;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.1;
  text-transform: uppercase;
}

.article-meta {
  font-family: 'Old Standard TT', serif;
  font-size: 0.75rem;
  border-top: 2px solid #222;
  border-bottom: 2px solid #222;
  padding: 5px 0;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  margin-bottom: 10px;
  border: 1px solid #222;
  padding: 2px;
  background: white;
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
  color: #222;
  text-align: justify;
}

.article-lead {
  margin: 0;
}

.remove-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #1a1a1a;
  color: #f4ecd8;
  border: 2px solid #222;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 2px 2px 0 #222;
  width: 100%;
}

.remove-btn:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 0 #222;
  background: #000;
}

.remove-btn:active {
  transform: translateY(0);
  box-shadow: 1px 1px 0 #222;
}

.loading-more {
  text-align: center;
  padding: 20px;
}
</style>
