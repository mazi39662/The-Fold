<template>
  <ion-page>
    <ion-content>
      <div class="redirect-message">
        <p>Redirecting to Collection...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Redirect to tab2 (Collection page)
  router.replace('/tabs/tab2');
});
</script>

<style scoped>
.redirect-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: 'Old Standard TT', serif;
  font-size: 1.2rem;
  color: #444;
}
</style>
