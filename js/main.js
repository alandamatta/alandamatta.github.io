document.getElementById('loader').addEventListener('animationend', function (e) {
  if (e.animationName === 'loader-out') this.remove();
});

const loaderLetters = document.querySelector('.loader-letters');
const welcomeWords = [
  ['W','E','L','C','O','M','E'],
  ['B','I','E','N','V','E','N','U'],
  ['B','E','N','V','E','N','U','T','O'],
  ['B','E','M','V','I','N','D','O'],
  ['よ','う','こ','そ'],
  ['欢','迎'],
  ['환','영','합','니','다'],
];

const loaderContent = document.querySelector('.loader-content');
const loaderColorFilters = [
  '',                                     // green  (base — no filter)
  'saturate(0) brightness(1.56)',         // white
  'hue-rotate(171deg) brightness(1.1)',   // purple
  'hue-rotate(-71deg) brightness(1.05)',  // amber
];

function randomLoaderColor(exclude) {
  let i;
  do { i = Math.floor(Math.random() * loaderColorFilters.length); } while (i === exclude);
  return i;
}

let wordIndex = 1;
let lastColorIndex = 0;

function swapWelcome() {
  if (!loaderLetters) return;
  const letters = welcomeWords[wordIndex % welcomeWords.length];
  wordIndex++;
  loaderLetters.innerHTML = letters
    .map(l => `<span class="loader-circle-swap">${l}</span>`)
    .join('');
  lastColorIndex = randomLoaderColor(lastColorIndex);
  loaderContent.style.filter = loaderColorFilters[lastColorIndex];
}

setTimeout(() => {
  const id = setInterval(swapWelcome, 160);
  setTimeout(() => clearInterval(id), 1000);
}, 1700);

const themes = ['green', 'white', 'purple', 'amber'];
let themeIndex = themes.indexOf(localStorage.getItem('theme') ?? 'green');
if (themeIndex === -1) themeIndex = 0;
if (themeIndex !== 0) document.documentElement.dataset.theme = themes[themeIndex];

function cycleTheme() {
  themeIndex = (themeIndex + 1) % themes.length;
  const t = themes[themeIndex];
  if (t === 'green') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  localStorage.setItem('theme', t);
}

const shortcuts = {
  g: 'https://github.com/alandamatta',
  l: 'https://www.linkedin.com/in/alandamatta/',
  e: 'mailto:alandamatta@live.com',
};

const resumeCta = document.getElementById('resume-cta');

if (resumeCta) {
  resumeCta.addEventListener('click', async (e) => {
    if (resumeCta.classList.contains('is-loading')) { e.preventDefault(); return; }
    e.preventDefault();
    resumeCta.classList.add('is-loading');
    const start = performance.now();
    try {
      const res = await fetch(resumeCta.href, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.statusText);
      const blob = await res.blob();
      const elapsed = performance.now() - start;
      if (elapsed < 700) await new Promise(r => setTimeout(r, 700 - elapsed));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      window.location.href = resumeCta.getAttribute('href');
    } finally {
      resumeCta.classList.remove('is-loading');
    }
  });
}

const projectItems = [...document.querySelectorAll('.project-item')];
let activeProject = 0;

function setActiveProject(index) {
  projectItems.forEach((item, i) => {
    const on = i === index;
    item.classList.toggle('is-active', on);
    item.setAttribute('aria-selected', on);
  });
  activeProject = index;
}

setActiveProject(0);

const searchBar = document.getElementById('search-bar');
const searchInput = searchBar.querySelector('.search-input');
let searchOpen = false;
let prevActive = 0;

function visibleItems() {
  return projectItems.filter(item => !item.classList.contains('is-hidden'));
}

function navigateVisible(dir) {
  const visible = visibleItems();
  if (!visible.length) return;
  const cur = visible.indexOf(projectItems[activeProject]);
  setActiveProject(projectItems.indexOf(visible[(cur + dir + visible.length) % visible.length]));
}

function filterItems(query) {
  const q = query.toLowerCase().trim();
  let first = -1;
  projectItems.forEach((item, i) => {
    const name = item.querySelector('.project-name')?.textContent.toLowerCase() ?? '';
    const desc = item.querySelector('.project-desc')?.textContent.toLowerCase() ?? '';
    const match = !q || name.includes(q) || desc.includes(q);
    item.classList.toggle('is-hidden', !match);
    if (match && first === -1) first = i;
  });
  if (first !== -1) setActiveProject(first);
}

function openSearch() {
  prevActive = activeProject;
  searchOpen = true;
  searchBar.classList.add('is-open');
  searchBar.removeAttribute('aria-hidden');
  searchInput.value = '';
  searchInput.focus();
  filterItems('');
}

function closeSearch() {
  searchOpen = false;
  searchBar.classList.remove('is-open');
  searchBar.setAttribute('aria-hidden', 'true');
  projectItems.forEach(item => item.classList.remove('is-hidden'));
  setActiveProject(prevActive);
}

searchInput.addEventListener('input', () => filterItems(searchInput.value));

document.addEventListener('keydown', (e) => {
  const inSearch = e.target === searchInput;

  if (!inSearch && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey)) return;

  if (inSearch) {
    if (e.key === 'Escape')    { e.preventDefault(); closeSearch(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateVisible(1); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navigateVisible(-1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const href = projectItems[activeProject]?.dataset.href;
      if (href && href !== '#') window.open(href, '_blank');
      closeSearch();
    }
    return;
  }

  const n = projectItems.length;
  if (e.key === 'ArrowDown') { e.preventDefault(); setActiveProject((activeProject + 1) % n); return; }
  if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveProject((activeProject - 1 + n) % n); return; }
  if (e.key === 'Enter') {
    const href = projectItems[activeProject]?.dataset.href;
    if (href && href !== '#') window.open(href, '_blank');
    return;
  }
  if (e.key === ':') { e.preventDefault(); openSearch(); return; }
  if (e.key === 't') { cycleTheme(); return; }
  if (e.key === 'r' && resumeCta) { e.preventDefault(); resumeCta.click(); return; }

  const url = shortcuts[e.key.toLowerCase()];
  if (url) window.open(url, url.startsWith('mailto') ? '_self' : '_blank');
});
