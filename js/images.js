// Replace broken images with a labelled placeholder; the credit caption stays in place.

export function attachImageFallbacks(root = document) {
  for (const img of root.querySelectorAll('img')) {
    const replace = () => {
      const isLogo = img.classList?.contains('pub-logo');
      const el = root.createElement(isLogo ? 'span' : 'div');
      el.className = isLogo ? 'pub-logo pub-logo--text' : 'photo-placeholder';
      el.textContent = img.dataset.fallbackText || img.alt;
      img.replaceWith(el);
    };
    if (img.complete && img.naturalWidth === 0) replace();
    else img.addEventListener('error', replace);
  }
}
