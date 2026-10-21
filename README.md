# minhquang.dev

One-page portfolio for Nguyen Minh Quang. Static HTML, CSS and vanilla JS; no build step.

## Preview

    python3 -m http.server 8000   # then open http://localhost:8000/

All local URLs are document-relative, so opening `index.html` straight from disk shows the styled page. Browsers block ES modules on `file://`, so the publication list and scroll effects only run through a server (as above) or on the live site.

## Tests

    npm test                      # Node 20+, no dependencies

## Add a publication

Append an object to `publications` in `js/data.js` (fields: `id`, `title`, `venue`, `role`, `status`, `year`, optional `doi`, `award`, `logos`). The card and the paper count update on their own.

## Add or replace a photo

Put the file in `assets/img/`, reference it from a `<figure class="photo">` in `index.html` with `alt` text and a `<figcaption class="credit">` that starts with `Photo:` or `Source:` (the tests enforce this).

## Deploy

GitHub Pages serves the repo root from `main`. The custom domain is set by `CNAME` (`minhquang.dev`) and Cloudflare DNS: four apex A records (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a `www` CNAME to `<user>.github.io`. Keep the Cloudflare proxy off (DNS only) until GitHub has issued the HTTPS certificate.
