<template>
  <ion-page class="newspaper-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="vintage-toolbar">
        <ion-title>The Leisure Cabinet</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="newspaper-content">
      <div class="paper-overlay"></div>
      
      <div class="games-layout">
        <div class="masthead">
          <div class="masthead-top">
            <span class="masthead-date">{{ currentFormattedDate }}</span>
            <span class="masthead-edition">ARCADE EDITION</span>
            <span class="masthead-price">VOL. VI</span>
          </div>
          <h1 class="newspaper-title">Games & Riddles</h1>
          <div class="masthead-bottom">
            <div class="motto">Mental stimulation for the modern distinguished reader</div>
          </div>
        </div>

        <div class="games-grid">
          <div 
            v-for="game in games" 
            :key="game.id" 
            class="game-article"
            @click="openGame(game.id)"
          >
            <div class="article-inner">
              <div class="game-icon-container">
                <ion-icon :icon="game.icon" class="game-icon"></ion-icon>
              </div>
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-desc">{{ game.description }}</p>
              <div class="article-separator-mini"></div>
              <div class="play-link">REVEAL DISPATCH →</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instruction Modal -->
      <ion-modal :is-open="isInstructionModalOpen" @didDismiss="isInstructionModalOpen = false" class="instruction-modal">
        <div class="modal-wrapper instruction-wrapper">
          <div class="paper-overlay"></div>
          <div class="instruction-content">
            <div class="newspaper-masthead-mini">
              <h3 class="old-font">FIELD MANUAL</h3>
              <div class="article-separator-mini"></div>
            </div>
            <h2 class="game-instruction-title">{{ activeGame?.name }} Protocol</h2>
            <p class="instruction-body">{{ gameInstructions[activeGame?.id] }}</p>
            <div class="instruction-actions">
              <ion-button expand="block" class="vintage-button" @click="startActiveGame">Start</ion-button>
              <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="isInstructionModalOpen = false">Cancel</ion-button>
            </div>
          </div>
        </div>
      </ion-modal>

      <!-- Main Game Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeGame">
        <div class="modal-wrapper">
          <div class="paper-overlay"></div>
          <ion-header class="ion-no-border">
            <ion-toolbar class="vintage-toolbar">
              <ion-buttons slot="start">
                <ion-button @click="closeGame">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
              <ion-title>{{ activeGame?.name }}</ion-title>
            </ion-toolbar>
          </ion-header>

          <ion-content class="newspaper-content ion-padding">
            <div v-if="activeGame" class="game-play-area">
              <div v-if="loading" class="loading-state">
                <ion-spinner name="lines-sharp"></ion-spinner>
                <p class="old-font">Retrieving data from the wires...</p>
              </div>

              <!-- Anagram Game -->
              <div v-else-if="activeGame.id === 'anagram'" class="game-ui">
                <div class="puzzle-card anagram-card">
                  <p class="puzzle-hint">Extract all English nouns from:</p>
                  <h2 class="scrambled-word">{{ puzzleData?.task }}</h2>
                  
                  <div class="anagram-progress">
                    <span class="old-font">COLLECTED: {{ foundAnagrams.length }} / {{ puzzleData?.words.length }}</span>
                  </div>

                  <div class="found-words-scroll">
                    <div class="found-words-list">
                      <span v-for="word in foundAnagrams" :key="word" class="found-word bubble">{{ word }}</span>
                    </div>
                  </div>

                  <ion-item class="vintage-input">
                    <ion-label position="stacked">COMPOSITION</ion-label>
                    <ion-input v-model="userInput" placeholder="TYPE A WORD..." @keyup.enter="checkAnswer"></ion-input>
                  </ion-item>
                  
                  <div class="game-actions">
                    <ion-button expand="block" class="vintage-button" @click="checkAnswer">SUBMIT WORD</ion-button>
                    <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="fetchPuzzle">NEW DISPATCH</ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

              <!-- Capitals Quiz -->
              <div v-else-if="activeGame.id === 'capitals'" class="game-ui">
                <div class="puzzle-card">
                  <p class="puzzle-hint">Official Bureau of Records:</p>
                  <div v-if="puzzleData?.flag" class="flag-container">
                    <img :src="puzzleData.flag" class="vintage-flag" alt="National Banner" />
                  </div>
                  <h2 class="scrambled-word">{{ puzzleData?.country }}</h2>
                  <p class="puzzle-hint">Identify the Capital:</p>
                  <div class="options-grid">
                    <ion-button 
                      v-for="option in puzzleData?.variants" 
                      :key="option" 
                      expand="block" 
                      fill="outline"
                      color="dark"
                      class="option-button"
                      @click="checkCountryAnswer(option)"
                    >
                      {{ option }}
                    </ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

              <!-- Flags Quiz -->
              <div v-else-if="activeGame.id === 'flags'" class="game-ui">
                <div class="puzzle-card">
                  <p class="puzzle-hint">Sovereign Banner Identification:</p>
                  <div v-if="puzzleData?.flag" class="flag-container">
                    <img :src="puzzleData.flag" class="vintage-flag" alt="Sovereign Banner" />
                  </div>
                  <p class="puzzle-hint">Identify the Nation:</p>
                  <div class="options-grid">
                    <ion-button 
                      v-for="option in puzzleData?.variants" 
                      :key="option" 
                      expand="block" 
                      fill="outline"
                      color="dark"
                      class="option-button"
                      @click="checkCountryAnswer(option)"
                    >
                      {{ option }}
                    </ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>



              <!-- Minesweeper Game -->
              <div v-else-if="activeGame.id === 'minesweeper'" class="game-ui">
                <div class="puzzle-card mines-card">
                  <p class="puzzle-hint">Strategic Trench Exploration:</p>
                  <p v-if="!minesBoard.length" class="old-font">CLICK ANYWHERE TO START</p>
                  <div class="mines-grid" :style="{ gridTemplateColumns: `repeat(${minesWidth}, 1fr)` }">
                    <template v-for="r in minesHeight" :key="'r'+r">
                      <div 
                        v-for="c in minesWidth" 
                        :key="'c'+c" 
                        class="mines-cell"
                        :class="{ 'revealed': isRevealed[r-1][c-1], 'flagged': isFlagged[r-1][c-1], 'mine': isRevealed[r-1][c-1] && minesBoard[r-1][c-1] === 'x' }"
                        @click="revealCell(r-1, c-1)"
                        @contextmenu.prevent="toggleFlag(r-1, c-1)"
                      >
                        <span v-if="isRevealed[r-1][c-1]">
                          <template v-if="minesBoard[r-1][c-1] === 'x'"><ion-icon :icon="flameOutline" color="danger"></ion-icon></template>
                          <template v-else-if="minesBoard[r-1][c-1] !== 'o'">{{ minesBoard[r-1][c-1] }}</template>
                        </span>
                        <span v-else-if="isFlagged[r-1][c-1]"><ion-icon :icon="flagOutline" color="danger"></ion-icon></span>
                      </div>
                    </template>
                  </div>
                  <div class="game-actions">
                    <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="fetchMinesweeper(true)">RESET FIELD</ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

              <!-- Memory Game -->
              <div v-else-if="activeGame.id === 'memory'" class="game-ui">
                <div class="puzzle-card memory-card">
                  <p class="puzzle-hint">Cognitive Recollection:</p>
                  <div class="memory-grid">
                     <div 
                        v-for="(row, rIdx) in memoryBoard" 
                        :key="rIdx" 
                        class="memory-row"
                      >
                        <div 
                          v-for="(cell, cIdx) in row" 
                          :key="cIdx" 
                          class="memory-cell"
                          :class="{ 'flipped': flippedCells.some(f => f.r === rIdx && f.c === cIdx) || matchedCells.some(m => m.r === rIdx && m.c === cIdx) }"
                          @click="flipMemoryCell(rIdx, cIdx)"
                        >
                          <div class="memory-inner">
                            <div class="memory-front">?</div>
                            <div class="memory-back">{{ cell }}</div>
                          </div>
                        </div>
                      </div>
                  </div>
                  <div class="game-actions">
                    <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="fetchPuzzle">RESTART TEST</ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

              <!-- Set Game -->
              <div v-else-if="activeGame.id === 'set'" class="game-ui">
                <div class="puzzle-card set-card">
                  <p class="puzzle-hint">Archive Training: Pattern Recognition</p>
                  
                  <div class="set-grid">
                    <div 
                      v-for="card in puzzleData?.layout" 
                      :key="card._id" 
                      class="set-item"
                      :class="{ 'selected': selectedSetCards.includes(card) }"
                      @click="toggleSetCard(card)"
                    >
                      <div class="set-card-inner" :class="[card.color, card.shading]">
                        <div v-for="n in card.number" :key="n" class="set-shape-wrapper">
                          <div class="set-shape" :class="card.shape"></div>
                        </div>
                      </div>
                      <div class="card-id-mark">{{ card._id }}</div>
                    </div>
                  </div>
                  
                  <div class="game-actions">
                    <ion-button expand="block" class="vintage-button" @click="checkSet" :disabled="selectedSetCards.length !== 3">VERIFY SELECTION</ion-button>
                    <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="fetchPuzzle">REQUEST NEW DEAL</ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

              <!-- Camp Game -->
              <div v-else-if="activeGame.id === 'camp'" class="game-ui">
                 <div class="puzzle-card camp-card">
                   <p class="puzzle-hint">The Tents & Trees Plot:</p>
                   <div class="camp-content">
                     <div class="col-hints">
                       <div class="hint-spacer"></div>
                       <div v-for="h in puzzleData?.columnTents" :key="h" class="hint-cell">{{ h }}</div>
                     </div>
                     <div class="camp-middle">
                       <div class="row-hints">
                         <div v-for="h in puzzleData?.rowTents" :key="h" class="hint-cell">{{ h }}</div>
                       </div>
                       <div class="camp-grid">
                         <div v-for="(row, rIdx) in campBoard" :key="rIdx" class="camp-row">
                           <div 
                             v-for="(cell, cIdx) in row" 
                             :key="cIdx" 
                             class="camp-cell"
                             @click="toggleCampCell(rIdx, cIdx)"
                           >
                              <ion-icon v-if="cell === 1" :icon="leafOutline" class="tree-icon"></ion-icon>
                              <ion-icon v-else-if="cell === 2" :icon="triangleOutline" class="tent-icon"></ion-icon>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div class="game-actions">
                     <ion-button expand="block" class="vintage-button" @click="checkCamp">AUDIT PLOT</ion-button>
                     <ion-button expand="block" fill="clear" color="dark" class="old-font" @click="fetchPuzzle">SURVEY NEW LAND</ion-button>
                   </div>
                   <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                 </div>
              </div>

              <!-- Wordsearch -->
               <div v-else-if="activeGame.id === 'wordsearch'" class="game-ui">
                <div class="puzzle-card wordsearch-card">
                  <p class="puzzle-hint">Cipher Decryption:</p>
                  <div class="wordsearch-container">
                    <div 
                      class="wordsearch-grid" 
                      :style="{ gridTemplateColumns: `repeat(${puzzleData?.width || 10}, 1fr)`, touchAction: 'none' }"
                      @mouseup="handleWSMouseUp"
                      @touchend="handleWSMouseUp"
                    >
                      <template v-for="(row, rIdx) in (puzzleData?.grid as string[][])" :key="'wsr'+rIdx">
                        <div 
                          v-for="(cell, cIdx) in (row as string[])" 
                          :key="'wsc'+cIdx" 
                          class="ws-cell"
                          :data-r="rIdx"
                          :data-c="cIdx"
                          :class="{ 
                            'ws-found': isWSFound(Number(rIdx), Number(cIdx)), 
                            'ws-selecting': isWSSelecting(Number(rIdx), Number(cIdx)),
                            'ws-start': wsSelectionStart?.r === Number(rIdx) && wsSelectionStart?.c === Number(cIdx)
                          }"
                          @mousedown="handleWSMouseDown(Number(rIdx), Number(cIdx))"
                          @mouseenter="handleWSMouseEnter(Number(rIdx), Number(cIdx))"
                          @touchstart="handleWSTouchStart($event, Number(rIdx), Number(cIdx))"
                          @touchmove="handleWSTouchMove($event)"
                        >
                          {{ cell }}
                        </div>
                      </template>
                    </div>
                    <div class="word-list-ws">
                      <h4 class="old-font">HIDDEN TERMS:</h4>
                      <div class="ws-terms-grid">
                        <span 
                          v-for="wordObj in puzzleData?.words" 
                          :key="wordObj.word" 
                          class="ws-term"
                          :class="{ 'term-found': foundWSWords.includes(wordObj.word) }"
                        >
                          {{ wordObj.word }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="game-actions">
                    <ion-button expand="block" class="vintage-button" @click="fetchPuzzle">REQUEST NEW CIPHER</ion-button>
                  </div>
                  <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
                </div>
              </div>

            </div>
          </ion-content>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonIcon, IonModal, IonButton, IonButtons, IonSpinner,
  IonItem, IonLabel, IonInput, alertController
} from '@ionic/vue';
import { 
  helpCircleOutline, gridOutline, appsOutline, flaskOutline, 
  searchOutline, closeOutline, flagOutline, flameOutline, 
  leafOutline, triangleOutline
} from 'ionicons/icons';
import { ref, computed } from 'vue';

const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();
});

const games = [
  { id: 'anagram', name: 'Anagram', endpoint: 'anagram/generator', icon: helpCircleOutline, description: 'Extract all hidden English nouns from a master dispatch.' },
  { id: 'minesweeper', name: 'Mines', endpoint: 'minesweeper/generator', icon: appsOutline, description: 'Navigate the strategic trenches while avoiding explosives.' },
  { id: 'wordsearch', name: 'Search', endpoint: 'wordsearch/generator', icon: searchOutline, description: 'Identify terms hidden within the encrypted cipher grid.' },
  { id: 'capitals', name: 'Capitals', endpoint: 'countries/capital-quiz', icon: flaskOutline, description: 'A test of global geography for the well-traveled reader.' },
  { id: 'flags', name: 'Flags', endpoint: 'countries/country-quiz', icon: flagOutline, description: 'Identify the sovereign nation from its archived banner.' },
  { id: 'set', name: 'Set', endpoint: 'set/start', icon: appsOutline, description: 'An abstract pattern recognition practice for sharp eyes.' },
  { id: 'camp', name: 'Camp', endpoint: 'camp/generator', icon: leafOutline, description: 'Tents and trees logic plot coordination and audit.' },
  { id: 'memory', name: 'Memory', endpoint: 'memory/generator', icon: gridOutline, description: 'A cognitive recall exercise with hidden archived symbols.' },
];

const isModalOpen = ref(false);
const isInstructionModalOpen = ref(false);
const activeGame = ref<any>(null);
const loading = ref(false);
const puzzleData = ref<any>(null);
const userInput = ref('');
const feedback = ref('');
const feedbackType = ref('');

// Game Boards
const sudokuBoard = ref<number[][]>([]);
const isInitial = ref<boolean[][]>([]);
const selectedCell = ref<{r: number, c: number} | null>(null);

const minesWidth = ref(9);
const minesHeight = ref(9);
const minesBoard = ref<string[][]>([]);
const isRevealed = ref<boolean[][]>([]);
const isFlagged = ref<boolean[][]>([]);

const memoryBoard = ref<string[][]>([]);
const flippedCells = ref<{r: number, c: number}[]>([]);
const matchedCells = ref<{r: number, c: number}[]>([]);

const campBoard = ref<number[][]>([]);
const selectedSetCards = ref<any[]>([]);
const foundAnagrams = ref<string[]>([]);
const foundWSWords = ref<string[]>([]);
const wsSelectionStart = ref<{r: number, c: number} | null>(null);
const wsSelectionEnd = ref<{r: number, c: number} | null>(null);
const wsIsDragging = ref(false);

const gameInstructions: Record<string, string> = {
  anagram: "Extract all hidden English nouns from the scrambled word. Type and submit words below to collect them all.",
  minesweeper: "Navigate the grid without hitting mines. Numbers indicate adjacent explosives. Tap to reveal, or flag suspected locations.",
  wordsearch: "Find hidden terms in the grid. Tap the first letter then the last letter of a word (or drag) to decrypt it.",
  capitals: "Identify the official capital city for the displayed nation and its sovereign banner.",
  flags: "Correctly name the sovereign nation based on its archived flag.",
  set: "Select 3 cards for a SET. For each feature (Color, Shape, Number, Shaded), they must be ALL identical or ALL unique.",
  camp: "Place tents next to trees. Tents cannot touch each other (even diagonally). Hints show required counts.",
  memory: "Flip cards to find matching pairs in the archive. Success requires matching all symbols."
};

const openGame = (gameId: string) => {
  activeGame.value = games.find(g => g.id === gameId);
  isInstructionModalOpen.value = true;
};

const startActiveGame = async () => {
  const gameId = activeGame.value?.id;
  isInstructionModalOpen.value = false;
  
  isModalOpen.value = true;
  if (['anagram', 'capitals', 'flags', 'wordsearch', 'memory', 'set', 'camp'].includes(gameId)) {
    await fetchPuzzle();
  } else if (gameId === 'minesweeper') {
    fetchMinesweeper(true);
  }
};

const closeGame = () => {
  isModalOpen.value = false;
  activeGame.value = null;
  puzzleData.value = null;
  resetGameState();
};

const resetGameState = () => {
  userInput.value = '';
  feedback.value = '';
  selectedCell.value = null;
  minesBoard.value = [];
  memoryBoard.value = [];
  matchedCells.value = [];
  flippedCells.value = [];
  campBoard.value = [];
  selectedSetCards.value = [];
  foundAnagrams.value = [];
  foundWSWords.value = [];
  wsSelectionStart.value = null;
  wsSelectionEnd.value = null;
  wsIsDragging.value = false;
};

const fetchPuzzle = async () => {
  if (!activeGame.value) return;
  loading.value = true;
  resetGameState();
  
  try {
    const url = new URL(`https://shadify.yurace.pro/api/${activeGame.value.endpoint}`);
    if (activeGame.value.id === 'memory') url.searchParams.append('size', '16');
    
    const response = await fetch(url.toString());
    const data = await response.json();
    puzzleData.value = data;
    
    if (activeGame.value.id === 'sudoku') {
      sudokuBoard.value = data.task;
      isInitial.value = sudokuBoard.value.map(row => row.map(cell => cell !== 0));
    } else if (activeGame.value.id === 'memory') {
      memoryBoard.value = data.grid;
    } else if (activeGame.value.id === 'camp') {
      campBoard.value = JSON.parse(JSON.stringify(data.task));
    }
  } catch (error) {
    feedback.value = 'CONNECTION FAILURE.';
    feedbackType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const checkAnswer = () => {
  if (!puzzleData.value || !userInput.value) return;
  
  if (activeGame.value.id === 'anagram') {
    const input = userInput.value.trim().toLowerCase();
    if (foundAnagrams.value.includes(input)) {
      feedback.value = 'ALREADY FOUND.';
      feedbackType.value = 'error';
    } else if (puzzleData.value.words.includes(input)) {
      foundAnagrams.value.push(input);
      userInput.value = '';
      feedback.value = 'GOOD WORD!';
      feedbackType.value = 'success';
      if (foundAnagrams.value.length === puzzleData.value.words.length) {
        feedback.value = 'ALL WORDS FOUND! EXTRAORDINARY.';
      }
    } else {
      feedback.value = 'NOT IN LIST.';
      feedbackType.value = 'error';
    }
    return;
  }

  const correct = userInput.value.trim().toLowerCase() === puzzleData.value.answer.toString().toLowerCase();
  feedback.value = correct ? 'EXCELLENT! VERIFIED.' : 'INCORRECT. TRY AGAIN.';
  feedbackType.value = correct ? 'success' : 'error';
  if (correct) setTimeout(() => fetchPuzzle(), 1500);
};

const checkCountryAnswer = (answer: string) => {
  const correct = answer === puzzleData.value.answer;
  feedback.value = correct ? 'MARVELOUS!' : `INCORRECT. IT WAS ${puzzleData.value.answer.toUpperCase()}.`;
  feedbackType.value = correct ? 'success' : 'error';
  setTimeout(() => fetchPuzzle(), 1500);
};

// Sudoku
const selectCell = (r: number, c: number) => { if (!isInitial.value[r][c]) selectedCell.value = { r, c }; };
const inputNumber = (n: number) => { if (selectedCell.value) sudokuBoard.value[selectedCell.value.r][selectedCell.value.c] = n; };
const checkSudoku = () => {
  const sol = puzzleData.value.grid;
  const win = sudokuBoard.value.every((row, r) => row.every((c, ci) => c === sol[r][ci]));
  feedback.value = win ? 'GRID COMPLETE!' : 'SOME ERRORS FOUND.';
  feedbackType.value = win ? 'success' : 'error';
  if (win) setTimeout(() => fetchPuzzle(), 2000);
};

// Mines
const fetchMinesweeper = async (init = false, pos = '1-1') => {
  if (init) {
    minesBoard.value = [];
    isRevealed.value = Array(9).fill(null).map(() => Array(9).fill(false));
    isFlagged.value = Array(9).fill(null).map(() => Array(9).fill(false));
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`https://shadify.yurace.pro/api/minesweeper/generator?start=${pos}`);
    const data = await res.json();
    minesBoard.value = data.board;
    const [x, y] = pos.split('-').map(Number);
    isRevealed.value[y - 1][x - 1] = true;
  } finally { loading.value = false; }
};
const revealCell = async (r: number, c: number) => {
  if (isFlagged.value[r][c] || isRevealed.value[r][c]) return;
  if (!minesBoard.value.length) return fetchMinesweeper(false, `${c + 1}-${r + 1}`);
  isRevealed.value[r][c] = true;
  if (minesBoard.value[r][c] === 'x') {
    feedback.value = 'DETONATION! FAILED.';
    feedbackType.value = 'error';
    minesBoard.value.forEach((row, ri) => row.forEach((cell, ci) => { if (cell === 'x') isRevealed.value[ri][ci] = true; }));
  }
};
const toggleFlag = (r: number, c: number) => { if (!isRevealed.value[r][c]) isFlagged.value[r][c] = !isFlagged.value[r][c]; };

// Memory
const flipMemoryCell = (r: number, c: number) => {
  if (flippedCells.value.length === 2 || matchedCells.value.some(m => m.r === r && m.c === c)) return;
  flippedCells.value.push({r, c});
  if (flippedCells.value.length === 2) {
    const [f1, f2] = flippedCells.value;
    if (memoryBoard.value[f1.r][f1.c] === memoryBoard.value[f2.r][f2.c]) {
      matchedCells.value.push(f1, f2);
      flippedCells.value = [];
    } else { setTimeout(() => flippedCells.value = [], 1000); }
  }
};

// Set
const toggleSetCard = (card: any) => {
  const idx = selectedSetCards.value.indexOf(card);
  if (idx > -1) selectedSetCards.value.splice(idx, 1);
  else if (selectedSetCards.value.length < 3) selectedSetCards.value.push(card);
};
const checkSet = () => {
  if (selectedSetCards.value.length !== 3) return;
  const ids = selectedSetCards.value.map(c => c._id).sort((a: number, b: number) => a - b).join('-');
  const possible = puzzleData.value.possibleSets.map((s: any) => s.map((c: any) => c._id).sort((a: number, b: number) => a - b).join('-'));
  const win = possible.includes(ids);
  feedback.value = win ? 'VALID SET!' : 'NOT A SET.';
  feedbackType.value = win ? 'success' : 'error';
  if (win) setTimeout(() => fetchPuzzle(), 1500);
};

// Camp
const toggleCampCell = (r: number, c: number) => {
  if (campBoard.value[r][c] === 1) return; // Tree is fixed
  campBoard.value[r][c] = campBoard.value[r][c] === 2 ? 0 : 2;
};
const checkCamp = () => {
  const win = campBoard.value.every((row, r) => row.every((c, ci) => c === puzzleData.value.solution[r][ci]));
  feedback.value = win ? 'PLOT AUDITED! CORRECT.' : 'MISPLACED TENTS FOUND.';
  feedbackType.value = win ? 'success' : 'error';
  if (win) setTimeout(() => fetchPuzzle(), 2000);
};

// Word Search
const handleWSMouseDown = (r: number, c: number) => {
  if (wsSelectionStart.value && !wsIsDragging.value) {
    // If we already have a start and this is a second click, treat it as end
    wsSelectionEnd.value = { r, c };
    handleWSMouseUp();
  } else {
    // Start new selection
    wsSelectionStart.value = { r, c };
    wsSelectionEnd.value = { r, c };
    wsIsDragging.value = true;
  }
};
const handleWSMouseEnter = (r: number, c: number) => {
  if (wsIsDragging.value) wsSelectionEnd.value = { r, c };
};
const handleWSTouchStart = (e: TouchEvent, r: number, c: number) => {
  if (e.cancelable) e.preventDefault();
  handleWSMouseDown(r, c);
};
const handleWSTouchMove = (e: TouchEvent) => {
  if (!wsIsDragging.value) return;
  if (e.cancelable) e.preventDefault();
  const touch = e.touches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
  if (elem && elem.classList.contains('ws-cell')) {
    const r = parseInt(elem.getAttribute('data-r') || '-1');
    const c = parseInt(elem.getAttribute('data-c') || '-1');
    if (r !== -1 && c !== -1) {
      wsSelectionEnd.value = { r, c };
    }
  }
};
const handleWSMouseUp = () => {
  if (!wsSelectionStart.value || !wsSelectionEnd.value) {
    wsIsDragging.value = false;
    return;
  }
  
  const start = wsSelectionStart.value;
  const end = wsSelectionEnd.value;

  // Don't check if it's the same cell (might be just the first tap)
  if (start.r === end.r && start.c === end.c && wsIsDragging.value) {
    // Allow it to stay as a single-tap start state
    wsIsDragging.value = false;
    return;
  }
  
  // Convert grid coordinates to Shadify 1-indexed X-Y
  const sX = start.c + 1;
  const sY = start.r + 1;
  const eX = end.c + 1;
  const eY = end.r + 1;
  
  const matchedWord = puzzleData.value.words.find((w: any) => {
    return (w.position.start[0] === sX && w.position.start[1] === sY && w.position.end[0] === eX && w.position.end[1] === eY) ||
           (w.position.start[0] === eX && w.position.start[1] === eY && w.position.end[0] === sX && w.position.end[1] === sY);
  });
  
  if (matchedWord) {
    if (!foundWSWords.value.includes(matchedWord.word)) {
      foundWSWords.value.push(matchedWord.word);
      feedback.value = `DISCOVERED: ${matchedWord.word.toUpperCase()}!`;
      feedbackType.value = 'success';
      if (foundWSWords.value.length === puzzleData.value.words.length) {
        feedback.value = 'CIPHER FULLY DECRYPTED!';
      }
    }
  } else if (wsIsDragging.value || (start.r !== end.r || start.c !== end.c)) {
     // If it wasn't a match and we weren't just clicking the start cell
     feedback.value = 'NO TERM IN THIS ALIGNMENT.';
     feedbackType.value = 'error';
  }
  
  wsSelectionStart.value = null;
  wsSelectionEnd.value = null;
  wsIsDragging.value = false;
};
const isWSSelecting = (r: number, c: number) => {
  if (!wsSelectionStart.value || !wsSelectionEnd.value) return false;
  const s = wsSelectionStart.value;
  const e = wsSelectionEnd.value;
  
  // Check if (r, c) is on the line between s and e
  const rowDiff = e.r - s.r;
  const colDiff = e.c - s.c;
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  if (steps === 0) return r === s.r && c === s.c;
  
  // Only allow horizontal, vertical, or 45-deg diagonal
  if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) return false;
  
  for (let i = 0; i <= steps; i++) {
    const currR = s.r + Math.round((rowDiff / steps) * i);
    const currC = s.c + Math.round((colDiff / steps) * i);
    if (currR === r && currC === c) return true;
  }
  return false;
};
const isWSFound = (r: number, c: number) => {
  if (!puzzleData.value) return false;
  return puzzleData.value.words.some((w: any) => {
    if (!foundWSWords.value.includes(w.word)) return false;
    const s = { x: w.position.start[0] - 1, y: w.position.start[1] - 1 };
    const e = { x: w.position.end[0] - 1, y: w.position.end[1] - 1 };
    
    const rowDiff = e.y - s.y;
    const colDiff = e.x - s.x;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    
    for (let i = 0; i <= steps; i++) {
      const currR = s.y + Math.round((rowDiff / steps) * i);
      const currC = s.x + Math.round((colDiff / steps) * i);
      if (currR === r && currC === c) return true;
    }
    return false;
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700;900&family=UnifrakturMaguntia&display=swap');

.newspaper-page { --background: #f4ecd8; }
.vintage-toolbar { --background: #f4ecd8; --color: #1a1a1a; --border-bottom: 2px solid #1a1a1a; font-family: 'Old Standard TT', serif; font-weight: bold; }
.newspaper-content { --background: transparent; background-color: #f4ecd8; position: relative; }

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

.games-layout {
  padding: 0 15px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.masthead {
  padding: calc(env(safe-area-inset-top, 0px) + 20px) 15px 10px;
  text-align: center;
  color: #1a1a1a;
  background: transparent;
  border-bottom: 5px double #222;
  margin-bottom: 30px;
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
  text-transform: uppercase;
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
  justify-content: center;
  font-family: 'Old Standard TT', serif;
  font-size: 0.7rem;
  font-weight: 700;
  border-top: 1px solid #222;
  padding-top: 5px;
  margin-top: 5px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 30px;
}

.game-article {
  cursor: pointer;
  position: relative;
}

.article-inner {
  padding: 15px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.2s ease;
}

.game-article:hover .article-inner {
  background: rgba(255, 255, 255, 0.5);
}

.game-icon-container {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #1a1a1a;
  text-align: center;
}

.game-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: #000;
  text-align: center;
  margin: 5px 0 10px;
  text-transform: uppercase;
  border-bottom: 1px solid #1a1a1a;
}

.game-desc {
  font-family: 'Old Standard TT', serif;
  font-size: 1rem;
  line-height: 1.4;
  color: #333;
  text-align: justify;
  flex: 1;
  margin-bottom: 15px;
}

.article-separator-mini {
  height: 3px;
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
  margin-bottom: 10px;
}

.play-link {
  font-family: 'Old Standard TT', serif;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  text-align: right;
  color: #1a1a1a;
}

/* Modal UI */
.modal-wrapper { height: 100%; background: #f4ecd8; display: flex; flex-direction: column; position: relative; }
.instruction-wrapper { justify-content: center; padding: 20px; }
.instruction-content { background: #fffdf7; border: 2px solid #1a1a1a; padding: 40px; max-width: 500px; width: 100%; margin: 0 auto; box-shadow: 20px 20px 0px rgba(0,0,0,0.1); position: relative; z-index: 10; z-index: 2; }
.newspaper-masthead-mini { text-align: center; margin-bottom: 20px; }
.game-instruction-title { font-family: 'UnifrakturMaguntia', cursive; font-size: 2.2rem; text-align: center; margin-bottom: 20px; color: #1a1a1a; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
.instruction-body { font-family: 'Old Standard TT', serif; font-size: 1.1rem; line-height: 1.6; color: #333; margin-bottom: 40px; text-align: center; font-style: italic; }
.instruction-actions { display: flex; flex-direction: column; gap: 10px; }

.game-play-area { display: flex; flex-direction: column; align-items: center; padding: 20px 0; min-height: 80vh; justify-content: flex-start; }
.game-ui { width: 100%; display: flex; justify-content: center; }
.puzzle-card { background: #fffdf7; border: 4px double #1a1a1a; padding: 10px; width: 100%; max-width: 650px; box-shadow: 10px 10px 0px #1a1a1a; margin: 0 auto; display: flex; flex-direction: column; min-height: 600px; }
.old-font { font-family: 'Old Standard TT', serif; font-weight: bold; text-transform: uppercase; }

/* Mines */
.mines-grid { display: grid; border: 2px solid #1a1a1a; background: #1a1a1a; gap: 1px; width: 100%; margin: 20px 0; }
.mines-cell { background: #f4ecd8; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Old Standard TT', serif; font-weight: 900; font-size: 1.5rem; }
.mines-cell.revealed { background: #fffdf7; }

/* Set Game */
.instructions-panel { border-bottom: 1px dashed #1a1a1a; padding-bottom: 15px; margin-bottom: 20px; }
.instructions-text { font-family: 'Old Standard TT', serif; font-size: 0.9rem; line-height: 1.4; color: #444; font-style: italic; }
.set-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 10px 0; }
.set-item { border: 1px solid #1a1a1a; padding: 15px 5px; background: #fffdf7; cursor: pointer; position: relative; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 2px 2px 0 #1a1a1a; }
.set-item:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 #1a1a1a; }
.set-item.selected { background: #1a1a1a; }
.set-item.selected .set-shape { color: #fffdf7; }
.set-item.selected .card-id-mark { color: #fffdf7; border-color: #fffdf7; }
.set-card-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.set-shape-wrapper { width: 45px; height: 18px; display: flex; align-items: center; justify-content: center; }
.set-shape { width: 100%; height: 100%; border: 2px solid currentColor; box-sizing: border-box; }
.set-shape.diamond { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
.set-shape.oval { border-radius: 20px; }
.set-shape.squiggle { border-radius: 5px; transform: skewX(15deg); }
.card-id-mark { position: absolute; top: 2px; left: 2px; font-size: 0.6rem; font-family: 'Old Standard TT', serif; border: 1px solid #1a1a1a; padding: 0 2px; }
.red { color: #c62828; } .green { color: #2e7d32; } .purple { color: #673ab7; }
.solid { background-color: currentColor; } .open { background: transparent; } .striped { background: repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px); }

/* Camp Game */
.camp-content { display: flex; flex-direction: column; align-items: center; margin: 20px 0; }
.camp-middle { display: flex; align-items: center; }
.col-hints, .row-hints { display: flex; font-family: 'Old Standard TT', serif; font-weight: 900; }
.col-hints { margin-left: 30px; }
.row-hints { flex-direction: column; width: 30px; }
.hint-cell { width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; }
.camp-grid { display: grid; border: 2px solid #1a1a1a; background: #1a1a1a; gap: 1px; }
.camp-row { display: flex; }
.camp-cell { width: 35px; height: 35px; background: #fffdf7; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.tree-icon { color: #2e7d32; font-size: 1.5rem; }
.tent-icon { color: #c62828; font-size: 1.5rem; }

/* Shared */
.game-actions { margin-top: 20px; }
.vintage-button { --background: #1a1a1a; --color: #f4ecd8; --border-radius: 0; font-family: 'Old Standard TT', serif; font-weight: 900; height: 50px; box-shadow: 4px 4px 0 #1a1a1a; }
.feedback { margin-top: 20px; padding: 10px; text-align: center; font-family: 'Old Standard TT', serif; font-weight: 900; border: 1px dashed #1a1a1a; }
.success { color: #2e7d32; background: #e8f5e9; }
.error { color: #c62828; background: #ffebee; }

/* Sudoku / Memory */
.sudoku-grid { display: grid; border: 2px solid #1a1a1a; width: 100%; aspect-ratio: 1; margin: 20px 0; }
.sudoku-row { display: flex; flex: 1; }
.sudoku-cell { flex: 1; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-family: 'Old Standard TT', serif; font-weight: 900; cursor: pointer; }
.memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; margin: 20px 0; }
.memory-cell { aspect-ratio: 1; cursor: pointer; }
.memory-inner { position: relative; width: 100%; height: 100%; transition: transform 0.4s; transform-style: preserve-3d; border: 2px solid #1a1a1a; }
.memory-cell.flipped .memory-inner { transform: rotateY(180deg); }
.memory-front, .memory-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.memory-front { background: #1a1a1a; color: white; }
.memory-back { background: #fffdf7; transform: rotateY(180deg); }

.scrambled-word { font-family: 'Playfair Display', serif; font-size: 2.5rem; text-align: center; margin: 10px 0 20px; color: #000; font-weight: 900; line-height: 1.1; min-height: 3rem; display: flex; align-items: center; justify-content: center; }
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap:10px; flex: 1; align-content: flex-start; }

/* Anagram Specific */
.anagram-card { max-width: 650px; min-height: 650px; }
.anagram-progress { text-align: center; margin-bottom: 15px; border-bottom: 1px solid #1a1a1a; padding-bottom: 5px; }
.found-words-scroll { height: 150px; max-height: 150px; overflow-y: auto; border: 1px solid #ddd; background: #f9f9f9; padding: 10px; margin-bottom: 20px; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05); flex-shrink: 0; }
.found-words-list { display: flex; flex-wrap: wrap; gap: 8px; }
.found-word { font-family: 'Old Standard TT', serif; font-weight: bold; text-transform: lowercase; background: #fff; border: 1px solid #1a1a1a; padding: 2px 8px; font-size: 0.9rem; }

/* Wordsearch UI */
.wordsearch-grid { display: grid; border: 2px solid #1a1a1a; background: #1a1a1a; gap: 1px; width: 100%; aspect-ratio: 1; margin: 20px 0; user-select: none; touch-action: none; }
.ws-cell { background: #fffdf7; display: flex; align-items: center; justify-content: center; font-family: 'Old Standard TT', serif; font-weight: 900; font-size: 1.4rem; cursor: pointer; text-transform: uppercase; transition: all 0.1s; }
.ws-cell:hover { background: #f4ecd8; }
.ws-start { background: #1a1a1a !important; color: #f4ecd8; outline: 2px solid #1a1a1a; }
.ws-selecting { background: #1a1a1a !important; color: #f4ecd8; opacity: 0.8; }
.ws-found { background: #fdf2d2; color: #1a1a1a; position: relative; }
.ws-found::after { content: ''; position: absolute; width: 80%; height: 80%; border: 1px solid #1a1a1a; border-radius: 50%; opacity: 0.3; }

.word-list-ws { margin-top: 15px; border-top: 1px dashed #1a1a1a; padding-top: 10px; }
.ws-terms-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.ws-term { font-family: 'Old Standard TT', serif; font-size: 0.85rem; padding: 2px 6px; border: 1px solid transparent; text-transform: uppercase; }
.term-found { text-decoration: line-through; opacity: 0.4; color: #2e7d32; font-style: italic; }

.flag-container { margin: 15px 0; display: flex; justify-content: center; }
.vintage-flag { max-width: 180px; height: auto; border: 3px solid #1a1a1a; padding: 5px; background: #fff; box-shadow: 4px 4px 0 #1a1a1a; filter: sepia(0.2) contrast(1.1); }
.option-button { --border-radius: 0; --border-width: 1px; --border-color: #1a1a1a; font-family: 'Old Standard TT', serif; font-weight: bold; height: 50px; margin-bottom: 5px; }
</style>
