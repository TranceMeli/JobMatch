# JobMatch

## Screenshots

<p align="center">
  <img src="frontend/src/assets/screenshots/match_screen_1.jpeg" width="45%" />
  <img src="frontend/src/assets/screenshots/match_screen_2.jpeg" width="45%" />
</p>
<p align="center">
  <img src="frontend/src/assets/screenshots/profile_screen_company.jpeg" width="45%" />
  <img src="frontend/src/assets/screenshots/profile_screen_user.jpeg" width="45%" />
</p>
<p align="center">
  <img src="frontend/src/assets/screenshots/questions_screen_company.jpeg" width="45%" />
  <img src="frontend/src/assets/screenshots/questions_screen_user.jpeg" width="45%" />
</p>
<p align="center">
  <img src="frontend/src/assets/screenshots/match_screen_3.jpeg" width="45%" />
  <img src="frontend/src/assets/screenshots/match_screen_4.jpeg" width="45%" />
</p>

JobMatch ist eine zweiseitige Job-Matching-Plattform, die Arbeitssuchende und Unternehmen anhand ihrer Profile, Fähigkeiten, Präferenzen und Anforderungen zusammenbringt.

Dieses Projekt ist Open Source und wird aktiv weiterentwickelt. Issues, Pull Requests und Ideen sind willkommen, unabhängig von der jeweiligen Erfahrung.

## Idee

Anstatt sich bei jedem Unternehmen einzeln bewerben zu müssen, erstellen Arbeitssuchende ein wiederverwendbares Profil, das die typischerweise im Bewerbungsprozess benötigten Informationen enthält.

Unternehmen erstellen ebenfalls eigene Profile und definieren ihre Anforderungen, Erwartungen und Arbeitsbedingungen.

Zusätzlich beantworten beide Seiten einen jobbezogenen Fragebogen. Die Antworten bilden eine gemeinsame Grundlage für das Matching und machen die Anforderungen und Erwartungen beider Seiten besser vergleichbar.

Die Plattform vergleicht beide Seiten und identifiziert passende Übereinstimmungen.

```text
Bewerberprofil
     │
     ▼
  Fragebogen ───────┐
                    │
                    ▼
              Matching-Engine
                    ▲
                    │
  Fragebogen ───────┘
     ▲
     │
Unternehmensprofil
     │
     ▼
Übereinstimmung
```

Das Ziel besteht nicht nur darin, einen Matching-Score zu liefern, sondern auch nachvollziehbar zu machen, warum zwei Profile zueinander passen.

Ein Match entsteht, wenn beide Seiten Interesse bekunden. Die konkrete Interaktion muss dabei nicht auf einem Swipe-Prinzip basieren. Swipen ist lediglich eine mögliche Benutzeroberfläche, um Interesse auszudrücken.

## Funktionen

* Kontosystem mit zwei Rollen: Admin (Unternehmen) und User (Arbeitssuchende)
* Registrierung und Login mit JWT-Authentifizierung
* Kurzlebige Access-Tokens und rotierende Refresh-Tokens über HttpOnly-Cookies
* Erkennung einer erneuten Verwendung bereits verbrauchter Refresh-Tokens
* Detaillierte, bearbeitbare Profile
* Angaben zu Fähigkeiten, Erfahrungslevel, Gehaltsvorstellungen, Remote-Präferenzen, Verfügbarkeit, Links und weiteren Informationen
* Jobbezogene Fragebögen für Bewerber und Unternehmen
* Erste unterstützte Jobkategorie: **Junior Developer**
* Vollständige Übersicht der bereits beantworteten Fragen
* Möglichkeit, Antworten nachträglich zu bearbeiten
* Matching-Engine zum Vergleich der Antworten beider Seiten
* Gewichtung verschiedener Matching-Kriterien
* Nachvollziehbarer Match-Score mit Begründungen
* Gegenseitiges Interessenmodell
* Ein tatsächliches Match entsteht erst, wenn beide Seiten Interesse zeigen
* Swipe-Oberfläche zum Durchsuchen passender Profile
* Match-Liste mit freigeschaltetem Kontakt nach gegenseitigem Interesse
* Responsives Layout für Desktop, Tablet und mobile Geräte

## Fragebogen und Matching

JobMatch setzt beim Matching nicht ausschließlich auf klassische Profildaten.

Bewerber und Unternehmen beantworten einen eigenen Fragebogen für die jeweilige Jobkategorie. Dadurch können nicht nur technische Fähigkeiten, sondern auch Erwartungen an die Zusammenarbeit miteinander verglichen werden.

Für die Kategorie **Junior Developer** werden unter anderem folgende Bereiche berücksichtigt:

* Technologien und technische Interessen
* Entwicklungsbereiche
* Arbeitsmodell
* Teamarbeit
* Eigenverantwortung
* Einarbeitung und Mentoring
* Code Reviews
* Arbeitsweise
* Weiterbildungs- und Entwicklungsmöglichkeiten
* angebotene Projekte und Aufgaben
* Erwartungen an Bewerber bzw. Arbeitgeber

Die Antworten werden miteinander verglichen und in einen Match-Score überführt.

Dabei werden unterschiedliche Kriterien gewichtet, damit wichtige Aspekte stärker in das Matching einfließen können.

Zusätzlich werden Gründe für die Übereinstimmung angezeigt, damit das Ergebnis nachvollziehbar bleibt.

Persönliche Fragen dienen der zusätzlichen Information über die jeweilige Seite und werden nicht direkt in den numerischen Match-Score einbezogen.

### Antwortenübersicht

Nach dem Ausfüllen des Fragebogens können die eigenen Antworten jederzeit als Übersicht eingesehen werden.

Die Übersicht zeigt:

* alle Fragen des ausgewählten Fragebogens
* die jeweils gespeicherte Antwort
* Mehrfachauswahlen
* Skalenwerte
* die Möglichkeit, den Fragebogen erneut zu bearbeiten

Dadurch bleibt transparent, welche Angaben aktuell für das Matching verwendet werden.

## Ablauf

Der aktuelle Ablauf der Anwendung ist:

```text
Registrierung / Login
        │
        ▼
     Profil
        │
        ▼
 Jobkategorie auswählen
        │
        ▼
 Fragebogen beantworten
        │
        ▼
 Antwortenübersicht
        │
        ├── Antworten bearbeiten
        │
        ▼
 Passende Profile
        │
        ▼
 Interesse zeigen
        │
        ▼
 Gegenseitiges Interesse
        │
        ▼
       Match
```

## Technologie-Stack

### Frontend

* React
* Vite
* react-tinder-card
* Material Symbols (Google Fonts)

### Backend

* ASP.NET Core Web API auf .NET 10
* Controller-basierte Architektur
* Entity Framework Core
* SQLite
* ASP.NET Core Identity
* JWT Access-Tokens
* Rotierende Refresh-Tokens
* HttpOnly-Cookies
* Swagger / OpenAPI

## Design

Farbpalette:

[Color Hunt – #293681, #4274D9, #95CCDD, #D0E7E6](https://colorhunt.co/palette/f5f7f8f4ce14495e5745474b)

Interaktive Zustände wie Hover-Effekte, Farbabstufungen und barrierefreie Textvarianten werden durch HSL-Anpassungen aus der Basisfarbpalette abgeleitet, anstatt zusätzliche, unabhängig festgelegte Farben zu verwenden.

## Projektstruktur

```text
JobMatch/
├── backend/
│   ├── Program.cs
│   ├── Data/
│   │   └── AppDbContext, DbSeeder, Demo-Profildaten
│   ├── Entities/
│   │   └── Identity-Entities, Profile, QuestionnaireResponse, Interest
│   ├── Auth/
│   │   └── ITokenService, TokenService, JwtSettings
│   ├── Models/
│   │   └── Auth- und Questionnaire-DTOs
│   ├── Services/
│   │   └── Question-Katalog und Matching-Engine
│   └── Controllers/
│       └── Auth-, Profile-, Questionnaire- und Matching-APIs
│
└── frontend/
    └── src/
        ├── components/
        │   └── Navbar, SwipeCard, TagInput, ToggleGroup, Icon, ...
        ├── pages/
        │   └── AuthForm, ProfileForm, ProfileCard,
        │       QuestionnaireOverview, SwipeScreen, Matches
        ├── hooks/
        │   └── useBreakpoint
        ├── data/
        │   └── Mock-Daten für Stellenangebote und Kandidaten
        ├── api.js
        │   └── API-Kommunikation und Authentifizierung
        └── App.jsx
```

## Erste Schritte

### Voraussetzungen

* .NET SDK 10
* Node.js 20 oder neuer
* npm

### Bei geklontem Repository

Wenn du dieses Repository geklont hast, kannst du direkt zu [Starten](#starten) springen.

Alle benötigten Pakete sind bereits in `backend.csproj` und `frontend/package.json` definiert.

### Projekte von Grund auf neu anlegen

Nur relevant, wenn du ein Projekt wie dieses komplett neu aufsetzt, statt dieses Repository zu klonen.

#### Backend

```bash
dotnet new webapi -controllers -n backend
cd backend
```

Das Flag `-controllers` ist wichtig. Ohne dieses Flag erzeugt .NET standardmäßig ein Minimal-API-Projekt ohne `Controllers/`-Ordner.

#### Frontend

```bash
npm create vite@latest frontend -- --template react
cd frontend
```

## Pakete installieren

### Backend

```bash
cd backend
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Swashbuckle.AspNetCore
```

### Frontend

```bash
cd frontend
npm install
npm install react-tinder-card @react-spring/web --legacy-peer-deps
```

`react-tinder-card` steuert die Swipe-Geste und benötigt `@react-spring/web` für die Animation.

Das Flag `--legacy-peer-deps` ist nötig, weil die angegebene Peer-Dependency von `react-tinder-card` React 19 noch nicht einschließt.

## Icons

Material Symbols wird über Google Fonts eingebunden und nicht über ein npm-Paket installiert.

In `index.html` ergänzen:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  rel="stylesheet"
/>
```

## Konfiguration

Für den JWT-Schlüssel können ASP.NET Core User Secrets verwendet werden:

```bash
cd backend
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<ein langer zufälliger Wert>"
```

Der JWT-Schlüssel sollte nicht direkt im Repository gespeichert werden.

## Starten

### Backend

```bash
cd backend
dotnet run
```

Die Swagger-Benutzeroberfläche ist unter `/swagger` verfügbar, sobald die API läuft.

Beim ersten Start werden zwei Konten mit bereits ausgefüllten Beispielprofilen angelegt:

* **Unternehmensseite:** `admin@jobmatch.com` / `Admin123!`
* **Arbeitssuchendenseite:** `user@jobmatch.com` / `User123!`

### Frontend

```bash
cd frontend
npm run dev
```

Das Frontend erwartet die API standardmäßig unter:

```text
http://localhost:5254
```

Dieser Wert kann über die Umgebungsvariable `VITE_API_URL` überschrieben werden.

Beispiel:

```text
VITE_API_URL=http://localhost:5254
```

## Mitwirken

JobMatch befindet sich in aktiver Entwicklung und ist offen für Beiträge von allen Interessierten.

Ob Fehlerbehebung, neue Funktion, Verbesserung der Testabdeckung oder Erweiterung der Dokumentation: Pull Requests sind willkommen.

Wenn du nicht sicher bist, wo du anfangen sollst, eröffne ein Issue und beschreibe, woran du arbeiten möchtest, oder stelle eine Frage.

### Pull Request

1. Repository forken
2. Einen Branch für die Änderungen erstellen
3. Änderungen implementieren und testen
4. Einen Pull Request mit einer Beschreibung der Änderungen und ihrer Motivation eröffnen

## Roadmap

* Weitere Jobkategorien und eigene Question Sets
* Erweiterung des Matching-Scores um zusätzliche Profilkriterien wie Erfahrung, Gehalt und Standort
* Detailliertere Match-Begründungen und Gewichtungen pro Jobkategorie
* Erweiterung des Kontakt- und Bewerbungsprozesses nach einem Match
* Echte Stellenverwaltung mit mehreren offenen Positionen pro Unternehmen
* Erweiterung der Matching-Logik um weitere Profil- und Präferenzdaten

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

Weitere Informationen findest du in der Datei `LICENSE`.
