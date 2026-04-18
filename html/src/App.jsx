import React, { useState, useEffect, useCallback } from 'react'
import { DealershipUI } from './components/DealershipUI'
import { fetchNUI } from './utils/fetchNUI'

export { fetchNUI }

const DEFAULT_COLOR = { r: 28, g: 29, b: 33 }

export default function App() {
  const [visible, setVisible]           = useState(false)
  const [vehicles, setVehicles]         = useState([])
  const [categories, setCategories]     = useState([])
  const [shopLabel, setShopLabel]       = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR)
  const [plateText, setPlateText]       = useState('')
  const [plateAvailable, setPlateAvailable] = useState(null)
  const [purchasing, setPurchasing]     = useState(false)
  const [sortMode, setSortMode]         = useState('name-asc')

  useEffect(() => {
    const handler = (e) => {
      const d = e.data
      if (!d?.type) return

      if (d.type === 'open') {
        setVehicles(d.vehicles || [])
        setCategories(d.categories || [])
        setShopLabel(d.shopLabel || 'Dealership')
        setActiveCategory(null)
        setSearchQuery('')
        setSelectedVehicle(null)
        setSelectedColor(DEFAULT_COLOR)
        setPlateText('')
        setPlateAvailable(null)
        setPurchasing(false)
        setSortMode('name-asc')
        setVisible(true)
        return
      }

      if (d.type === 'close') {
        setVisible(false)
        return
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleSelectVehicle = useCallback((vehicle) => {
    setSelectedVehicle(vehicle)
    setSelectedColor(DEFAULT_COLOR)
    setPlateText('')
    setPlateAvailable(null)
    fetchNUI('previewVehicle', { model: vehicle.model, color: DEFAULT_COLOR })
  }, [])

  const handleBack = useCallback(() => {
    setSelectedVehicle(null)
    setSelectedColor(DEFAULT_COLOR)
    setPlateText('')
    setPlateAvailable(null)
    fetchNUI('previewVehicle', { model: null })
  }, [])

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color)
    fetchNUI('changeColor', { color })
  }, [])

  const handlePlateChange = useCallback((plate) => {
    const clean = plate.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8)
    setPlateText(clean)
    setPlateAvailable(null)
    if (clean.length > 0) {
      fetchNUI('changePlate', { plate: clean })
    }
  }, [])

  const handleCheckPlate = useCallback(async () => {
    if (!plateText.trim()) return
    const result = await fetchNUI('checkPlate', { plate: plateText })
    setPlateAvailable(result?.available ?? false)
  }, [plateText])

  const handlePurchase = useCallback(() => {
    if (!selectedVehicle || purchasing) return
    setPurchasing(true)
    fetchNUI('purchaseVehicle', {
      model: selectedVehicle.model,
      color: selectedColor,
      plate: plateText || null,
    })
  }, [selectedVehicle, selectedColor, plateText, purchasing])

  const handleClose = useCallback(() => {
    setVisible(false)
    fetchNUI('closeUI')
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (selectedVehicle) {
          handleBack()
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, selectedVehicle, handleBack, handleClose])

  if (!visible) return null

  return (
    <DealershipUI
      vehicles={vehicles}
      categories={categories}
      shopLabel={shopLabel}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortMode={sortMode}
      onSortChange={setSortMode}
      selectedVehicle={selectedVehicle}
      onSelectVehicle={handleSelectVehicle}
      onBack={handleBack}
      selectedColor={selectedColor}
      onColorChange={handleColorChange}
      plateText={plateText}
      onPlateChange={handlePlateChange}
      plateAvailable={plateAvailable}
      onCheckPlate={handleCheckPlate}
      purchasing={purchasing}
      onPurchase={handlePurchase}
      onClose={handleClose}
    />
  )
}
