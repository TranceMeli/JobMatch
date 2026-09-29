# JobMatch


## Screenshots

![alt text](frontend/src/assets/screenshots/screen_1.png)
![alt text](frontend/src/assets/screenshots/screen_2.jpeg)
![alt text](frontend/src/assets/screenshots/screen_3.jpeg)

JobMatch ist eine zweiseitige Job-Matching-Plattform, die Arbeitssuchende und Unternehmen anhand ihrer Profile, Fähigkeiten, Präferenzen und Anforderungen zusammenbringt.

Dieses Projekt ist Open Source und wird aktiv weiterentwickelt. Issues, Pull Requests und Ideen sind willkommen – unabhängig von der jeweiligen Erfahrung.

## Idee

Anstatt sich bei jedem Unternehmen einzeln bewerben zu müssen, erstellen Arbeitssuchende ein wiederverwendbares Profil, das die typischerweise im Bewerbungsprozess benötigten Informationen enthält.

Unternehmen erstellen ebenfalls eigene Profile und definieren ihre Anforderungen, Erwartungen und Arbeitsbedingungen.

Die Plattform vergleicht beide Seiten und identifiziert passende Übereinstimmungen.

```text
Bewerberprofil
        │
        │
        ▼
   Matching-Engine
        ▲
        │
        │
Unternehmensprofil
        │
        ▼
  Übereinstimmung
```

Das Ziel besteht nicht nur darin, einen Matching-Score zu liefern, sondern auch nachvollziehbar zu machen, warum zwei Profile zueinander passen. Ein Match entsteht, wenn beide Seiten Interesse bekunden. Die konkrete Interaktion muss dabei nicht auf einem Swipe-Prinzip basieren – Swipen ist lediglich eine mögliche Benutzeroberfläche, um Interesse auszudrücken.

## Funktionen

* Kontosystem mit zwei Rollen: Admin (Unternehmen) und User (Arbeitssuchende). Bei der Registrierung wird immer ein User-Konto erstellt; das Admin-Konto wird über Seed-Daten angelegt.
* JWT-Authentifizierung: Kurzlebige Access-Tokens werden im Arbeitsspeicher des Clients gehalten. Langlebige Refresh-Tokens werden in einem rotierenden HttpOnly-Cookie gespeichert, einschließlich Erkennung einer erneuten Verwendung bereits verbrauchter Tokens.
* Detaillierte, bearbeitbare Profile mit Angaben zu Fähigkeiten, Erfahrungslevel, Gehaltsvorstellungen, Remote-Präferenzen, Verfügbarkeit, Links und weiteren Informationen.
* Vorschau des eigenen Profils nach dem Speichern mit der Möglichkeit, jederzeit zur Bearbeitung zurückzukehren.
* Swipe-Oberfläche zum Durchsuchen passender Stellenangebote oder Kandidaten.
* Match-Liste mit allen Profilen, die mit „Gefällt mir“ markiert wurden.
* Responsives Layout: Auf Mobilgeräten wird die verfügbare Breite genutzt, ab Tablet-Größe wird die Anwendung breiter und zentriert dargestellt.

## Technologie-Stack

**Frontend**

* React
* Vite
* react-tinder-card
* Material Symbols (Google Fonts) für Icons

**Backend**

* ASP.NET Core Web API auf .NET 10 mit Controller-basierter Architektur
* Entity Framework Core mit SQLite
* ASP.NET Core Identity für Benutzer und Rollen
* JWT-Access-Tokens und rotierende Refresh-Tokens (HttpOnly-Cookies mit Erkennung einer erneuten Verwendung)
* Swagger / OpenAPI

## Design

Farbpalette: [Color Hunt – F5F7F8, F4CE14, 495E57, 45474B](https://colorhunt.co/palette/f5f7f8f4ce14495e5745474b).

Interaktive Zustände wie Hover-Effekte, Farbabstufungen und barrierefreie Textvarianten werden durch HSL-Anpassungen aus der Basisfarbpalette abgeleitet, anstatt zusätzliche, unabhängig festgelegte Farben zu verwenden.

## Projektstruktur

```text
JobMatch/
├── backend/
│   ├── Program.cs
│   ├── Data/             # AppDbContext, DbSeeder
│   ├── SeedData/         # Demo-Profildaten für die angelegten Konten
│   ├── Entities/         # ApplicationUser, RefreshToken, Profile, Roles
│   ├── Auth/              # ITokenService, TokenService, JwtSettings
│   ├── Models/            # RegisterRequest, LoginRequest, AuthResponse
│   └── Controllers/       # AuthController, ProfileController, SecuredController
│
└── frontend/
    └── src/
        ├── components/    # Navbar, SwipeCard, TagInput, ToggleGroup, Icon, ...
        ├── pages/         # AuthForm, ProfileForm, ProfileCard, SwipeScreen, Matches
        ├── hooks/         # useBreakpoint
        ├── data/          # Mock-Daten für Stellenangebote und Kandidaten
        ├── api.js         # Access-Token im Arbeitsspeicher, Refresh über HttpOnly-Cookie
        └── App.jsx
```

## Erste Schritte

### Backend

```bash
cd backend
dotnet restore
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<ein langer zufälliger Wert>"
dotnet run
```

Die Swagger-Benutzeroberfläche ist unter `/swagger` verfügbar, sobald die API läuft.

Beim ersten Start werden zwei Konten mit bereits ausgefüllten Beispielprofilen angelegt:

* **Unternehmensseite:** `admin@jobmatch.com` / `Admin123!`
* **Arbeitssuchendenseite:** `user@jobmatch.com` / `User123!`

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Das Frontend erwartet die API standardmäßig unter `https://localhost:7198`. Dieser Wert kann über die Umgebungsvariable `VITE_API_URL` überschrieben werden.

## Mitwirken

JobMatch befindet sich in aktiver Entwicklung und ist offen für Beiträge von allen Interessierten. Ob Fehlerbehebung, neue Funktion, Verbesserung der Testabdeckung oder Erweiterung der Dokumentation – Pull Requests sind willkommen.

Wenn du nicht sicher bist, wo du anfangen sollst, eröffne ein Issue und beschreibe, woran du arbeiten möchtest, oder stelle eine Frage. Alle Erfahrungsstufen sind willkommen.

1. Repository forken
2. Einen Branch für die Änderungen erstellen
3. Einen Pull Request mit einer Beschreibung der Änderungen und ihrer Motivation eröffnen

## Roadmap

* Matching-Score mit nachvollziehbarer Begründung auf Basis von Fähigkeiten, Erfahrung, Gehalt und Standort
* Gegenseitiges Interessenmodell als Grundlage des Matchings, wobei Swipen nur eine von mehreren möglichen Interaktionsformen ist
* Echte Stellen- und Bewerberdaten anstelle von Mock-Daten
* Kontakt- und Bewerbungsprozess nach einem Match

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Weitere Informationen findest du in der Datei `LICENSE`.
