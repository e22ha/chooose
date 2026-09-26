import { Deck } from './deck.js';
import { PRESETS, validateCustomLabels, createPinState, clickChip, clickCard } from './labels.js';

const startScreen = document.getElementById('start-screen');
const roundScreen = document.getElementById('round-screen');
const poolStatus = document.getElementById('pool-status');
const presetSelect = document.getElementById('preset-select');
const customInputs = document.getElementById('custom-inputs');
const startButton = document.getElementById('start-button');
const startError = document.getElementById('start-error');
const chipRow = document.getElementById('chip-row');
const cardsRow = document.getElementById('cards-row');
const nextButton = document.getElementById('next-button');
const changeModeButton = document.getElementById('change-mode-button');
const fatalError = document.getElementById('fatal-error');

let pool = [];
let deck = null;
let activeLabels = null; // array of 3 strings, or null for "no labels"
let pinState = createPinState();

PRESETS.forEach((preset, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = preset.name;
  presetSelect.appendChild(option);
});

function updateModeVisibility() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  customInputs.style.display = mode === 'custom' ? 'block' : 'none';
  presetSelect.style.display = mode === 'preset' ? 'inline-block' : 'none';
}
document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', updateModeVisibility);
});
updateModeVisibility();

async function loadManifest() {
  let response;
  try {
    response = await fetch('manifest.json');
  } catch (err) {
    showFatalError(
      'Не удалось загрузить manifest.json. Открой страницу через локальный сервер ' +
        '(например, python3 -m http.server), а не напрямую файлом.',
    );
    return;
  }
  if (!response.ok) {
    showFatalError(`Не удалось загрузить manifest.json (HTTP ${response.status}).`);
    return;
  }
  pool = await response.json();
  updatePoolStatus();
}

function updatePoolStatus() {
  if (pool.length === 0) {
    poolStatus.textContent = 'Фото ещё нет — добавь их в photos/ и запушь.';
    startButton.disabled = true;
  } else if (pool.length < 3) {
    poolStatus.textContent = `Нужно минимум 3 фото, сейчас: ${pool.length}.`;
    startButton.disabled = true;
  } else {
    poolStatus.textContent = `Фото в пачке: ${pool.length}.`;
    startButton.disabled = false;
  }
}

function showFatalError(message) {
  fatalError.textContent = message;
  fatalError.hidden = false;
}

function showStartError(message) {
  startError.textContent = message;
  startError.hidden = false;
}

function clearStartError() {
  startError.hidden = true;
  startError.textContent = '';
}

startButton.addEventListener('click', () => {
  clearStartError();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  if (mode === 'preset') {
    activeLabels = PRESETS[Number(presetSelect.value)].labels;
  } else if (mode === 'custom') {
    const labels = validateCustomLabels(
      document.getElementById('custom-label-0').value,
      document.getElementById('custom-label-1').value,
      document.getElementById('custom-label-2').value,
    );
    if (!labels) {
      showStartError('Заполни все три лейбла.');
      return;
    }
    activeLabels = labels;
  } else {
    activeLabels = null;
  }

  deck = new Deck(pool);
  startScreen.hidden = true;
  roundScreen.hidden = false;
  drawNextTriple();
});

nextButton.addEventListener('click', drawNextTriple);

changeModeButton.addEventListener('click', () => {
  roundScreen.hidden = true;
  startScreen.hidden = false;
  deck = null;
});

function drawNextTriple() {
  pinState = createPinState();
  const triple = deck.next();
  renderCards(triple);
  renderChips();
}

function renderChips() {
  chipRow.innerHTML = '';
  if (!activeLabels) {
    return;
  }
  activeLabels.forEach((label) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = 'chip';
    const used = Object.values(pinState.pins).includes(label);
    const armed = pinState.armed === label;
    button.classList.toggle('chip--armed', armed);
    button.classList.toggle('chip--used', used && !armed);
    button.disabled = used && !armed;
    button.addEventListener('click', () => {
      pinState = clickChip(pinState, label);
      renderChips();
      renderCardLabels();
    });
    chipRow.appendChild(button);
  });
}

function renderCards(triple) {
  cardsRow.innerHTML = '';
  triple.forEach((person, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = `photos/${person.file}`;
    img.alt = person.name;
    img.addEventListener('error', () => {
      img.replaceWith(placeholderBox());
    });

    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = person.name;

    const pinnedLabel = document.createElement('div');
    pinnedLabel.className = 'card-pinned-label';

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(pinnedLabel);

    if (activeLabels) {
      card.addEventListener('click', () => {
        pinState = clickCard(pinState, index);
        renderChips();
        renderCardLabels();
      });
    }

    cardsRow.appendChild(card);
  });
  renderCardLabels();
}

function renderCardLabels() {
  cardsRow.querySelectorAll('.card').forEach((card, index) => {
    const labelEl = card.querySelector('.card-pinned-label');
    labelEl.textContent = pinState.pins[index] ?? '';
  });
}

function placeholderBox() {
  const box = document.createElement('div');
  box.className = 'placeholder-box';
  box.textContent = '📷';
  return box;
}

loadManifest();
