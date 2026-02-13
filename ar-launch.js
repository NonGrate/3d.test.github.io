// AR launch logic for all pages
function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}
function openAR(model, isAuto = false) {
    const iosUrl = model + '.usdz';
    const androidUrl = window.location.origin + '/' + model + '.glb';
    if (isIOS()) {
        const a = document.createElement("a");
        a.setAttribute("rel", "ar");
        a.setAttribute("href", iosUrl);
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else if (isAndroid()) {
        const fileUrl = encodeURIComponent(androidUrl);
        // Use the current page as fallback to allow manual retry
        const fallback = encodeURIComponent(window.location.href + (window.location.search ? '&' : '?') + 'fallback=1');
        window.location.href =
          `intent://arvr.google.com/scene-viewer/1.0?file=${fileUrl}&mode=ar_preferred` +
          `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;` +
          `action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end;`;
    } else {
        alert("AR viewing is only supported on iOS and Android devices.");
    }
}
