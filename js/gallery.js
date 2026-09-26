const grid = document.getElementById('gallery-grid');
const count = document.getElementById('gallery-count');
const search = document.getElementById('gallery-search');
const empty = document.getElementById('gallery-empty');
const fatalError = document.getElementById('fatal-error');

let pool = [];
let brokenCount = 0;

async function loadManifest() {
  let response;
  try {
    response = await fetch('manifest.json', { cache: 'no-store' });
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
  render();
}

function showFatalError(message) {
  fatalError.textContent = message;
  fatalError.hidden = false;
}

function updateCount() {
  const broken = brokenCount > 0 ? ` · битых: ${brokenCount}` : '';
  count.textContent = `📸 ${pool.length} фото${broken}`;
}

function render() {
  grid.innerHTML = '';
  brokenCount = 0;
  updateCount();
  if (pool.length === 0) {
    empty.textContent = 'Фото ещё нет — добавь их в photos/ и запушь.';
    empty.hidden = false;
    return;
  }
  pool.forEach((person) => {
    const card = document.createElement('figure');
    card.className = 'gallery-card';
    card.dataset.search = `${person.name} ${person.file}`.toLowerCase();

    const photo = document.createElement('div');
    photo.className = 'card-photo';
    const img = document.createElement('img');
    img.src = `photos/${person.file}`;
    img.alt = person.name;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      const box = document.createElement('div');
      box.className = 'placeholder-box';
      box.textContent = '📷';
      img.replaceWith(box);
      card.classList.add('gallery-card--broken');
      brokenCount += 1;
      updateCount();
    });
    photo.appendChild(img);

    const caption = document.createElement('figcaption');
    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = person.name;
    const file = document.createElement('span');
    file.className = 'gallery-file';
    file.textContent = person.file;
    caption.append(name, file);

    card.append(photo, caption);
    grid.appendChild(card);
  });
  applyFilter();
}

function applyFilter() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  grid.querySelectorAll('.gallery-card').forEach((card) => {
    const match = card.dataset.search.includes(query);
    card.hidden = !match;
    if (match) visible += 1;
  });
  if (pool.length > 0) {
    empty.textContent = 'Никого не нашлось.';
    empty.hidden = visible > 0;
  }
}

search.addEventListener('input', applyFilter);

loadManifest();
