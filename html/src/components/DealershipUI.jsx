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
  primaryColor, onPrimaryColorChange,
  secondaryColor, onSecondaryColorChange, onToggleSecondary,
  secondaryColorPrice,
  plateText, onPlateChange, plateAvailable, onCheckPlate,
  purchasing, onPurchase, onClose,
  previewing, onPreview, onExitPreview,
}) {
  const categoryVehicles = useMemo(() => {
    if (!activeCategory) return vehicles
    return vehicles.filter(v => v.category === activeCategory)
  }, [vehicles, activeCategory])

  return (
    <div className="fixed inset-0 z-9998 bg-transparent pointer-events-none">

      {/* LEFT: Category sidebar — hidden during preview */}
      {!previewing && (
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
      )}

      {/* RIGHT: Vehicles / Detail panel */}
      <div
        className="pointer-events-auto fixed right-5 top-5 bottom-5 z-9999 flex flex-col glass animate-enter"
        style={{ width: 400, borderRadius: 14, border: border(), boxShadow: '0 8px 40px rgba(0,0,0,0.7)', overflow: 'hidden' }}>

        {selectedVehicle ? (
          <VehicleDetail
            vehicle={selectedVehicle}
            primaryColor={primaryColor}
            onPrimaryColorChange={onPrimaryColorChange}
            secondaryColor={secondaryColor}
            onSecondaryColorChange={onSecondaryColorChange}
            onToggleSecondary={onToggleSecondary}
            secondaryColorPrice={secondaryColorPrice}
            plateText={plateText}
            onPlateChange={onPlateChange}
            plateAvailable={plateAvailable}
            onCheckPlate={onCheckPlate}
            purchasing={purchasing}
            onPurchase={onPurchase}
            onBack={onBack}
            previewing={previewing}
            onPreview={onPreview}
            onExitPreview={onExitPreview}
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

      {/* Preview camera hints */}
      {previewing && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-9999 animate-enter"
          style={{ transform: 'translateX(-50%)' }}>
          <div className="glass pointer-events-none" style={{
            padding: '8px 20px', borderRadius: 10, border: border(0.1),
          }}>
            <span style={{ fontSize: 10, color: '#888' }}>
              <span style={{ color: '#aaa', fontWeight: 600 }}>Drag</span> rotate &nbsp;·&nbsp;
              <span style={{ color: '#aaa', fontWeight: 600 }}>Scroll</span> zoom &nbsp;·&nbsp;
              <span style={{ color: '#aaa', fontWeight: 600 }}>W/S</span> height
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
