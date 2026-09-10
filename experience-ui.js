const pages = [
  'Move slowly and keep a clear area around you while testing the AR scene.',
  'After placement, move the phone left and right and physically walk around the model.',
  'Watch whether the model drifts, jumps, changes scale, or loses its original position.'
];

let pageIndex = 0;
let speaking = false;

const pageText = document.querySelector('[data-page-text]');
const pageCount = document.querySelector('[data-page-count]');
const previousButton = document.querySelector('[data-page-previous]');
const nextButton = document.querySelector('[data-page-next]');
const audioButton = document.querySelector('[data-audio-restart]');

function renderPage() {
  pageText.textContent = pages[pageIndex];
  pageCount.textContent = `${pageIndex + 1} / ${pages.length}`;
  previousButton.disabled = pageIndex === 0;
  nextButton.disabled = pageIndex === pages.length - 1;
}

function restartAudio() {
  if (!('speechSynthesis' in window)) {
    audioButton.textContent = 'Audio unavailable';
    audioButton.disabled = true;
    return;
  }

  window.speechSynthesis.cancel();
  const narration = new SpeechSynthesisUtterance(pages[pageIndex]);
  narration.rate = 0.95;
  narration.onstart = () => {
    speaking = true;
    audioButton.textContent = 'Restart audio';
  };
  narration.onend = narration.onerror = () => {
    speaking = false;
    audioButton.textContent = 'Play audio again';
  };
  window.speechSynthesis.speak(narration);
}

previousButton.addEventListener('click', () => {
  pageIndex = Math.max(0, pageIndex - 1);
  if (speaking) window.speechSynthesis.cancel();
  renderPage();
});

nextButton.addEventListener('click', () => {
  pageIndex = Math.min(pages.length - 1, pageIndex + 1);
  if (speaking) window.speechSynthesis.cancel();
  renderPage();
});

audioButton.addEventListener('click', restartAudio);
window.addEventListener('pagehide', () => window.speechSynthesis?.cancel());
renderPage();
