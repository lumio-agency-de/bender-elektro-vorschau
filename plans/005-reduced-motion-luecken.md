# 005 — Lücken im Reduced-Motion-Block schließen

- **Status**: TODO
- **Commit**: da11f9e
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 Datei (`css/style.css`), ein Block erweitert

## Problem

Der Reduced-Motion-Block ist grundsätzlich richtig gebaut — er schaltet gezielt ab statt pauschal alles zu killen. Aber er übergeht ausgerechnet die **größten Positionswechsel** der Seite: Das mobile Menü fährt weiterhin über die volle Bildschirmbreite herein, und die Burger-Striche animieren weiterhin zum Kreuz.

Für jemanden mit Bewegungsempfindlichkeit ist genau ein bildschirmfüllendes Panel, das von rechts hereinschießt, der problematischste Effekt der ganzen Seite — deutlich stärker als der Hero-Blitz, der bereits sauber abgefangen wird.

Aktueller Stand, wörtlich:

```css
/* css/style.css:361–366 — aktuell */
@media (prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .js .hero-bolt path{animation:none;stroke-dashoffset:0}
  .js .hero-bolt .fillpath{animation:none;opacity:.06}
  .frame img,.btn,.mehr::after{transition:none}
}
```

Nicht erfasst:

```css
/* css/style.css:124–128 — Menü fährt über die volle Breite herein */
  .nav-links{
    position:fixed;inset:0;flex-direction:column;justify-content:center;gap:2rem;
    background:var(--paper);transform:translateX(100%);transition:transform .35s ease;
  }
  .nav-links.open{transform:translateX(0)}

/* css/style.css:117 — Burger-Striche animieren */
.burger span{display:block;width:26px;height:2.5px;background:var(--ink);margin:5.5px 0;transition:transform .3s,opacity .3s}
```

## Target

Der bestehende Block wird erweitert, nicht ersetzt. Grundsatz: **weniger und sanfter, nicht null** — Positionswechsel fliegen raus, Opacity- und Farbübergänge bleiben als Rückmeldung erhalten.

Das mobile Menü verliert seine seitliche Fahrt und blendet stattdessen ein. Weil die Grundregel `transform:translateX(100%)` zum Verstecken nutzt, muss beim Entfernen des Transforms ein Ersatz her — dafür `visibility` plus `opacity`.

Der Burger behält seine Kreuz-Form (das ist eine **Zustandsanzeige**, keine Dekoration), springt aber ohne Übergang dorthin.

```css
/* target — ersetzt css/style.css:361–366 */
@media (prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .js .hero-bolt path{animation:none;stroke-dashoffset:0}
  .js .hero-bolt .fillpath{animation:none;opacity:.06}
  .frame img,.btn,.mehr::after{transition:none}
  /* Zustandsanzeige bleibt, Bewegung dorthin nicht */
  .burger span{transition:none}
  .nav{transition:background 200ms ease}
  /* Press-Feedback ohne Skalierung — der Farbwechsel bleibt die Rückmeldung */
  .btn:active,.nav-tel:active,.subnav a:active,.qcard:active,
  .rotband .big-tel:active{transform:none}
}

/* target — direkt darunter anhängen */
@media (prefers-reduced-motion:reduce) and (max-width:860px){
  .nav-links{
    transform:none;opacity:0;visibility:hidden;
    transition:opacity 180ms ease,visibility 180ms;
  }
  .nav-links.open{opacity:1;visibility:visible}
}
```

## Repo conventions to follow

- Der Reduced-Motion-Block ist der **letzte** Abschnitt der Datei (Zeilen 361–366). Diese Position bleibt — die Regeln müssen nach allen anderen stehen, damit sie bei gleicher Spezifität gewinnen. Das gilt besonders für den zweiten Block: Er muss nach `@media (max-width:860px)` (Zeile 122) stehen, sonst greift er nicht.
- Es gibt bereits eine eigenständige Reduced-Motion-Regel weiter oben (`css/style.css:36`, `@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`). Die bleibt, wo sie ist — nicht zusammenführen.
- Kein `!important` verwenden. Die Blöcke gewinnen über die Quelltext-Reihenfolge.
- Schreibweise: kompakt, ohne Leerzeichen nach Doppelpunkt und Komma.
- Die `:active`-Selektoren stammen aus **Plan 003**. Ist der noch nicht umgesetzt, existieren diese Regeln noch nicht — das ist unschädlich, die Neutralisierung greift dann später automatisch.

## Steps

1. `css/style.css:361–366`: den bestehenden `@media (prefers-reduced-motion:reduce)`-Block durch die erste Zielfassung ersetzen (die vier vorhandenen Zeilen bleiben darin unverändert erhalten).
2. Direkt darunter den zweiten Block `@media (prefers-reduced-motion:reduce) and (max-width:860px){ … }` anhängen.
3. Prüfen, dass die Datei danach mit diesem Block endet und `css/style.css:36` unangetastet ist.

## Boundaries

- **`.nav-links` außerhalb der Reduced-Motion-Blöcke nicht anfassen** — die normale Fahrt von rechts (Zeile 126) bleibt für alle anderen Nutzer erhalten.
- **Die Burger-Transformationen (Zeilen 118–120) nicht entfernen.** Das Kreuz muss weiterhin erscheinen, es soll nur nicht mehr dorthin animieren. Wer die Transforms löscht, nimmt Nutzern die einzige Anzeige, ob das Menü offen ist.
- Den Hero-Blitz und die `.reveal`-Zeile nicht verändern — die sind bereits korrekt abgefangen.
- Keine weiteren Elemente „vorsorglich" ruhigstellen, die keine Positions- oder Skalierungsänderung machen (`background`, `color`, `border-color`, `box-shadow`, `opacity`).
- Wenn der Block nicht dem hier zitierten Stand entspricht: **stoppen und melden**.

## Verification

- **Mechanisch**: `grep -c "prefers-reduced-motion" css/style.css` liefert 3 (Zeile 36 plus die beiden Blöcke am Dateiende). `grep -n "important" css/style.css` zeigt keinen neuen Treffer.
- **Feel check**: DevTools → Rendering-Panel → „Emulate CSS media feature prefers-reduced-motion: reduce", Fenster auf unter 860 px Breite, dann
  - Menü öffnen: es **blendet ein**, statt von rechts hereinzufahren. Nichts wandert seitlich über den Bildschirm.
  - Menü schließen: es blendet aus und ist danach nicht mehr anklickbar — ein Tap an der Stelle, wo das Menü war, darf keinen Link auslösen (`visibility:hidden` muss greifen).
  - Der Burger zeigt weiterhin das Kreuz, wenn das Menü offen ist — nur ohne Drehbewegung dorthin.
  - Einen Button gedrückt halten: keine Skalierung, aber ein weicher Farbwechsel als Rückmeldung.
  - Über einen Bildrahmen fahren: kein Zoom.
  - Danach die Emulation ausschalten und prüfen, dass Menü und Burger sich wieder normal bewegen.
- **Done when**: Mit aktivierter Systemeinstellung bewegt sich nichts mehr in Position oder Größe — auch nicht das mobile Menü — und trotzdem gibt jede Interaktion eine erkennbare Rückmeldung.
