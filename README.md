# AnimeRank v0.3 — Cloud / Multiplayer Edition

Die Seite kann weiterhin als Demo ohne Backend geöffnet werden. Mit Supabase werden daraus echte Accounts, Gruppen und gemeinsame Bewertungen.

## 1. Supabase anlegen
1. Neues Projekt bei Supabase erstellen.
2. Im SQL Editor den kompletten Inhalt von `supabase.sql` ausführen.
3. Unter Authentication → Providers E-Mail/Passwort aktivieren.
4. Project URL und den öffentlichen Publishable/anon Key kopieren.
5. In `config.js` eintragen:
   - `supabaseUrl: 'https://....supabase.co'`
   - `supabaseKey: 'sb_publishable_...'` bzw. den öffentlichen anon/publishable Key deines Projekts.
6. Niemals den `service_role`-Key in `config.js` eintragen.

## 2. Start
`index.html` öffnen. Für lokale Entwicklung kann die Datei direkt geöffnet werden; für Auth-Mail-Links ist später ein kleiner lokaler Webserver besser.

## 3. Was v0.3 kann
- E-Mail + Passwort Registrierung/Login
- Profilname
- echte Gruppen erstellen
- Einladungscode erzeugen
- Gruppen per Code beitreten
- Anime aus AniList suchen
- Anime einer Gruppe hinzufügen
- persönliche Bewertung 1–6
- „Nicht gesehen“ speichern
- echte Gruppendurchschnitte
- eine Bewertung pro Nutzer und Anime (änderbar)
- Daten auf mehreren Geräten
- automatische Synchronisierung per Supabase Realtime
- Demo-Modus bleibt als Fallback erhalten

## 4. Sicherheitsprinzip
Die Website enthält nur den öffentlichen Browser-Key. Der Zugriff wird über Supabase Auth + PostgreSQL Row Level Security geregelt. Ein `service_role`-Key gehört niemals in den Browser.
