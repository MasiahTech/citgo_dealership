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

local function getVehicleData(model)
    for _, veh in pairs(QBCore.Shared.Vehicles) do
        if veh.model == model then return veh end
    end
    return nil
end

local function buildMods(plate, primaryColor, secondaryColor)
    local pc = primaryColor or { r = 0, g = 0, b = 0 }
    local sc = secondaryColor or pc
    return json.encode({
        plate  = plate,
        color1 = { pc.r or 0, pc.g or 0, pc.b or 0 },
        color2 = { sc.r or 0, sc.g or 0, sc.b or 0 },
        fuelLevel    = 100.0,
        engineHealth = 1000.0,
        bodyHealth   = 1000.0,
    })
end

local function insertVehicle(citizenid, model, plate, mods)
    local hash = tostring(joaat(model))
    MySQL.insert.await(
        'INSERT INTO player_vehicles (citizenid, vehicle, hash, mods, plate, garage, fuel, engine, body, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        { citizenid, model, hash, mods, plate, Config.DefaultGarage, 100, 1000.0, 1000.0, 0 }
    )
end

local function resolvePlate(requested)
    if requested then
        local taken = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { requested })
        if taken then return generatePlate() end
        return requested
    end
    return generatePlate()
end

-- ── Finance Helpers ─────────────────────────────────────────────────────────

local function getFinanceTier(score)
    for _, tier in ipairs(Config.Finance.tiers) do
        if score >= tier.minScore then return tier end
    end
    return nil
end

local function getFinanceDetails(citizenid, vehiclePrice)
    if not Config.Finance.enabled then
        return nil, 'Financing is not available'
    end

    local ok, score = pcall(exports['tgg-banking'].GetCreditScore, exports['tgg-banking'], citizenid)
    if not ok or not score then
        score = MySQL.scalar.await('SELECT score FROM tgg_banking_credit_scores WHERE playerId = ?', { citizenid })
    end
    if not score then
        return nil, 'Unable to retrieve credit score'
    end

    if score < Config.Finance.minCreditScore then
        return nil, 'Credit score too low to finance'
    end

    local tier = getFinanceTier(score)
    if not tier then
        return nil, 'No eligible financing tier'
    end

    if vehiclePrice > tier.maxPrice then
        return nil, ('Credit score too low for vehicles over $%s'):format(
            tostring(math.floor(tier.maxPrice))
        )
    end

    local totalInterest  = vehiclePrice * (tier.rate / 100)
    local totalOwed      = vehiclePrice + totalInterest
    local dailyPayment   = math.ceil(totalOwed / Config.Finance.loanDuration)

    return {
        score         = score,
        tier          = tier.label,
        rate          = tier.rate,
        totalOwed     = totalOwed,
        totalInterest = totalInterest,
        duration      = Config.Finance.loanDuration,
        dailyPayment  = dailyPayment,
        maxPrice      = tier.maxPrice,
    }
end

-- ── Callbacks ───────────────────────────────────────────────────────────────

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

QBCore.Functions.CreateCallback('citgo_dealership:getFinanceInfo', function(source, cb, data)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then cb({ available = false, reason = 'Player not found' }) return end

    local vehicleData = getVehicleData(data.model)
    if not vehicleData then cb({ available = false, reason = 'Vehicle not found' }) return end

    local totalPrice = vehicleData.price + (data.surcharge or 0)
    local details, err = getFinanceDetails(Player.PlayerData.citizenid, totalPrice)

    if not details then
        cb({ available = false, reason = err })
        return
    end

    cb({
        available    = true,
        score        = details.score,
        tier         = details.tier,
        rate         = details.rate,
        totalOwed    = details.totalOwed,
        interest     = details.totalInterest,
        duration     = details.duration,
        dailyPayment = details.dailyPayment,
        maxPrice     = details.maxPrice,
    })
end)

QBCore.Functions.CreateCallback('citgo_dealership:purchaseVehicle', function(source, cb, data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then cb({ success = false, message = 'Player not found' }) return end

    local model = data.model
    local plate = data.plate and data.plate:upper():sub(1, 8) or nil
    local vehicleData = getVehicleData(model)

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

    plate = resolvePlate(plate)
    local mods = buildMods(plate, data.color, data.secondaryColor)
    insertVehicle(Player.PlayerData.citizenid, model, plate, mods)

    cb({ success = true, plate = plate, price = price })
end)

QBCore.Functions.CreateCallback('citgo_dealership:financeVehicle', function(source, cb, data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then cb({ success = false, message = 'Player not found' }) return end

    local model = data.model
    local plate = data.plate and data.plate:upper():sub(1, 8) or nil
    local vehicleData = getVehicleData(model)

    if not vehicleData then
        cb({ success = false, message = 'Vehicle not found' })
        return
    end

    local hasSecondary = data.secondaryColor ~= nil
    local surcharge    = hasSecondary and Config.SecondaryColorPrice or 0
    local totalPrice   = vehicleData.price + surcharge
    local citizenid    = Player.PlayerData.citizenid

    local details, err = getFinanceDetails(citizenid, totalPrice)
    if not details then
        cb({ success = false, message = err })
        return
    end

    local loanResult = exports['tgg-banking']:CreateAndApproveLoan(citizenid, {
        amount           = totalPrice,
        duration         = Config.Finance.loanDuration,
        paymentFrequency = Config.Finance.paymentFrequency,
        autoPayment      = Config.Finance.autoPayment,
    })

    if not loanResult or not loanResult.success then
        cb({ success = false, message = loanResult and loanResult.message or 'Loan denied by bank' })
        return
    end

    plate = resolvePlate(plate)
    local mods = buildMods(plate, data.color, data.secondaryColor)
    insertVehicle(citizenid, model, plate, mods)

    -- Track the loan-to-vehicle mapping for repo system
    MySQL.insert.await(
        'INSERT INTO dealership_loans (citizenid, loan_id, vehicle, plate, financed_at) VALUES (?, ?, ?, ?, NOW())',
        { citizenid, loanResult.loanId, model, plate }
    )

    cb({
        success      = true,
        plate        = plate,
        loanId       = loanResult.loanId,
        totalOwed    = details.totalOwed,
        dailyPayment = details.dailyPayment,
        rate         = details.rate,
    })
end)

-- ── Repo System — check for missed payments ─────────────────────────────────

CreateThread(function()
    if not Config.Finance.enabled then return end

    while true do
        Wait(Config.Finance.repoCheckInterval * 1000)

        local loans = MySQL.query.await([[
            SELECT dl.*, tbl.missedPayments, tbl.status AS loanStatus
            FROM dealership_loans dl
            JOIN tgg_banking_loans tbl ON tbl.loanId = dl.loan_id
            WHERE dl.repossessed = 0
        ]])
        if loans then
            for _, record in ipairs(loans) do
                if record.missedPayments and record.missedPayments >= Config.Finance.maxMissedPayments then
                    MySQL.update.await('DELETE FROM player_vehicles WHERE citizenid = ? AND plate = ?', {
                        record.citizenid, record.plate
                    })
                    MySQL.update.await('UPDATE dealership_loans SET repossessed = 1 WHERE id = ?', { record.id })

                    local Player = QBCore.Functions.GetPlayerByCitizenId(record.citizenid)
                    if Player then
                        TriggerClientEvent('QBCore:Notify', Player.PlayerData.source,
                            'Your ' .. record.vehicle .. ' has been repossessed due to missed payments',
                            'error', 10000
                        )
                    end

                    print(('[citgo_dealership] Repossessed %s (plate: %s) from %s — %d missed payments'):format(
                        record.vehicle, record.plate, record.citizenid, record.missedPayments
                    ))
                end
            end
        end
    end
end)
