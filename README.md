# citgo_dealership

A premium vehicle dealership resource for QBCore FiveM servers. Features a sleek glassmorphic UI with vehicle browsing, searching, sorting, color customization, custom license plates, and seamless purchase flow.

## Features

- **Glassmorphic UI** — Modern dark glass-panel design with smooth animations
- **Vehicle Thumbnails** — Automatic vehicle photos via uz_AutoShot integration
- **Category Browsing** — Filter vehicles by class (Compacts, Sedans, SUVs, Sports, Super, etc.)
- **Search & Sort** — Find vehicles by name, brand, or model; sort by price or name
- **Color Customization** — Pick from 112 GTA vehicle colors before purchase
- **Custom License Plates** — Choose your own plate with availability checking
- **Multi-Dealership** — Configure multiple dealership locations with separate inventories
- **NPC Dealers** — Optional NPC shopkeepers at each location
- **Flexible Interaction** — core_focus context menus (default), optional ox_target and ox_lib radial menu support

## Dependencies

| Resource | Required |
|----------|----------|
| [qb-core](https://github.com/qbcore-framework/qb-core) | Yes |
| [oxmysql](https://github.com/overextended/oxmysql) | Yes |
| [uz_AutoShot](https://uz-scripts.com/) | Yes |
| [core_focus](https://github.com/DotzDev/core_focus) | Default interaction |
| [ox_target](https://github.com/overextended/ox_target) | Optional |
| [ox_lib](https://github.com/overextended/ox_lib) | Optional |

## Installation

1. Drop `citgo_dealership` into your resources folder
2. Import `vehshop.sql` into your database
3. Add `ensure citgo_dealership` to your server.cfg (after dependencies)
4. Configure dealership locations in `config.lua`

## Configuration

```lua
Config.UseOxTarget = false   -- Use ox_target instead of core_focus
Config.UseOxRadial = false   -- Use ox_lib radial menu instead of core_focus
Config.DefaultGarage = 'pillboxgarage'

Config.Dealerships = {
    pdm = {
        label = 'Premium Deluxe Motorsport',
        shopKey = 'pdm',             -- Matches shop field in qb-core vehicles.lua
        location = vec4(-56.49, -1098.84, 26.42, 70.0),
        spawnPoint = vec4(-27.45, -1082.65, 26.67, 340.0),
        npc = { model = 's_m_m_autoshop_01', heading = 70.0 },
        categories = { 'compacts', 'sedans', 'suvs', ... },
        blip = { sprite = 326, color = 3, scale = 0.7, label = 'Car Dealer' },
    },
}
```

### Interaction Modes

- **Default:** core_focus context menu — no extra dependencies
- **ox_target:** Set `Config.UseOxTarget = true` — adds sphere zones at dealership locations
- **ox_lib radial:** Set `Config.UseOxRadial = true` — adds radial menu option when near dealer

> If any ox option is enabled, core_focus is automatically disabled.

## Database

Import `vehshop.sql` to create the `player_vehicles` table. This is the standard QBCore vehicle ownership table used by most garage resources.

## Vehicle Data

Vehicles are pulled from `qb-core/shared/vehicles.lua`. Each dealership filters by the `shop` field. Categories, names, brands, and prices all come from the shared vehicle list — no duplicate configuration needed.

## License

MIT
