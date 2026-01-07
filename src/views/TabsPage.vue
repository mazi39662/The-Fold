<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="vintage-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="newspaperOutline" />
          <ion-label>News Feed</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="bookmarkOutline" />
          <ion-label>Collection</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon aria-hidden="true" :icon="libraryOutline" />
          <ion-label>Sources</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { newspaperOutline, bookmarkOutline, libraryOutline } from 'ionicons/icons';
</script>

<style scoped>
.vintage-tab-bar {
  --background: #f4ecd8;
  --border-top: 2px solid #222;
  height: 65px;
  background-color: #f4ecd8;
  border-top: 2px solid #222;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

ion-tab-button {
  --color: #444;
  --color-selected: #000;
  font-family: 'Old Standard TT', serif;
  font-weight: 700;
  text-transform: uppercase;
}

ion-label {
  font-size: 0.65rem;
  letter-spacing: 1px;
}

ion-icon {
  font-size: 1.5rem;
}
</style>
