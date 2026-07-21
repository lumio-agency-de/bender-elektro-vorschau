# Bender Elektro — Website-Vorschau (Relaunch)

Alternativentwurf für **Jürgen Bender Elektroinstallationsbetrieb**, Sinsheim
([bender-elektro.de](https://www.bender-elektro.de)).

Moderner, kühl-technischer „elektrischer" Relaunch: Near-Black, Electric-Blue-Akzent,
Space Grotesk + Instrument Sans. Bewusst **bildarm** – CSS-gebauter Hero (Grid + Glow +
Strom-Linie) und Icon-Karten statt Stock-Fotos.

## Struktur
- `index.html` — One-Pager (Hero, Versprechen, Leistungen, Sicherheit, Marken, Warum, CTA)
- `kontakt.html` — Kontakt & Anfahrt (OpenStreetMap)
- `impressum.html` / `datenschutz.html` — Rechtstexte (auf `noindex`)
- `styles.css`, `js/main.js` — Assets (JS ausgelagert, CSP-fähig)
- `.htaccess` — Sicherheits-Header für den echten Apache-Host

## Inhalt (aus der bestehenden Seite)
- Claim übernommen & modernisiert: „Als Elektro-Profi garantieren wir Ihnen beste Qualität"
- 4 Leistungsversprechen (Beratung · Zuverlässige Umsetzung · Faires Preis-Leistungs-Verhältnis · Termingenaue Ausführung)
- „Rauchmelder retten Leben" als Sicherheits-Statement
- Partnermarken: ABB, Gira, Busch-Jaeger, Berker, Merten, Schneider Electric, Stiebel Eltron
- Leistungen auf 6 klare Bereiche kuratiert (statt 50+ Unterseiten der Originalnavigation)
- Kontakt: An der Röte 5 a, 74889 Sinsheim · 07265 4100 · j.bender.elektrobetrieb@t-online.de
- Impressum vollständig (Inhaber Jürgen Bender, Elektromeister; USt-IdNr. DE144342628; HWK Mannheim)

## Vor echter Veröffentlichung
- **Keine echten Fotos** verbaut (bewusst bildarmes Konzept). Optional später echte Betriebs-/Projektfotos ergänzen.
- **Datenschutz**: Hoster/AVV eintragen; Google-Fonts idealerweise lokal hosten.
- **Sicherheits-Header**: `.htaccess` greift auf Apache/IONOS, nicht auf GitHub Pages.

Reine Vorschau, Rechtstexte auf `noindex`.
