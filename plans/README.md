# Animations-Pläne — Bender Elektro

Ergebnis eines Motion-Audits am 25.07.2026 gegen den Regelkatalog aus
`~/.claude/skills/improve-animations/AUDIT.md` (Emil Kowalskis Design-Engineering-Regeln),
angewandt auf die Mikro-Ebene der Seite.

**Ausgangsstand:** Commit `da11f9e`.

**Was ausdrücklich in Ordnung war** und nicht angefasst wird: kein `transition: all`, kein
`ease-in`, kein `scale(0)`, keine `@keyframes` auf Toggle-UI (Menü läuft über eine Transition
und ist damit unterbrechbar), Reveals feuern nur einmal (`unobserve`), Scroll-Listener ist
`{ passive: true }`, und der Stagger über `data-delay="1|2"` (`css/style.css:359–360`) ist
bereits richtig gelöst — 120/240 ms, decorativ, blockiert nichts.

Ebenfalls unangetastet: der **Hero-Blitz** (`css/style.css:155–163`, 1,6 s Zeichnen plus
Füllung). Das ist der Signature-Moment der Seite; das 300-ms-Budget für Bedien-Elemente gilt
dort ausdrücklich nicht.

## Pläne

| # | Titel | Schwere | Status |
| --- | --- | --- | --- |
| [001](001-easing-tokens-und-dauern.md) | Easing-Tokens einführen und Mikro-Dauern auf Budget bringen | LOW | TODO |
| [002](002-hover-nur-auf-zeigegeraeten.md) | Hover-Bewegung auf echte Zeigegeräte begrenzen | HIGH | TODO |
| [003](003-press-feedback-active.md) | Press-Feedback (`:active`) auf allen klickbaren Elementen | HIGH | TODO |
| [004](004-backdrop-filter-nicht-animieren.md) | `backdrop-filter` nicht animieren, Scroll-Schwelle entprellen | MEDIUM | TODO |
| [005](005-reduced-motion-luecken.md) | Lücken im Reduced-Motion-Block schließen | MEDIUM | TODO |

## Reihenfolge — verbindlich

**001 → 002 → 003 → 004 → 005**

Die Nummerierung ist die Ausführungsreihenfolge, nicht die Dringlichkeit. Obwohl 001 nur
LOW ist, steht es vorn, weil die anderen Pläne die dort angelegten Tokens
(`--ease-out`, `--ease-drawer`) verwenden.

Abhängigkeiten im Einzelnen:

- **001** ist Voraussetzung für 003 (nutzt `var(--ease-out)`).
- **002 vor 003**: Beide fügen Regelblöcke an derselben Stelle ein (direkt vor
  `/* ---------- Reveal ---------- */`). Sie haben dieselbe Spezifität, deshalb entscheidet
  die Quelltext-Reihenfolge: Der Hover-Block muss **oben** stehen, der Press-Feedback-Block
  **darunter** — sonst gewinnt beim Drücken eines gehoverten Buttons der Hover-Versatz und
  das Press-Feedback bleibt unsichtbar.
- **004** ist von allen anderen unabhängig und kann jederzeit gezogen werden.
- **005 zuletzt**: Der Reduced-Motion-Block neutralisiert die in 003 erzeugten Transforms
  namentlich. Er funktioniert auch vorher, greift dann aber teilweise ins Leere.

## Was diese Pläne nicht abdecken

Aus dem Audit bewusst offengelassen, kann bei Bedarf nachgezogen werden:

- **Bild-Slots erscheinen hart** (`js/main.js:47–54` zusammen mit `css/style.css:176`):
  Sobald ein Bild geladen ist, wird `.empty` entfernt und der Platzhalter springt ohne
  Übergang auf das Foto. Bei langsamer Verbindung sichtbar; ein 200-ms-Opacity-Übergang
  würde die Lücke schließen.
- **Die große Telefonnummer im roten Band** (`css/style.css:232`) bekommt beim Hover eine
  3 px starke Unterstreichung, die hart aufblitzt — dort fehlt jede Transition. Kleinster
  Aufwand an der prominentesten Stelle der Seite.
