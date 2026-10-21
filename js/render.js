import { ventureLogos } from './data.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ROLE_LABEL = { first: 'First author', corresponding: 'Corresponding author', 'co-author': 'Co-author' };

function renderLogo(key) {
  const l = ventureLogos[key];
  if (!l) return `<span class="pub-logo pub-logo--text">${esc(key)}</span>`;
  if (!l.file) return `<span class="pub-logo pub-logo--text">${esc(l.fallbackText)}</span>`;
  return `<img class="pub-logo pub-logo--${esc(key)}" src="${esc(l.file)}" alt="${esc(l.name)}" loading="lazy" data-fallback-text="${esc(l.fallbackText)}">`;
}

export function renderPublication(p) {
  const badge = p.award ? `<span class="badge badge--award">${esc(p.award)}</span>` : '';
  const doi = p.doi
    ? `<a class="pub-doi" href="https://doi.org/${esc(p.doi)}" rel="noopener">DOI ${esc(p.doi)}</a>`
    : '';
  const logos = (p.logos ?? []).length ? `<div class="pub-logos">${p.logos.map(renderLogo).join('')}</div>` : '';
  return `<article class="pub paper-card" data-reveal>
  ${logos}
  <h4 class="pub-title">${esc(p.title)}</h4>
  <p class="pub-meta">${esc(p.venue)} · ${esc(ROLE_LABEL[p.role] ?? p.role)} · ${esc(p.status)}</p>
  ${badge}${doi}
</article>`;
}

export const renderPublications = (list) => list.map(renderPublication).join('\n');

export const publicationCountLabel = (list) => `${list.length} paper${list.length === 1 ? '' : 's'}`;
