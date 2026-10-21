import { publications } from './data.js';
import { renderPublications, publicationCountLabel } from './render.js';

document.getElementById('publications').innerHTML = renderPublications(publications);
document.getElementById('pub-count').textContent = `· ${publicationCountLabel(publications)}`;

import { initMotion } from './motion.js';
initMotion();

import { attachImageFallbacks } from './images.js';
attachImageFallbacks();
