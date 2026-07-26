# 001 — Easing-Tokens einführen und Mikro-Dauern auf Budget bringen

- **Status**: DONE
- **Commit**: da11f9e
- **Severity**: LOW
- **Category**: Cohesion & tokens / Easing & duration
- **Estimated scope**: 1 Datei (`css/style.css`), ~8 Einzeländerungen

## Problem

Die Seite hat kein Motion-Token-System. Jede Transition nennt das eingebaute `ease` (teils gar keine Kurve, dann greift der Default `ease`) und eine frei gewählte Dauer: `.2s`, `.25s`, `.3s`, `.35s`, `.8s`.

Das eingebaute `ease` ist für bewusste Bewegung zu schwach — es startet und endet zu weich, wodurch Interaktionen träge wirken. Und der Bild-Zoom liegt mit 800 ms weit über dem Budget für Bedien-Feedback (Ziel: unter 300 ms): Ein Bild zieht nach dem Verlassen des Rahmens noch fast eine Sekunde nach.

Aktueller Stand, wörtlich:

```css
/* css/style.css:81 */
  transition:transform .25s ease,background .25s ease,color .25s ease;

/* css/style.css:174 */
.frame img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.6,.2,1)}

/* css/style.css:216 */
.mehr::after{content:'→';transition:transform .25s}

/* css/style.css:308 */
  padding:1.2rem 1.3rem;transition:border-color .2s,transform .25s;
```

## Target

Drei Kurven-Tokens im bestehenden `:root`-Block, danach alle Mikro-Transitions darauf umgestellt.

```css
/* target — Ergänzung im :root-Block */
  --ease-out:cubic-bezier(.23,1,.32,1);
  --ease-in-out:cubic-bezier(.77,0,.175,1);
  --ease-drawer:cubic-bezier(.32,.72,0,1);
```

Zieldauern (Regel: erscheinen/verschwinden → `--ease-out`; reiner Farbwechsel → `ease`):

| Stelle | vorher | nachher |
| --- | --- | --- |
| `.btn` (81) | `.25s ease` | `transform 160ms var(--ease-out)`, Rest `160ms ease` |
| `.nav-links a` (108) | `.2s` | `160ms ease` |
| `.burger span` (117) | `.3s` | `240ms var(--ease-out)` |
| `.nav-links` mobil (126) | `.35s ease` | `300ms var(--ease-drawer)` |
| `.frame img` (174) | `.8s cubic-bezier(.2,.6,.2,1)` | `380ms var(--ease-out)` |
| `.mehr::after` (216) | `.25s` | `180ms var(--ease-out)` |
| `.subnav a` (281) | `.2s` | `160ms ease` |
| `.qcard` (308) | `border-color .2s, transform .25s` | `border-color 160ms ease, transform 180ms var(--ease-out)` |

`.nav` (Zeile 100) bleibt hier unverändert — diese Transition wird in **Plan 004** gesondert behandelt.

## Repo conventions to follow

- Alle Design-Tokens stehen im einen `:root`-Block ganz oben (`css/style.css:14–32`). Die neuen Kurven kommen ans Ende, nach dem Kommentar `/* Der Blitz-Winkel — eine Schräge für alles */` und der Zeile `--cut:14px;`, vor der schließenden `}`.
- Schreibweise im Projekt: **sehr kompakt**, ohne Leerzeichen nach Doppelpunkt und Komma, Deklarationen einzeilig (`transition:transform .25s ease,background .25s ease`). Diesen Stil exakt beibehalten.
- Vorbild für eine bereits bewusst gewählte Kurve: `css/style.css:174` (`cubic-bezier(.2,.6,.2,1)`) — die wird hier durch das Token ersetzt.

## Steps

1. `css/style.css`: im `:root`-Block nach Zeile 31 (`--cut:14px;`) die drei Token-Zeilen aus „Target" einfügen.
2. Zeile 81 ersetzen durch:
   `  transition:transform 160ms var(--ease-out),background 160ms ease,color 160ms ease;`
3. Zeile 108: `transition:color .2s` → `transition:color 160ms ease`
4. Zeile 117: `transition:transform .3s,opacity .3s` → `transition:transform 240ms var(--ease-out),opacity 240ms var(--ease-out)`
5. Zeile 126: `transition:transform .35s ease` → `transition:transform 300ms var(--ease-drawer)`
6. Zeile 174 ersetzen durch:
   `.frame img{width:100%;height:100%;object-fit:cover;transition:transform 380ms var(--ease-out)}`
7. Zeile 216 ersetzen durch: `.mehr::after{content:'→';transition:transform 180ms var(--ease-out)}`
8. Zeile 281: `transition:background .2s,color .2s,border-color .2s` → `transition:background 160ms ease,color 160ms ease,border-color 160ms ease`
9. Zeile 308: `transition:border-color .2s,transform .25s` → `transition:border-color 160ms ease,transform 180ms var(--ease-out)`

## Boundaries

- **Zeilen 357–360 nicht anfassen** (`.reveal` mit `.8s` und die `data-delay`-Staffelung). Das ist Signature-Motion einer Marketing-Seite und bewusst lang; der Stagger ist bereits richtig gelöst.
- **Zeilen 155–163 nicht anfassen** (Hero-Blitz: `@keyframes draw`, `@keyframes boltfill`). Der 1,6-Sekunden-Zeichenvorgang ist der Signature-Moment der Seite und ausdrücklich gewollt.
- **Zeile 100 nicht anfassen** (`.nav`-Transition) — gehört zu Plan 004.
- Keine Farben, Abstände, `clip-path`-Werte oder Markup ändern.
- Keine neuen Abhängigkeiten, keine Build-Schritte.
- Wenn eine Zeile nicht dem hier zitierten Stand entspricht (Drift seit Commit da11f9e): **stoppen und melden**.

## Verification

- **Mechanisch**: `grep -n "ease-out\|ease-drawer" css/style.css` zeigt die Tokens im `:root`-Block. Seite lokal öffnen (`open index.html`) — keine Konsolen-Fehler, Layout unverändert.
- **Feel check**: `index.html` im Browser öffnen und
  - über einen Bildrahmen fahren: der Zoom läuft merklich zügiger und zieht beim Verlassen nicht mehr nach;
  - über einen „Mehr →"-Link fahren: der Pfeil schiebt sich knackiger nach rechts;
  - in den DevTools (Animations-Panel) auf 10 % stellen und prüfen, dass die Kurve am Anfang schnell ist und weich ausläuft, nicht symmetrisch;
  - die Startseite einmal neu laden und sicherstellen, dass der Hero-Blitz sich unverändert zeichnet.
- **Done when**: keine Transition auf einem Bedien-Element ist länger als 400 ms, alle Kurven kommen aus einem Token oder sind bewusst `ease`, und Hero-Blitz sowie Reveals sind unverändert.
