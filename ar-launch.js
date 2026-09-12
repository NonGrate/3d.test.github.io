function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function openAR(model) {
  if (isIOS()) {
    const link = document.createElement('a');
    link.rel = 'ar';
    link.href = new URL(`${model}.usdz`, window.location.href).href;

    // Safari requires an image inside the link to launch AR Quick Look.
    const image = document.createElement('img');
    image.alt = '';
    link.appendChild(image);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  if (isAndroid()) {
    const modelUrl = encodeURIComponent(new URL(`${model}.glb`, window.location.href).href);
    const fallbackUrl = encodeURIComponent(window.location.href);
    window.location.href = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_preferred`
      + '#Intent;scheme=https;package=com.google.android.googlequicksearchbox;'
      + `action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end;`;
  }
}

function setupLauncher() {
  const supported = isIOS() || isAndroid();
  const message = document.getElementById('deviceMessage');
  const buttons = document.querySelectorAll('[data-native-ar]');

  if (message) {
    message.textContent = supported
      ? 'Ready. Choose a model below.'
      : 'Native AR needs an iPhone, iPad, or Android device. The library previews can still be opened here.';
    message.classList.toggle('device-warning', !supported);
  }

  buttons.forEach((button) => {
    button.disabled = !supported;
    button.addEventListener('click', () => openAR(button.dataset.nativeAr));
  });
}

document.addEventListener('DOMContentLoaded', setupLauncher);
