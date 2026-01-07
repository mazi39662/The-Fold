<template>
  <transition name="fade">
    <div v-if="show" class="splash-screen">
      <div class="paper-overlay"></div>
      <div class="splash-content">
        <h1 class="splash-title">The Fold</h1>
        <div class="splash-divider"></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const show = ref(true);

onMounted(() => {
  setTimeout(() => {
    show.value = false;
  }, 2500); // 2.5 seconds splash
});
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f4ecd8;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.paper-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/paper-texture.png');
  opacity: 0.15;
  pointer-events: none;
}

.splash-content {
  text-align: center;
  position: relative;
  z-index: 10;
}

.splash-title {
  font-family: 'UnifrakturMaguntia', cursive;
  font-size: 5rem;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -2px;
  animation: slideUp 0.8s ease-out;
}

.splash-divider {
  width: 200px;
  height: 4px;
  background: #1a1a1a;
  margin: 20px auto;
  border-top: 2px solid #1a1a1a;
  border-bottom: 2px solid #1a1a1a;
  transform: scaleX(0);
  animation: expandWidth 1s ease-out 0.5s forwards;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes expandWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>
