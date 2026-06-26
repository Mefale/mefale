---
name: run-mefale
description: Run, start, build, test, or screenshot the Distribuidora Graser Next.js app. Use when asked to launch the dev server, verify a UI change, check a route, or take a screenshot of any page.
---

# run-mefale

Next.js 15 / React 19 web app (Distribuidora Graser). Runs on port 3000 inside WSL (Ubuntu). Driver is `curl` for route checks and `chromium-cli` for full page screenshots. All commands run **inside WSL** via `wsl -d Ubuntu -- bash -c "..."` from Windows, or directly in a WSL terminal.

## Prerequisites

Node.js 18 is the WSL system default but **Next.js requires >= 20.9**. Use nvm (already installed) to switch:

```bash
source ~/.nvm/nvm.sh && nvm use 20
# confirms: Now using node v20.19.5
```

## Build

No pre-build step needed for dev. For production build:

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd /home/manchi/development/mefale
npm run build
```

## Run (agent path)

### Start the dev server

From PowerShell (Windows side), start as a background process:

```powershell
Start-Process -WindowStyle Hidden -FilePath "wsl" -ArgumentList "-d", "Ubuntu", "--", "bash", "-lc", "cd /home/manchi/development/mefale && source ~/.nvm/nvm.sh && nvm use 20 --silent && npm run dev > /tmp/nextjs-dev.log 2>&1"
Start-Sleep -Seconds 14
```

Verify it is up:

```powershell
wsl -d Ubuntu -- bash -c "cat /tmp/nextjs-dev.log | tail -5"
# Expected: ✓ Ready in ~1200ms
```

### Smoke-test routes

```powershell
$routes = @("/", "/products", "/admin", "/admin/offers", "/admin/products", "/cart")
foreach ($r in $routes) {
    $code = wsl -d Ubuntu -- curl -sL -o /dev/null -w "%{http_code}" "http://localhost:3000$r"
    Write-Host "$r -> $code"
}
# All should return 200
```

### Get page HTML (for title / content checks)

```powershell
wsl -d Ubuntu -- bash -c "curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'"
# <title>Distribuidora Graser | Materiales Electricos e Iluminacion</title>
```

### Screenshot a page (chromium-cli)

`chromium-cli` must be installed in WSL. If not: `sudo apt-get install -y chromium-browser`

```bash
# Inside WSL
chromium-browser --headless --disable-gpu --screenshot=/tmp/screenshot.png \
  --window-size=1280,900 http://localhost:3000/
# Copy result out:
cp /tmp/screenshot.png /mnt/c/Users/Manch/AppData/Local/Temp/screenshot.png
```

### Stop the dev server

```powershell
wsl -d Ubuntu -- bash -c "pkill -f 'next dev'; pkill -f 'next-server'; echo stopped"
```

## Run (human path)

Open a WSL terminal and:

```bash
source ~/.nvm/nvm.sh && nvm use 20
cd /home/manchi/development/mefale
npm run dev
# Open http://localhost:3000 in browser
# Ctrl+C to stop
```

## Key routes

| Route | What it is |
|---|---|
| `/` | Home — redirects to `/products` |
| `/products` | Public product catalog |
| `/cart` | Shopping cart + WhatsApp deep link |
| `/admin` | Admin login (redirects to `/admin/products` if authed) |
| `/admin/products` | Product CRUD |
| `/admin/offers` | Toggle product discounts |
| `/admin/import` | CSV/XLSX importer |

## Gotchas

- **Node 18 default breaks startup.** WSL has Node 18 on `PATH`. Next.js 16 requires >= 20.9. Always `source ~/.nvm/nvm.sh && nvm use 20` before any `npm run` command — or it exits immediately with no useful error.
- **Background processes don't survive between `wsl -d Ubuntu -- bash -c "..."` calls.** Each call spawns and immediately exits a shell, killing any `&` background child. Use `Start-Process -WindowStyle Hidden` from PowerShell to keep the process alive between tool calls.
- **`//wsl$/Ubuntu/...` paths are read-only via Bash tool.** Use `wsl -d Ubuntu -- ...` (PowerShell) or WSL terminal for writes. Reads work via the Read tool with `\\wsl$\Ubuntu\...` Windows UNC path.
- **Middleware deprecation warning.** Next.js 16 logs `The "middleware" file convention is deprecated — use "proxy" instead`. Safe to ignore; app still starts fine.
- **`/admin` redirects to login** if no session cookie — curl returns 200 on the login page, not a 401. Use a real browser or pass a valid session cookie to test authenticated routes.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `You are using Node.js 18.15.0. For Next.js, Node.js version ">=20.9.0" is required.` | `source ~/.nvm/nvm.sh && nvm use 20` |
| `/tmp/nextjs-dev.log` is empty / 0 bytes after `Start-Process` | The bash -c command didn't source nvm. Use `-lc` flag: `bash -lc "source ~/.nvm/nvm.sh && ..."` |
| `curl` exit 7 (connection refused) | Server not up yet. Wait 12–14s after start. Check log. |
| Port 3000 already in use | `wsl -d Ubuntu -- bash -c "lsof -ti:3000 | xargs kill -9"` |
