# ScrapBot: Spielentwicklung und Daten-Handbuch

Diese Datei erklärt, wo die wichtigen Spieldaten liegen und wie du sie selbst bearbeiten kannst. Für neue Geräte, Fahrzeuge, Rohstoffe oder Aufträge musst du normalerweise nicht die Spiellogik ändern.

## Die wichtigsten Ordner

```text
src/
  lib/
    data.js                 Rohstoffe und Upgrades
    electronics.js          gefundene Elektrogeräte
    vehicles.js             gefundene Fahrzeuge
    quests.js               Hauptquartieraufträge
    game/
      inventory.ts          gemeinsame Inventarregeln
      market.ts             Marktpreise und Mengenregeln
      progression.ts        XP, Level und Upgrade-Freischaltungen
    components/
      GameHeader.svelte     Header und Tab-Navigation
      RobotSidebar.svelte   rechte Roboter-Seitenleiste
  routes/
    +page.svelte            Spielzustand, Abläufe und übrige Ansichten
```

## Grundregeln beim Bearbeiten

1. Jede `id` muss eindeutig sein. Sie ist der technische Name eines Items.
2. IDs am besten nur mit kleinen Buchstaben, Zahlen und Unterstrichen schreiben, zum Beispiel `old_radio`.
3. Nach jedem Objekt in einer Liste steht ein Komma, außer beim letzten Objekt.
4. Zahlen ohne Anführungszeichen schreiben: `findChance: 0.15`.
5. Texte und IDs stehen in einfachen oder doppelten Anführungszeichen.
6. Nach Änderungen `npm run check` ausführen.

## Ein neues Elektrogerät hinzufügen

Datei: `src/lib/electronics.js`

Füge innerhalb der `ELECTRONICS`-Liste ein Objekt ein:

```js
{
  id: 'solar_radio',
  name: 'Solar-Radio',
  icon: '📻',
  findChance: 0.08,
  dismantleTimeSec: 35,
  sellValue: 75,
  yields: [
    { id: 'scrap', amount: 2 },
    { id: 'copper', amount: 3 },
    { id: 'chips', amount: 1 }
  ]
},
```

Bedeutung der Felder:

- `id`: eindeutige technische ID
- `name`: Name im Spiel
- `icon`: Emoji oder anderes sichtbares Zeichen
- `findChance`: Gewicht für die Fundchance. Die Werte werden beim Suchen automatisch normalisiert. `0.08` bedeutet also ein Gewicht von 8.
- `dismantleTimeSec`: Zerlegezeit in Sekunden
- `sellValue`: Verkaufspreis im Markt
- `yields`: Rohstoffe, die beim Zerlegen entstehen

Das neue Gerät wird automatisch in Suche, Werkbank, Markt, Inventar und Dev-Panel verwendet.

## Ein neues Fahrzeug hinzufügen

Datei: `src/lib/vehicles.js`

Die Struktur ist fast gleich:

```js
{
  id: 'electric_scooter',
  name: 'Alter E-Scooter',
  icon: '🛴',
  findChance: 0.12,
  dismantleTimeSec: 55,
  sellValue: 110,
  yields: [
    { id: 'scrap', amount: 5 },
    { id: 'aluminum', amount: 3 },
    { id: 'plastic', amount: 4 }
  ]
},
```

Auch Fahrzeuge erscheinen danach automatisch in Suche, Werkbank, Markt, Inventar und Dev-Panel.

## Einen Rohstoff hinzufügen

Datei: `src/lib/data.js`

Der Rohstoff muss zuerst in `MATERIALS` angelegt werden:

```js
rare_metal: {
  name: 'Seltenes Metall',
  icon: '💎',
  rarity: 'selten'
},
```

Erlaubte Seltenheiten sind:

- `gewöhnlich`
- `selten`
- `episch`

Danach solltest du den Rohstoff zusätzlich in `MATERIAL_SELL_VALUES` in `src/lib/game/market.ts` eintragen, damit Kaufen und Verkaufen einen Preis haben:

```ts
rare_metal: 25
```

Wenn ein Item diesen Rohstoff erzeugen soll, verwendest du dessen ID im `yields`-Bereich:

```js
{ id: 'rare_metal', amount: 2 }
```

## Einen Auftrag hinzufügen

Datei: `src/lib/quests.js`

```js
{
  id: 'quest_new_project',
  title: 'Neues Projekt',
  description: 'Sammle Material für ein wichtiges Bauprojekt.',
  rewards: {
    copper: 20,
    screws: 15
  },
  requirements: [
    {
      type: 'material',
      id: 'aluminum',
      amount: 25,
      label: '25x Aluminium im Inventar'
    },
    {
      type: 'upgrade',
      count: 1,
      label: 'Mindestens 1 Roboter-Upgrade besitzen'
    }
  ]
},
```

Aktuell mögliche Anforderungstypen:

- `material`: eine bestimmte Menge eines Rohstoffs besitzen
- `upgrade`: eine bestimmte Anzahl Roboter-Upgrades besitzen
- `base_upgrade`: eine bestimmte Anzahl Basis-Ausbaustufen besitzen

Belohnungen werden als Rohstoff-ID und Menge eingetragen.

## Upgrades bearbeiten

Datei: `src/lib/data.js`

Ein einfaches Roboter-Upgrade hat `costs`:

```js
{
  id: 'new_sensor',
  name: 'Neuer Sensor',
  icon: '📡',
  category: 'Sensoren',
  description: 'Verbessert eine Funktion des ScrapBots.',
  costs: [
    { id: 'copper', amount: 20 },
    { id: 'chips', amount: 3 }
  ]
},
```

Mehrstufige Upgrades wie der Plasmabrenner verwenden stattdessen `levels`. Jede Stufe braucht eine eigene ID und eigene Kosten. Die Stufen werden automatisch nacheinander angeboten.

## XP und Level

Die XP-Regeln liegen in `src/lib/game/progression.ts`. Dort kannst du die Belohnungen zentral anpassen:

```ts
export const XP_REWARDS = {
  search: 5,
  dismantle: 12,
  quest: 50,
  upgrade: 25
};
```

XP erhält der ScrapBot aktuell für:

- eine abgeschlossene Suche
- das Finden eines Items. Seltene Items geben zusätzliche XP.
- das Zerlegen eines Geräts oder Fahrzeugs
- das Abschließen eines Auftrags
- den Kauf eines Upgrades

Die Levelkurve startet mit 100 XP für Level 2. Danach werden pro Level 50 XP mehr benötigt. Die Levelanforderungen für Roboter-Upgrades stehen ebenfalls in `progression.ts`:

```ts
export const UPGRADE_REQUIRED_LEVELS = {
  laser_cutter: 1,
  radar_eyes: 2,
  diamond_blade: 3,
  solar_battery: 4
};
```

Die XP und der aktuelle Level werden in der rechten Roboter-Seitenleiste angezeigt. Neue Aktionen können später einfach mit `awardExperience(...)` in der Spielseite angeschlossen werden.

## Batterien und Energie

Batterien werden direkt in `src/routes/+page.svelte` über diese beiden Werte gesteuert:

```ts
const BATTERY_PRICE = 50;
const BATTERY_ENERGY = 50;
```

`BATTERY_PRICE` ist der Credit-Preis für eine Batterie. `BATTERY_ENERGY` bestimmt, wie viel Energie eine eingesetzte Batterie wiederherstellt. Im Menü **Markt** kann man Batterien kaufen und einsetzen. Die Energie wird dabei höchstens bis zum aktuellen `maxEnergy` aufgefüllt.

## Was du besser nicht ändern solltest

- Die Inventar-IDs müssen mit den Katalog-IDs übereinstimmen.
- Die Feldnamen wie `yields`, `findChance` und `dismantleTimeSec` werden von der Spiellogik erwartet.
- Änderungen an `src/routes/+page.svelte` sind nur nötig, wenn sich das Verhalten des Spiels ändern soll.
- Bei neuen Rohstoffen darf der Eintrag im Marktpreis-Modul nicht vergessen werden.

## Kontrolle nach Änderungen

Im Projektordner ausführen:

```text
npm run check
```

Wenn der Check ohne Fehler und Warnungen durchläuft, ist die Datenstruktur syntaktisch korrekt. Für eine zusätzliche Produktionsprüfung:

```text
npm run build
```

## Merksatz

**Neue Inhalte kommen in die Daten-Dateien. Neue Regeln kommen in `src/lib/game/`. Neue sichtbare Bereiche kommen in `src/lib/components/`.**
