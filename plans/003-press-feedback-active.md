# 003 — Press-Feedback (`:active`) auf allen klickbaren Elementen

- **Status**: TODO
- **Commit**: da11f9e
- **Severity**: HIGH
- **Category**: Physicality & origin / Purpose & frequency
- **Estimated scope**: 1 Datei (`css/style.css`), ein neuer Block + 3 ergänzte `transition`-Zeilen

## Problem

Auf der gesamten Seite gibt es **keinen einzigen `:active`-Zustand**. Buttons, der rote Telefon-Button in der Navigation, die Chip-Unternavigation, die Querverweis-Karten und die große Telefonnummer im roten Band reagieren ausschließlich auf `:hover`.

Auf dem Handy gibt es keinen Hover. Ein Nutzer, der auf die Telefonnummer tippt, bekommt also **null Rückmeldung**, dass die Seite den Druck registriert hat — bis der Wähldialog aufgeht. Bei 35 `tel:`-Links über alle Seiten hinweg betrifft das genau die Elemente, an denen die Seite Geld verdient. Die große Nummer im roten Band (`index.html:178`) ist die prominenteste Handlungsaufforderung der ganzen Seite.

Aktueller Stand, wörtlich:

```css
/* css/style.css:110–114 — Telefon-Button, keine transition */
.nav-tel{
  font-family:var(--display);font-style:italic;font-weight:700;font-size:1.05rem;
  color:#fff !important;background:var(--rot);padding:.42rem 1.1rem;
  clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);
}

/* css/style.css:277–282 — Chips, kein transform in der transition */
.subnav a{
  font-weight:500;font-size:.9rem;text-decoration:none;color:var(--ink-soft);
  border:1px solid var(--line);background:var(--white);padding:.42rem 1rem;
  clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);
  transition:background .2s,color .2s,border-color .2s;
}

/* css/style.css:227–231 — große Telefonnummer, keine transition */
.rotband .big-tel{
  font-family:var(--display);font-style:italic;font-weight:700;
  font-size:clamp(2.4rem,7vw,5rem);color:#fff;text-decoration:none;display:inline-block;line-height:1;
  margin:.8rem 0 1.2rem;
}
```

## Target

Ein eigener Abschnitt am Ende des Haupt-CSS, der jedem klickbaren Element eine kurze, subtile Skalierung beim Drücken gibt. Werte fest: **`scale(.97)`** für normale Bedien-Elemente, **`scale(.985)`** für große Flächen (ganze Karte), **`scale(.98)`** für die sehr große Telefonnummer. Dauer **160 ms**, Kurve **`var(--ease-out)`**.

```css
/* target — neuer Abschnitt, NACH dem Hover-Block aus Plan 002,
   direkt vor „/* ---------- Reveal ---------- */" */
/* ---------- Press-Feedback ---------- */
.btn:active,.nav-tel:active,.subnav a:active{transform:scale(.97)}
.qcard:active{transform:scale(.985)}
.rotband .big-tel:active{transform:scale(.98)}
```

Damit die Skalierung weich läuft, brauchen drei Elemente `transform` in ihrer `transition`:

```css
/* target — Ergänzung als letzte Deklaration in .nav-tel (110–114) */
  transition:background 160ms ease,transform 160ms var(--ease-out);

/* target — css/style.css:281 (.subnav a) */
  transition:background 160ms ease,color 160ms ease,border-color 160ms ease,transform 160ms var(--ease-out);

/* target — Ergänzung als letzte Deklaration in .rotband .big-tel (227–231) */
  transition:transform 160ms var(--ease-out);
```

`.btn` (Zeile 81) und `.qcard` (Zeile 308) haben `transform` bereits in ihrer `transition` — dort ist nichts zu ergänzen.

## Repo conventions to follow

- Die Kurven-Tokens kommen aus **Plan 001** und stehen im `:root`-Block (`css/style.css:14–32`). Ist Plan 001 noch nicht umgesetzt, existiert `var(--ease-out)` nicht — dann zuerst Plan 001 ausführen, nicht ersatzweise eine eigene Kurve erfinden.
- Abschnitte werden mit `/* ---------- Name ---------- */` überschrieben.
- Schreibweise: kompakt, ohne Leerzeichen nach Doppelpunkt und Komma.
- `.qcard` ist ein echter Link (`leistungen.html:49`, `<a class="qcard reveal" href="…">`) — die Skalierung darf auf dem Element selbst sitzen.

## Steps

1. **Voraussetzung prüfen**: `grep -n "ease-out" css/style.css` muss den Token im `:root`-Block zeigen. Wenn nicht → stoppen, erst Plan 001.
2. In der Regel `.nav-tel{ … }` (Zeilen 110–114) als letzte Deklaration ergänzen:
   `transition:background 160ms ease,transform 160ms var(--ease-out);`
3. `css/style.css:281` ersetzen durch:
   `  transition:background 160ms ease,color 160ms ease,border-color 160ms ease,transform 160ms var(--ease-out);`
4. In der Regel `.rotband .big-tel{ … }` (Zeilen 227–231) als letzte Deklaration ergänzen:
   `transition:transform 160ms var(--ease-out);`
5. Den kompletten Press-Feedback-Block aus „Target" einfügen — **hinter** dem `@media (hover:hover)`-Block aus Plan 002 und **vor** der Zeile `/* ---------- Reveal ---------- */`. Existiert der Hover-Block noch nicht, kommt der Press-Block trotzdem an genau diese Stelle; Plan 002 fügt seinen Block dann davor ein.

## Boundaries

- **Reihenfolge ist verbindlich**: Press-Feedback muss im Quelltext **nach** dem Hover-Block aus Plan 002 stehen. Beide Regelgruppen haben dieselbe Spezifität — steht der Hover-Block später, gewinnt beim Drücken eines bereits gehoverten Buttons der Hover-Versatz statt der Skalierung, und das Feedback bleibt aus.
- Skalierungswerte nicht „schöner" machen. 0,97 / 0,985 / 0,98 sind bewusst subtil.
- **Kein `:active` auf `.burger`** — der Burger hat mit der Kreuz-Animation bereits eine deutliche Zustandsanzeige.
- Keine `:active`-Zustände auf nicht klickbaren Elementen erfinden (`.vitem`, `.fact`, `.band`, `.hintbox`).
- Die `clip-path`-Schrägen sind das Gestaltungsmerkmal der Seite — nicht anfassen, nicht „begradigen".
- Kein Markup ändern, keine Farben ändern, keine Abhängigkeiten.
- Wenn eine zitierte Zeile nicht dem Stand von Commit da11f9e entspricht: **stoppen und melden**.

## Verification

- **Mechanisch**: `grep -c ":active" css/style.css` liefert mindestens 5. Seite lokal öffnen — keine Konsolen-Fehler, Layout unverändert.
- **Feel check**:
  - Am Desktop einen Button gedrückt halten: er schrumpft leicht und federt beim Loslassen zurück. Der Effekt muss **spürbar, aber kaum bewusst sichtbar** sein — wenn es „hüpft", ist der Wert zu klein.
  - Die große Telefonnummer im roten Band gedrückt halten: sie gibt minimal nach. Wichtig — die Schräge des `clip-path` darf dabei nicht flackern oder ausfransen.
  - Eine Querverweis-Karte gedrückt halten: die ganze Karte gibt nach, der Text bleibt scharf.
  - In den DevTools (Animations-Panel) auf 10 % stellen und prüfen, dass die Skalierung sofort beim Drücken startet, nicht verzögert.
  - Auf einem echten Handy die Telefonnummer in der Navigation antippen: es muss vor dem Öffnen des Wählfeldes eine sichtbare Reaktion geben.
- **Done when**: jeder `.btn`, jeder `tel:`-Link, jeder Chip und jede Querverweis-Karte reagiert sichtbar auf Druck, die `clip-path`-Schrägen bleiben sauber, und am Desktop hat sich das Hover-Verhalten nicht verändert.
