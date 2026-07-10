# Zerp Restaurant

A restaurant management module for [Zerp](https://github.com/zerp-pk) — a Laravel package with a React/Inertia frontend, following the same structure as every other `zerp/*` module.

It turns Zerp into a full front-of-house and kitchen system: build a menu, take orders on a POS screen, run the floor, fire tickets to the kitchen, and post revenue and stock movements into Zerp's accounting and inventory automatically.

## Features

- **Menu** — categories, items with variations (sizes) and modifier groups (add-ons, spice level), availability toggles, and per-item images.
- **Tables & floor** — areas with a drag-and-drop floor plan, table status board, waiter allocation, table merge/split, reservations (today / upcoming / past), and automatic release of stale reserved tables.
- **Orders (POS)** — dine-in, takeaway, and delivery on a POS-style screen (category tabs, item grid, customize dialog, live cart) with server-authoritative pricing and name/price snapshots. Settling a dine-in order frees its table and posts a balanced double-entry revenue journal into the account module.
- **Kitchen display (KDS)** — per-item routing to kitchen stations, orders auto-fire on placement, a live ticket board with station filters and bump-to-ready/served.
- **Recipes & inventory** — link menu items to product-service ingredients so settling an order decrements warehouse stock.
- **Role-based permissions** throughout.

## Installation

The module is consumed by the main Zerp app as a Composer path package. In the app's `composer.json`, add a path repository and require it:

```json
{
  "repositories": [
    { "type": "path", "url": "../ZerpPackages/restaurant", "options": { "symlink": true } }
  ],
  "require": { "zerp/restaurant": "@dev" }
}
```

Then:

```bash
composer update zerp/restaurant
php artisan migrate
php artisan package:seed Restaurant
```

Or enable it as part of the **Restaurant** install preset:

```bash
php artisan app:install --preset=restaurant
```

## License

MIT — see [LICENSE](LICENSE).
