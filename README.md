# GeoPic 🌍📸

**Mobilna aplikacja społecznościowa typu PWA** umożliwiająca użytkownikom udostępnianie zdjęć wraz z automatycznie zapisaną lokalizacją GPS miejsca wykonania fotografii. Inspirowana stylem Instagrama, z ciemnym motywem i gradientowymi akcentami.

🔗 **Live demo:** [xdziuba.github.io/GeoPic](https://xdziuba.github.io/GeoPic/)

---

## ✨ Funkcjonalności

- 📸 **Dodawanie zdjęć** z aparatu lub galerii z automatycznym zapisem lokalizacji GPS
- 🗺️ **Mapa lokalizacji** dla każdego posta (Leaflet + OpenStreetMap)
- 🔄 **Reverse geocoding** — GPS zamieniane na czytelny adres (Nominatim API)
- 👤 **System logowania** — email/hasło + Google OAuth
- ❤️ **Lajki i komentarze** pod postami
- 🌙 **Dark theme** w stylu Instagrama z gradientami `#2c84f9 → #9b60f0`
- 📱 **Responsywny design** — ten sam wygląd na mobile i desktopie
- 🔔 **Toast notifications** dla akcji użytkownika
- 📲 **PWA** — można zainstalować jako aplikację mobilną, działa offline
- ✋ **Wibracje** (haptic feedback) na urządzeniach mobilnych

---

## 🛠️ Stack technologiczny

| Warstwa | Technologia |
|---|---|
| **Frontend** | Vue 3 (CDN) + Bootstrap 5 |
| **Styl** | Custom CSS (zmienne CSS, animacje, dark theme) |
| **Mapy** | Leaflet + OpenStreetMap |
| **Geocoding** | Nominatim API (OpenStreetMap) |
| **Backend** | Firebase (Firestore + Storage + Auth) |
| **PWA** | Service Worker + Web Manifest |
| **Hosting** | GitHub Pages |

---

## 📁 Struktura projektu

```
GeoPic/
├── index.html              # Główny plik aplikacji (Vue template)
├── manifest.json           # Manifest PWA
├── README.md               # Ten plik
│
├── assets/                 # Ikony aplikacji (favicon, PWA icons)
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── favicon.ico
│
├── docs/                   # Dokumentacja projektu
│   └── use_case_diagram.pdf
│
└── src/
    ├── css/
    │   └── style.css       # Style aplikacji (dark theme, animacje, layout)
    │
    └── js/
        ├── app.js          # Logika aplikacji (Vue, Firebase, geolokalizacja)
        ├── firebase-config.js  # Konfiguracja Firebase
        └── service-worker.js   # Service Worker (cache, offline support)
```

---

### Uruchomienie przez VS Code

Zainstaluj rozszerzenie **Live Server** → prawy klik na `index.html` → "Open with Live Server".

---

## 🔥 Konfiguracja Firebase

Aplikacja korzysta z trzech usług Firebase:

| Usługa | Do czego | Plik |
|---|---|---|
| **Firestore** | Posty, komentarze, polubienia | [`src/js/app.js`](src/js/app.js) |
| **Storage** | Zdjęcia użytkowników | [`src/js/app.js`](src/js/app.js) |
| **Authentication** | Logowanie email/hasło + Google | [`src/js/app.js`](src/js/app.js) |

Aby uruchomić aplikację z własnym backendem:

1. Stwórz projekt na [Firebase Console](https://console.firebase.google.com/)
2. Włącz **Authentication** (Email/Password + Google), **Firestore Database** i **Storage**
3. Skopiuj configa Firebase i podstaw w [`src/js/firebase-config.js`](src/js/firebase-config.js):

```js
const firebaseConfig = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "TWOJ_PROJECT.firebaseapp.com",
  projectId: "TWOJ_PROJECT",
  storageBucket: "TWOJ_PROJECT.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

4. Dodaj domenę (np. `localhost`, `xdziuba.github.io`) do **Authorized domains** w sekcji Authentication

---

## 📱 PWA — instalacja na telefonie

GeoPic to **Progressive Web App**, co oznacza, że można zainstalować ją na telefonie jak natywną aplikację:

- **Android (Chrome):** Otwórz live demo → menu (⋮) → "Dodaj do ekranu głównego"
- **iOS (Safari):** Otwórz live demo → przycisk Udostępnij (📤) → "Dodaj do ekranu początkowego"

Po instalacji aplikacja:
- Ma własną ikonę
- Działa w trybie pełnoekranowym (bez paska przeglądarki)
- Cache'uje zasoby przez Service Worker (działa częściowo offline)

---

## 🎨 Design

Główne kolory:

| Kolor | Wartość | Zastosowanie |
|---|---|---|
| Tło | `#0a0a0a` | Główne tło aplikacji |
| Karta | `#161616` | Tła postów, modali, formularzy |
| Akcent gradient | `#2c84f9 → #9b60f0` | Logo, przyciski CTA, awatary |
| Tekst | `#f5f5f5` | Główny kolor tekstu |
| Tekst muted | `#a0a0a0` | Daty, lokalizacje, podpisy |

---

## 📋 Dokumentacja

- [Diagram przypadków użycia (PDF)](docs/use_case_diagram.pdf) — UML use case diagram
- [Prototyp Figma](#) — (https://www.figma.com/proto/paWRvWJlMDEwWYmC3qTsut/GeoPic?node-id=0-1&t=f871U2Y3bMkIGFA9-1)

---

## 👥 Autorzy

| Autor | Indeks |
|---|---|
| **Paweł Dziuba** | 233812 |
| **Mikołaj Bębenek** | 234200 |

---

## 📝 Licencja

Projekt edukacyjny stworzony w ramach zajęć akademickich.
