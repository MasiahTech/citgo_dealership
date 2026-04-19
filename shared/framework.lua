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

-- QBCore object is initialized lazily — accessed via Framework.getCore()
-- This avoids load-order issues since dependencies are not hardcoded
local _core
function Framework.getCore()
    if not _core then
        _core = exports['qb-core']:GetCoreObject()
    end
    return _core
end
