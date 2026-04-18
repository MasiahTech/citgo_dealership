Config = {}

Config.UseOxTarget = false
Config.UseOxRadial = false

Config.DefaultGarage = 'pillboxgarage'

Config.Dealerships = {
    pdm = {
        label        = 'Premium Deluxe Motorsport',
        shopKey      = 'pdm',
        blip         = { sprite = 326, color = 3, scale = 0.7, label = 'Car Dealer' },
        location     = vec4(-56.49, -1098.84, 26.42, 70.0),
        spawnPoint   = vec4(-27.45, -1082.65, 26.67, 340.0),
        npc          = { model = 's_m_m_autoshop_01', heading = 70.0 },
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
