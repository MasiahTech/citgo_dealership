import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import { CategorySidebar } from './CategorySidebar'
import { VehicleGrid } from './VehicleGrid'
import { VehicleDetail } from './VehicleDetail'

const border = (o = 0.06) => `1px solid rgba(255,255,255,${o})`
const bg     = (o = 0.03) => `rgba(255,255,255,${o})`

export function DealershipUI({
  vehicles, categories, shopLabel,
  activeCategory, onCategoryChange,
  searchQuery, onSearchChange,
  sortMode, onSortChange,
  selectedVehicle, onSelectVehicle, onBack,
  selectedColor, onColorChange,
  plateText, onPlateChange, plateAvailable, onCheckPlate,
  purchasing, onPurchase, onClose,
}) {
  const categoryVehicles = useMemo(() => {
    if (!activeCategory) return vehicles
    return vehicles.filter(v => v.category === activeCategory)
  }, [vehicles, activeCategory])

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div
        className="glass flex"
        style={{
          width: 720, height: 520, borderRadius: 14, overflow: 'hidden',
          border: border(0.08),
        }}>
        <div style={{
          width: 220, flexShrink: 0,
          borderRight: border(0.04),
          display: 'flex', flexDirection: 'column',
        }}>
          <CategorySidebar
            categories={categories}
            vehicles={vehicles}
            activeCategory={activeCategory}
            onSelect={onCategoryChange}
            shopLabel={shopLabel}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {selectedVehicle ? (
            <VehicleDetail
              vehicle={selectedVehicle}
              selectedColor={selectedColor}
              onColorChange={onColorChange}
              plateText={plateText}
              onPlateChange={onPlateChange}
              plateAvailable={plateAvailable}
              onCheckPlate={onCheckPlate}
              purchasing={purchasing}
              onPurchase={onPurchase}
              onBack={onBack}
            />
          ) : (
            <VehicleGrid
              vehicles={categoryVehicles}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              sortMode={sortMode}
              onSortChange={onSortChange}
              onSelect={onSelectVehicle}
            />
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 18, right: 18,
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(0,0,0,0.5)', border: border(0.1),
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <X style={{ width: 14, height: 14, color: '#888' }} />
      </button>
    </div>
  )
}
