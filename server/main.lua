local QBCore = exports['qb-core']:GetCoreObject()

-- ── Routing Buckets ─────────────────────────────────────────────────────────

RegisterNetEvent('citgo_dealership:enterBucket', function()
    local src = source
    SetPlayerRoutingBucket(src, src)
end)

RegisterNetEvent('citgo_dealership:exitBucket', function()
    local src = source
    SetPlayerRoutingBucket(src, 0)
end)

-- ── Helpers ─────────────────────────────────────────────────────────────────

local function generatePlate()
    local chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    local plate
    repeat
        plate = ''
        for _ = 1, 8 do
            local idx = math.random(1, #chars)
            plate = plate .. chars:sub(idx, idx)
        end
        local result = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { plate })
    until not result
    return plate
end

QBCore.Functions.CreateCallback('citgo_dealership:getVehicles', function(source, cb, shopKey)
    local vehicles = {}
    for _, veh in pairs(QBCore.Shared.Vehicles) do
        local shop = veh.shop
        if type(shop) == 'table' then
            for _, s in ipairs(shop) do
                if s == shopKey then
                    vehicles[#vehicles + 1] = {
                        model    = veh.model,
                        name     = veh.name,
                        brand    = veh.brand,
                        price    = veh.price,
                        category = veh.category,
                        type     = veh.type,
                    }
                    break
                end
            end
        elseif shop == shopKey then
            vehicles[#vehicles + 1] = {
                model    = veh.model,
                name     = veh.name,
                brand    = veh.brand,
                price    = veh.price,
                category = veh.category,
                type     = veh.type,
            }
        end
    end
    cb(vehicles)
end)

QBCore.Functions.CreateCallback('citgo_dealership:checkPlate', function(source, cb, plate)
    plate = plate:upper():sub(1, 8)
    if #plate < 1 then
        cb(false)
        return
    end
    local result = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { plate })
    cb(not result)
end)

QBCore.Functions.CreateCallback('citgo_dealership:purchaseVehicle', function(source, cb, data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then cb({ success = false, message = 'Player not found' }) return end

    local model = data.model
    local plate = data.plate and data.plate:upper():sub(1, 8) or nil

    local vehicleData = nil
    for _, veh in pairs(QBCore.Shared.Vehicles) do
        if veh.model == model then
            vehicleData = veh
            break
        end
    end

    if not vehicleData then
        cb({ success = false, message = 'Vehicle not found' })
        return
    end

    local hasSecondary = data.secondaryColor ~= nil
    local surcharge    = hasSecondary and Config.SecondaryColorPrice or 0
    local price        = vehicleData.price + surcharge
    local cash         = Player.PlayerData.money['cash']
    local bank         = Player.PlayerData.money['bank']

    if bank >= price then
        Player.Functions.RemoveMoney('bank', price, 'vehicle-purchase')
    elseif cash >= price then
        Player.Functions.RemoveMoney('cash', price, 'vehicle-purchase')
    else
        cb({ success = false, message = 'Not enough money' })
        return
    end

    if plate then
        local taken = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { plate })
        if taken then
            plate = generatePlate()
        end
    else
        plate = generatePlate()
    end

    local primaryColor   = data.color or { r = 0, g = 0, b = 0 }
    local secondaryColor = data.secondaryColor or primaryColor
    local hash = tostring(joaat(model))
    local mods = json.encode({
        plate  = plate,
        color1 = { primaryColor.r or 0, primaryColor.g or 0, primaryColor.b or 0 },
        color2 = { secondaryColor.r or 0, secondaryColor.g or 0, secondaryColor.b or 0 },
        fuelLevel    = 100.0,
        engineHealth = 1000.0,
        bodyHealth   = 1000.0,
    })

    MySQL.insert.await(
        'INSERT INTO player_vehicles (citizenid, vehicle, hash, mods, plate, garage, fuel, engine, body, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        { Player.PlayerData.citizenid, model, hash, mods, plate, Config.DefaultGarage, 100, 1000.0, 1000.0, 0 }
    )

    cb({ success = true, plate = plate, price = price })
end)
