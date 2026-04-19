-- Framework detection: QBox (qbx_core) or QBCore (qb-core)

local isQbx = GetResourceState('qbx_core') ~= 'missing'
local isQb  = GetResourceState('qb-core') ~= 'missing'

if not isQbx and not isQb then
    error('[citgo_dealership] No supported framework detected. Requires qbx_core or qb-core.')
end

Framework = {
    isQbx = isQbx,
    name  = isQbx and 'qbx' or 'qb',
}

-- Both frameworks expose QBCore via qb-core exports (QBox bridge provides it)
QBCore = exports['qb-core']:GetCoreObject()
