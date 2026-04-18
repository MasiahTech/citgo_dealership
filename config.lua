Config = {}

Config.UseOxTarget = false
Config.UseOxRadial = false

Config.DefaultGarage = 'pillboxgarage'

Config.SecondaryColorPrice = 2000

Config.PreviewPoint = vec4(1219.25, -2280.94, -49.0, 180.67)

Config.Dealerships = {
    pdm = {
        label        = 'Premium Deluxe Motorsport',
        shopKey      = 'pdm',
        blip         = { sprite = 326, color = 3, scale = 0.7, label = 'Car Dealer' },
        location     = vec4(-30.85, -1087.37, 26.65, 164.48),
        spawnPoint   = vec4(-51.66, -1095.82, 26.48, 154.87),
        npc          = { model = 's_m_m_autoshop_01', heading = 164.48 },
        categories   = {
            'compacts', 'sedans', 'suvs', 'coupes', 'sports',
            'sportsclassic', 'super', 'muscle', 'offroad', 'vans',
            'motorcycles', 'openwheel',
        },
    },
    luxury = {
        label        = 'Luxury Autos',
        shopKey      = 'luxury',
        blip         = { sprite = 326, color = 5, scale = 0.7, label = 'Luxury Autos' },
        location     = vec4(-1260.17, -356.47, 36.91, 204.0),
        spawnPoint   = vec4(-1246.15, -348.34, 36.91, 204.0),
        npc          = { model = 's_m_m_autoshop_01', heading = 204.0 },
        categories   = {
            'super', 'sports', 'sportsclassic', 'coupes', 'sedans',
        },
    },
}
