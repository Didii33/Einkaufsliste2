This Project is made for Mobile device users.

Create an Account, every Family member can login with this account and see the same items.

Einkaufsliste PWA
Eine mobile Einkaufsliste als Progressive Web App (PWA) mit Login, Menüs und Rezepten.
Optimiert für die Nutzung auf dem Handy und installierbar wie eine App über den Browser.

Features
Login und Registrierung mit Firebase Auth
Einkaufsliste mit Abhaken, Bearbeiten und Löschen
Menüs verwalten und Produkte in die Einkaufsliste übernehmen
Rezepte verwalten und in Menüs kopieren
Link-Sammlungen für Menüs und Rezepte
Einstellungen mit Synchronisieren-Button für die neueste Version
Für mobile Nutzung optimierte Navigation
Tech Stack
React + TypeScript
Firebase (Auth + Firestore)
Create React App
GitHub Pages Deployment
Lokale Entwicklung
npm install
npm start
Die App läuft dann unter http://localhost:3000.

Build
npm run build
Deployment (GitHub Pages)
npm run deploy
Hinweis: Deploy läuft über den gh-pages-Branch, der Build wird automatisch erstellt und veröffentlicht.

Nutzung als Handy-App
Website öffnen
Im Browser „Zum Home-Bildschirm hinzufügen“ wählen
App wie eine normale Handy-App starten
Update-Sync auf dem Handy
Falls eine alte Version angezeigt wird:

In der App zu ⚙️ Einstellungen gehen
Jetzt synchronisieren drücken
Dadurch werden Cache/Service-Worker bereinigt und die neueste Version geladen

Menü aus Instagram-Video
Im Tab „Menüs“ einen Instagram-Link einfügen → „Menü erstellen“. Die KI liest die Videobeschreibung und legt ein Menü an: Zutaten als Produkte, Zubereitung und der Link zum Video.
Steht das Rezept nicht in der Beschreibung oder kann sie nicht gelesen werden: „Text einfügen“ und die Beschreibung von Hand reinkopieren.

Einrichtung (einmalig)
1. Cloudflare Dashboard → Workers & Pages → Create → Worker, Name z. B. „rezept“
2. Code aus rezept-worker/worker.js einfügen → Deploy
3. Worker → Settings → Variables and Secrets → Secret ANTHROPIC_API_KEY (von console.anthropic.com)
4. Optional: Variable ALLOWED_EMAILS = deine E-Mail(s), damit nur du den Import nutzen kannst
5. Worker-URL in src/recipeApi.ts eintragen → npm run deploy
