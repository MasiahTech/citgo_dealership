import React, { useMemo } from 'react'
import { CategorySidebar } from './CategorySidebar'
import { VehicleGrid } from './VehicleGrid'
import { VehicleDetail } from './VehicleDetail'

const border = (o = 0.06) => `1px solid rgba(255,255,255,${o})`

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
    <div className="fixed inset-0 z-9998 bg-transparent pointer-events-none">

      {/* LEFT: Category sidebar */}
      <div
        className="pointer-events-auto fixed left-5 top-5 bottom-5 z-9999 flex flex-col glass animate-enter"
        style={{ width: 260, borderRadius: 14, border: border(), boxShadow: '0 8px 40px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
        <CategorySidebar
          categories={categories}
          vehicles={vehicles}
          activeCategory={activeCategory}
          onSelect={onCategoryChange}
          shopLabel={shopLabel}
        />
      </div>

      {/* RIGHT: Vehicles / Detail panel */}
      <div
        className="pointer-events-auto fixed right-5 top-5 bottom-5 z-9999 flex flex-col glass animate-enter"
        style={{ width: 400, borderRadius: 14, border: border(), boxShadow: '0 8px 40px rgba(0,0,0,0.7)', overflow: 'hidden' }}>

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
  )
}
