# neocompany — static site (Vite `dist` only)

This branch/repo contains **only the production front-end build** (no source).

- Full project backup on disk: `../WEBSITE-SM-SOURCE-BACKUP`

Rebuild and replace with:

```bash
# from your full project folder (backup copy):
cd frontend && npm ci && npm run build
# then copy dist contents here (repo root) and commit
```
