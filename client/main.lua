local QBCore = exports['qb-core']:GetCoreObject()

local isOpen       = false
local previewVeh   = nil
local currentShop  = nil
local spawnedNpcs  = {}
local activeMenu   = nil

-- ── Helpers ──────────────────────────────────────────────────────────────────

local function loadModel(model)
    local hash = type(model) == 'string' and joaat(model) or model
    if HasModelLoaded(hash) then return hash end
    RequestModel(hash)
    local timeout = 0
    while not HasModelLoaded(hash) and timeout < 5000 do
        Wait(10)
        timeout = timeout + 10
    end
    return hash
end

local function deletePreview()
    if previewVeh and DoesEntityExist(previewVeh) then
        QBCore.Functions.DeleteVehicle(previewVeh)
    end
    previewVeh = nil
end

local function spawnPreview(model, shopId)
    deletePreview()
    local shop  = Config.Dealerships[shopId]
    if not shop then return end
    local spawn = shop.spawnPoint
    local hash  = loadModel(model)
    if not HasModelLoaded(hash) then return end

    previewVeh = CreateVehicle(hash, spawn.x, spawn.y, spawn.z, spawn.w, false, false)
    SetEntityAsMissionEntity(previewVeh, true, true)
    SetVehicleOnGroundProperly(previewVeh)
    FreezeEntityPosition(previewVeh, true)
    SetEntityInvincible(previewVeh, true)
    SetVehicleDoorsLocked(previewVeh, 2)
    SetModelAsNoLongerNeeded(hash)
end

local function applyColor(color)
    if not previewVeh or not DoesEntityExist(previewVeh) then return end
    local r = color.r or 0
    local g = color.g or 0
    local b = color.b or 0
    SetVehicleCustomPrimaryColour(previewVeh, r, g, b)
    SetVehicleCustomSecondaryColour(previewVeh, r, g, b)
end

local function applyPlate(plate)
    if not previewVeh or not DoesEntityExist(previewVeh) then return end
    SetVehicleNumberPlateText(previewVeh, plate:upper():sub(1, 8))
end

-- ── Open / Close ─────────────────────────────────────────────────────────────

local function openDealership(shopId)
    if isOpen then return end
    local shop = Config.Dealerships[shopId]
    if not shop then return end
    currentShop = shopId
    isOpen = true

    QBCore.Functions.TriggerCallback('citgo_dealership:getVehicles', function(vehicles)
        local categoriesSet = {}
        local categoriesList = {}
        for _, cat in ipairs(shop.categories) do
            categoriesSet[cat] = true
        end

        local filtered = {}
        for _, veh in ipairs(vehicles) do
            if categoriesSet[veh.category] then
                veh.photo = exports['uz_AutoShot']:getVehiclePhotoURL(veh.model)
                filtered[#filtered + 1] = veh
                if not categoriesList[veh.category] then
                    categoriesList[veh.category] = true
                end
            end
        end

        local cats = {}
        for _, cat in ipairs(shop.categories) do
            if categoriesList[cat] then
                cats[#cats + 1] = cat
            end
        end

        SendNUIMessage({
            type       = 'open',
            vehicles   = filtered,
            categories = cats,
            shopLabel  = shop.label,
            shopId     = shopId,
        })
        SetNuiFocus(true, true)
    end, shop.shopKey)
end

local function closeDealership()
    if not isOpen then return end
    isOpen = false
    currentShop = nil
    deletePreview()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = 'close' })
end

-- ── NUI Callbacks ────────────────────────────────────────────────────────────

RegisterNUICallback('previewVehicle', function(data, cb)
    if data.model and currentShop then
        spawnPreview(data.model, currentShop)
        if data.color then applyColor(data.color) end
        if data.plate and #data.plate > 0 then applyPlate(data.plate) end
    end
    cb('ok')
end)

RegisterNUICallback('changeColor', function(data, cb)
    if data.color then applyColor(data.color) end
    cb('ok')
end)

RegisterNUICallback('changePlate', function(data, cb)
    if data.plate then applyPlate(data.plate) end
    cb('ok')
end)

RegisterNUICallback('checkPlate', function(data, cb)
    if not data.plate or #data.plate < 1 then
        cb({ available = false })
        return
    end
    QBCore.Functions.TriggerCallback('citgo_dealership:checkPlate', function(available)
        cb({ available = available })
    end, data.plate)
end)

RegisterNUICallback('purchaseVehicle', function(data, cb)
    QBCore.Functions.TriggerCallback('citgo_dealership:purchaseVehicle', function(result)
        if result.success then
            deletePreview()

            QBCore.Functions.Notify('Vehicle purchased! Plate: ' .. result.plate, 'success', 5000)

            local shop  = Config.Dealerships[currentShop]
            local spawn = shop.spawnPoint
            QBCore.Functions.SpawnVehicle(data.model, function(veh)
                local props = {
                    plate  = result.plate,
                    color1 = { data.color and data.color.r or 0, data.color and data.color.g or 0, data.color and data.color.b or 0 },
                    color2 = { data.color and data.color.r or 0, data.color and data.color.g or 0, data.color and data.color.b or 0 },
                }
                QBCore.Functions.SetVehicleProperties(veh, props)
                SetVehicleOnGroundProperly(veh)
                FreezeEntityPosition(veh, false)
                SetEntityInvincible(veh, false)
                TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
                TriggerEvent('vehiclekeys:client:SetOwner', result.plate)
                SetVehicleEngineOn(veh, true, true)
            end, spawn, true, false)
        else
            QBCore.Functions.Notify(result.message or 'Purchase failed', 'error', 3000)
        end

        closeDealership()
        cb('ok')
    end, {
        model = data.model,
        color = data.color or { r = 0, g = 0, b = 0 },
        plate = data.plate or nil,
    })
end)

RegisterNUICallback('closeUI', function(_, cb)
    closeDealership()
    cb('ok')
end)

-- ── Blips & NPCs ─────────────────────────────────────────────────────────────

CreateThread(function()
    for _, shop in pairs(Config.Dealerships) do
        if shop.blip and shop.blip.sprite then
            local loc  = shop.location
            local blip = AddBlipForCoord(loc.x, loc.y, loc.z)
            SetBlipSprite(blip, shop.blip.sprite)
            SetBlipColour(blip, shop.blip.color or 0)
            SetBlipScale(blip, shop.blip.scale or 0.7)
            SetBlipAsShortRange(blip, true)
            BeginTextCommandSetBlipName('STRING')
            AddTextComponentSubstringPlayerName(shop.blip.label or shop.label)
            EndTextCommandSetBlipName(blip)
        end

        if shop.npc then
            local loc  = shop.location
            local hash = loadModel(shop.npc.model)
            if HasModelLoaded(hash) then
                local ped = CreatePed(0, hash, loc.x, loc.y, loc.z - 1.0, shop.npc.heading or loc.w, false, true)
                SetEntityInvincible(ped, true)
                SetBlockingOfNonTemporaryEvents(ped, true)
                FreezeEntityPosition(ped, true)
                SetModelAsNoLongerNeeded(hash)
                spawnedNpcs[#spawnedNpcs + 1] = ped
            end
        end
    end
end)

-- ── core_focus context menus ─────────────────────────────────────────────────

local useOxInteraction = Config.UseOxTarget or Config.UseOxRadial
local SHOP_RADIUS = 5.0

local function getNearestDealership()
    local ped    = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local best, bestDist = nil, SHOP_RADIUS
    for shopId, shop in pairs(Config.Dealerships) do
        local loc  = shop.location
        local dist = #(coords - vector3(loc.x, loc.y, loc.z))
        if dist < bestDist then
            bestDist = dist
            best     = shopId
        end
    end
    return best
end

if not useOxInteraction then
    CreateThread(function()
        while true do
            local nearest = getNearestDealership()

            if nearest ~= activeMenu then
                if activeMenu then
                    exports['core_focus']:RemoveContextMenu('citgo_dealer')
                    activeMenu = nil
                end

                if nearest and not isOpen then
                    local shop = Config.Dealerships[nearest]
                    exports['core_focus']:AddContextMenu('citgo_dealer', {
                        enabled = true,
                        label   = shop.label,
                        icon    = 'fas fa-car',
                        options = {
                            {
                                label  = 'Browse Vehicles',
                                icon   = 'fas fa-car',
                                action = function()
                                    openDealership(nearest)
                                end,
                            },
                        },
                    })
                    activeMenu = nearest
                end
            end

            Wait(nearest and 500 or 1500)
        end
    end)
end

-- ── Optional: ox_target zones ────────────────────────────────────────────────

if Config.UseOxTarget and GetResourceState('ox_target') == 'started' then
    for shopId, shop in pairs(Config.Dealerships) do
        local loc = shop.location
        exports.ox_target:addSphereZone({
            coords = vec3(loc.x, loc.y, loc.z),
            radius = SHOP_RADIUS,
            debug  = false,
            options = {
                {
                    name     = 'dealer_' .. shopId,
                    label    = 'Browse ' .. shop.label,
                    icon     = 'fas fa-car',
                    onSelect = function()
                        openDealership(shopId)
                    end,
                },
            },
        })
    end
end

-- ── Optional: ox_lib radial menu ─────────────────────────────────────────────

if Config.UseOxRadial and GetResourceState('ox_lib') == 'started' then
    CreateThread(function()
        while true do
            local nearest = getNearestDealership()
            if nearest and not isOpen then
                local shop = Config.Dealerships[nearest]
                lib.addRadialItem({
                    id    = 'citgo_dealer_radial',
                    label = shop.label,
                    icon  = 'car',
                    onSelect = function()
                        openDealership(nearest)
                    end,
                })
            else
                lib.removeRadialItem('citgo_dealer_radial')
            end
            Wait(nearest and 500 or 1500)
        end
    end)
end

-- ── Dev Test Command ────────────────────────────────────────────────────────

RegisterCommand('dealership', function(_, args)
    local shopId = args[1] or 'pdm'
    if not Config.Dealerships[shopId] then
        QBCore.Functions.Notify('Invalid dealership: ' .. shopId, 'error', 3000)
        return
    end
    openDealership(shopId)
end, false)

-- ── Cleanup ──────────────────────────────────────────────────────────────────

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    deletePreview()
    for _, ped in ipairs(spawnedNpcs) do
        if DoesEntityExist(ped) then DeleteEntity(ped) end
    end
end)
