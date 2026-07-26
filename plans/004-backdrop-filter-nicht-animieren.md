# 004 — `backdrop-filter` nicht animieren, Scroll-Schwelle entprellen

- **Status**: DONE
- **Commit**: da11f9e
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 2 Dateien (`css/style.css`, `js/main.js`), ~10 Zeilen

## Problem

Zwei Dinge greifen hier ungünstig ineinander.

**Erstens** wird `backdrop-filter` animiert. Die Navigationsleiste liegt `position:fixed` über der vollen Seitenbreite; ein animierter Blur zwingt den Browser, bei **jedem Frame** des Übergangs den gesamten Bereich hinter der Leiste neu zu filtern. Das ist mit Abstand die teuerste Eigenschaft in dieser Datei — animiert werden sollten nur `transform` und `opacity`, alles andere höchstens dort, wo es unvermeidbar ist.

**Zweitens** schaltet der Scroll-Handler hart an einer einzigen Schwelle. Wer sich um die 24-Pixel-Marke herum bewegt — beim Zurückscrollen nach oben, mit Trackpad-Trägheit oder auf einem Handy mit Gummiband-Effekt — löst den 300-ms-Übergang wiederholt aus und sieht die Leiste flackern.

Aktueller Stand, wörtlich:

```css
/* css/style.css:94–102 */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:60;
  display:flex;align-items:center;justify-content:space-between;
  padding:.8rem var(--pad);
  background:rgba(248,248,246,.6);
  backdrop-filter:blur(0px);
  transition:background .3s ease,box-shadow .3s ease,backdrop-filter .3s ease;
}
.nav.scrolled{background:rgba(248,248,246,.92);backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line)}
```

```js
/* js/main.js:6–12 */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
```

## Target

`backdrop-filter` fliegt aus der Transition-Liste. Der Blur springt dadurch beim Umschalten sofort — das fällt nicht auf, weil die Hintergrundfarbe im selben Moment weich überblendet und den Wechsel verdeckt. Die Blur-Werte selbst (0 px oben, 14 px gescrollt) bleiben **unverändert**, die Optik ändert sich also nicht.

Dazu bekommt die Schwelle eine Hysterese: Sie schaltet bei 24 px **ein** und erst bei 8 px wieder **aus**. Zwischen beiden Werten passiert nichts, das Flackern ist damit ausgeschlossen.

```css
/* target — ersetzt css/style.css:100 */
  transition:background 240ms ease,box-shadow 240ms ease;
```

```js
/* target — ersetzt js/main.js:6–12 */
  var nav = document.getElementById('nav');
  var navScrolled = false;
  function onScroll() {
    if (!nav) return;
    var y = window.scrollY;
    if (!navScrolled && y > 24) { navScrolled = true; nav.classList.add('scrolled'); }
    else if (navScrolled && y < 8) { navScrolled = false; nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
```

Zeile 102 (`.nav.scrolled{…}`) bleibt **unverändert** — sie enthält weiterhin `backdrop-filter:blur(14px)`.

## Repo conventions to follow

- `js/main.js` ist eine IIFE im `'use strict'`-Modus, ohne Framework, ohne Inline-Scripts (CSP-fest). Diesen Stil beibehalten: `var` statt `let/const`, klassische `function`-Deklarationen.
- Der Scroll-Listener ist bereits korrekt `{ passive: true }` — das bleibt so.
- Der abschließende Direktaufruf `onScroll();` sorgt dafür, dass der Zustand beim Laden mit bereits gescrollter Seite stimmt. Er bleibt erhalten.
- Schreibweise im CSS: kompakt, ohne Leerzeichen nach Doppelpunkt und Komma.

## Steps

1. `css/style.css:100` ersetzen durch: `  transition:background 240ms ease,box-shadow 240ms ease;`
2. `js/main.js:6–12`: den Block von `var nav = …` bis einschließlich `onScroll();` durch die Zielfassung ersetzen.
3. Prüfen, dass `css/style.css:102` unverändert geblieben ist und weiterhin `backdrop-filter:blur(14px)` enthält.

## Boundaries

- **Die Blur-Werte nicht ändern.** Weder `blur(0px)` in Zeile 99 noch `blur(14px)` in Zeile 102. Ziel dieser Aufgabe ist ausschließlich, den Blur nicht mehr zu *animieren* — nicht, die Optik der Leiste zu verändern.
- Die Schwellenwerte 24 und 8 nicht verschieben. 24 px ist der bestehende Auslösepunkt, 8 px der neue Rückfallpunkt.
- Kein `requestAnimationFrame`-Throttling, kein `IntersectionObserver`-Umbau, keine Sentinel-Elemente — der Handler ist bereits passiv und billig genug.
- Kein Markup ändern, die ID `nav` bleibt.
- Wenn CSS oder JS nicht dem Stand von Commit da11f9e entsprechen: **stoppen und melden**.

## Verification

- **Mechanisch**: `grep -n "backdrop-filter" css/style.css` liefert genau zwei Treffer (Zeile 99 und 102) — und **keinen** mehr innerhalb einer `transition`-Deklaration. Seite lokal öffnen — keine Konsolen-Fehler.
- **Feel check**:
  - Langsam von ganz oben nach unten scrollen: die Leiste wird an der Schwelle undurchsichtiger, der Übergang wirkt weich. Der Blur-Sprung darf nicht als eigenständiges Zucken auffallen.
  - Genau um die Schwelle herum wackeln (ein paar Pixel hoch und runter): die Leiste darf **nicht** flackern — sie bleibt im einmal erreichten Zustand, bis 8 px unterschritten werden.
  - Auf einem Handy bis über den oberen Rand hinaus ziehen und loslassen (Gummiband): kein Flackern beim Zurückschnellen.
  - Performance-Aufzeichnung in den DevTools über einen Scroll von oben nach unten: während des Leisten-Übergangs dürfen keine langen Paint-Blöcke mehr auftreten.
- **Done when**: Die Leiste sieht in beiden Zuständen exakt aus wie vorher, der Übergang flackert an keiner Stelle mehr, und `backdrop-filter` steht in keiner `transition` mehr.
