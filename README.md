# YOKAI JAPAN — Custom Code

Custom JavaScript for the YOKAI JAPAN Webflow site.

## Structure

```
src/           → Readable source files (edit these)
dist/          → Minified output (served via jsDelivr CDN)
build.js       → Build script
```

## Setup

```bash
npm install
npm run build
```

## Webflow Integration

All custom code in Webflow's **Page Settings → Before </body>** is replaced with CDN links pointing to this repo. See the Webflow snippet in the project docs.

## Workflow

1. Edit files in `src/`
2. Run `npm run build`
3. Commit and push
4. Site updates automatically via jsDelivr CDN

## Versioning

- `@latest` — always serves newest push (use for testing)
- `@v1.0.0` — tagged release (use for production stability)
