# 002 — Hover-Bewegung auf echte Zeigegeräte begrenzen

- **Status**: TODO
- **Commit**: da11f9e
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 Datei (`css/style.css`), 4 Regeln umgehängt

## Problem

Alle Hover-Effekte mit Bewegung sind ungeschützt — es gibt kein `@media (hover: hover) and (pointer: fine)`. Touch-Geräte lösen beim Antippen einen Hover-Zustand aus, der **nach dem Tap bestehen bleibt**, weil der Finger nie „weggeht". Auf dem Handy bleibt also der angetippte Button dauerhaft nach rechts verschoben und das angetippte Bild dauerhaft gezoomt, bis die Seite neu geladen wird.

Das wiegt hier doppelt, weil die Seite gleichzeitig kein `:active`-Feedback hat (siehe Plan 003): Die einzige Rückmeldung, die ein Handy-Nutzer bekommt, ist eine, die nicht mehr verschwindet.

Betroffene Stellen, wörtlich:

```css
/* css/style.css:83 */
.btn:hover{transform:translateX(3px)}
/* css/style.css:175 */
.frame:hover img{transform:scale(1.045)}
/* css/style.css:217 */
.mehr:hover::after{transform:translateX(5px)}
/* css/style.css:311 */
.qcard:hover{border-color:var(--rot);transform:translateX(3px)}
```

## Target

Farb- und Rahmenwechsel bleiben ungeschützt (sie kleben nicht sichtbar und helfen auch auf Touch). **Nur die `transform`-Deklarationen** wandern in eine Hover-Media-Query.

```css
/* target — Zeile 311 verliert nur ihre transform-Deklaration */
.qcard:hover{border-color:var(--rot)}

/* target — neuer Block, direkt VOR der Zeile „/* ---------- Reveal ---------- */" */
/* ---------- Hover nur auf Zeigegeräten ---------- */
@media (hover:hover) and (pointer:fine){
  .btn:hover{transform:translateX(3px)}
  .frame:hover img{transform:scale(1.045)}
  .mehr:hover::after{transform:translateX(5px)}
  .qcard:hover{transform:translateX(3px)}
}
```

Die Zeilen 83, 175 und 217 enthalten **ausschließlich** eine `transform`-Deklaration und werden deshalb komplett entfernt — sie leben unverändert in der Media-Query weiter.

## Repo conventions to follow

- Die Datei ist in Abschnitte mit `/* ---------- Name ---------- */` gegliedert. Der neue Block bekommt einen Kommentar im selben Stil.
- Media-Queries stehen in dieser Datei jeweils direkt beim zugehörigen Abschnitt (z. B. Zeile 122, 198, 218). Der neue Block gehört jedoch ans Ende, **vor** den Reveal-Abschnitt (Zeile 356) — siehe Boundaries zur Reihenfolge.
- Schreibweise: kompakt, ohne Leerzeichen nach Doppelpunkt und Komma, Media-Queries ohne Leerzeichen (`@media (max-width:860px)`).

## Steps

1. `css/style.css:83` (`.btn:hover{transform:translateX(3px)}`) komplett entfernen.
2. `css/style.css:175` (`.frame:hover img{transform:scale(1.045)}`) komplett entfernen.
3. `css/style.css:217` (`.mehr:hover::after{transform:translateX(5px)}`) komplett entfernen.
4. `css/style.css:311` ersetzen durch: `.qcard:hover{border-color:var(--rot)}`
5. Direkt vor der Zeile `/* ---------- Reveal ---------- */` (Zeile 356) den kompletten Block aus „Target" einfügen, mit vorangestelltem Abschnitts-Kommentar.

## Boundaries

- **Reihenfolge ist verbindlich:** Dieser Block muss im Quelltext **vor** dem Press-Feedback-Block aus Plan 003 stehen. Beide haben dieselbe Spezifität; im Konflikt gewinnt die spätere Regel, und beim Drücken soll die Skalierung gewinnen, nicht der Hover-Versatz. Existiert bereits ein Abschnitt `/* ---------- Press-Feedback ---------- */`, diesen Block **davor** einfügen.
- **`.nav-links a:hover`, `.nav-tel:hover`, `.subnav a:hover`, `.footer a:hover`, `.k-liste a:hover` nicht anfassen** — reine Farbwechsel, die auf Touch unschädlich sind.
- **`.rotband .big-tel:hover`** (Zeile 232, Unterstreichung) ebenfalls nicht anfassen — keine Bewegung.
- Kein Markup ändern, keine neuen Klassen erfinden, keine Abhängigkeiten.
- Wenn eine zitierte Zeile nicht dem Stand von Commit da11f9e entspricht: **stoppen und melden**.

## Verification

- **Mechanisch**: `grep -n "hover:hover" css/style.css` liefert genau einen Treffer. `grep -n ":hover{transform\|:hover img{transform\|:hover::after{transform" css/style.css` liefert nur noch Treffer innerhalb der neuen Media-Query.
- **Feel check**:
  - Am Desktop mit Maus: Buttons verschieben sich weiterhin leicht nach rechts, Bilder zoomen, Querverweis-Karten rücken an — unverändert.
  - In den DevTools die Geräte-Emulation auf ein Smartphone stellen (Touch-Eingabe aktiv, `hover: none`) und einen Button sowie eine Querverweis-Karte antippen: nichts darf sich verschieben und nichts verschoben stehenbleiben.
  - Ein Bild in einem `.frame` antippen: kein hängender Zoom.
  - Am besten zusätzlich auf einem echten Handy prüfen — die Emulation bildet klebende Hover-Zustände nicht immer zuverlässig ab.
- **Done when**: auf einem Touch-Gerät bleibt nach dem Antippen kein veränderter Zustand zurück, und am Desktop ist optisch nichts verlorengegangen.
