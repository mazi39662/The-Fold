<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="vintage-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1" @click="handleTabClick('tab1')">
          <ion-icon aria-hidden="true" :icon="newspaperOutline" />
          <ion-label>News Feed</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3" @click="handleTabClick('tab3')">
          <ion-icon aria-hidden="true" :icon="cloudyOutline" />
          <ion-label>Weather</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2" @click="handleTabClick('tab2')">
          <ion-icon aria-hidden="true" :icon="bookmarkOutline" />
          <ion-label>Collection</ion-label>
        </ion-tab-button>

        <!-- <ion-tab-button tab="tab4" href="/tabs/tab4" @click="handleTabClick('tab4')">
          <ion-icon aria-hidden="true" :icon="libraryOutline" />
          <ion-label>Sources</ion-label>
        </ion-tab-button> -->

        <ion-tab-button tab="tab5" href="/tabs/tab5" @click="handleTabClick('tab5')">
          <ion-icon aria-hidden="true" :icon="settingsOutline" />
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { newspaperOutline, bookmarkOutline, libraryOutline, cloudyOutline, settingsOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';

const route = useRoute();

const handleTabClick = (tab: string) => {
  const currentPath = route.path;
  const targetPath = `/tabs/${tab}`;
  
  if (currentPath === targetPath) {
    // If we're already on this tab, trigger a refresh event
    window.dispatchEvent(new CustomEvent('refresh-current-tab', { detail: { tab } }));
  }
};
</script>

<style scoped>
.vintage-tab-bar {
  --background: #f4ecd8;
  --border-top: 2px solid #222;
  height: 75px; 
  background-color: #f4ecd8;
  border-top: 2px solid #222;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.12);
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
}

ion-tab-button {
  --color: #666;
  --color-selected: #000;
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  text-transform: uppercase;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: visible;
  position: relative;
}

/* Base state for icons */
ion-icon {
  font-size: 1.4rem;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-top: 4px;
}

/* Hide label and scale down unselected */
ion-tab-button:not(.tab-selected) {
  flex: 0.7;
}

ion-tab-button:not(.tab-selected) ion-label {
  opacity: 0;
  transform: translateY(10px);
  height: 0;
  margin: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

ion-tab-button:not(.tab-selected) ion-icon {
  font-size: 1.2rem;
  opacity: 0.6;
}

/* Selected Tab state */
ion-tab-button.tab-selected {
  flex: 1.5; /* Grow the selected tab */
  z-index: 10;
}

ion-tab-button.tab-selected ion-icon {
  font-size: 1.8rem;
  transform: translateY(-5px);
  opacity: 1;
  color: #000;
}

ion-tab-button.tab-selected ion-label {
  opacity: 1;
  transform: translateY(0);
  height: auto;
  font-size: 0.75rem;
  letter-spacing: 1.5px;
  margin-top: 4px;
  color: #000;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Subtle Ink Press Effect */
ion-tab-button:active ion-icon {
  transform: scale(0.8) !important;
  opacity: 0.4;
}
</style>
