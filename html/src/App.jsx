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
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR)
  const [secondaryColor, setSecondaryColor] = useState(null)
  const [plateText, setPlateText]       = useState('')
  const [plateAvailable, setPlateAvailable] = useState(null)
  const [purchasing, setPurchasing]     = useState(false)
  const [sortMode, setSortMode]         = useState('name-asc')
  const [previewing, setPreviewing]     = useState(false)
  const [secondaryColorPrice, setSecondaryColorPrice] = useState(2000)

  useEffect(() => {
    const handler = (e) => {
      const d = e.data
      if (!d?.type) return

      if (d.type === 'open') {
        setVehicles(d.vehicles || [])
        setCategories(d.categories || [])
        setShopLabel(d.shopLabel || 'Dealership')
        setSecondaryColorPrice(d.secondaryColorPrice || 2000)
        setActiveCategory(null)
        setSearchQuery('')
        setSelectedVehicle(null)
        setPrimaryColor(DEFAULT_COLOR)
        setSecondaryColor(null)
        setPlateText('')
        setPlateAvailable(null)
        setPurchasing(false)
        setPreviewing(false)
        setSortMode('name-asc')
        setVisible(true)
        return
      }

      if (d.type === 'close') {
        setVisible(false)
        setPreviewing(false)
        return
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleSelectVehicle = useCallback((vehicle) => {
    setSelectedVehicle(vehicle)
    setPrimaryColor(DEFAULT_COLOR)
    setSecondaryColor(null)
    setPlateText('')
    setPlateAvailable(null)
    setPreviewing(false)
  }, [])

  const handleBack = useCallback(() => {
    if (previewing) {
      fetchNUI('exitPreview')
      setPreviewing(false)
    }
    setSelectedVehicle(null)
    setPrimaryColor(DEFAULT_COLOR)
    setSecondaryColor(null)
    setPlateText('')
    setPlateAvailable(null)
  }, [previewing])

  const handlePreview = useCallback(() => {
    if (!selectedVehicle) return
    setPreviewing(true)
    fetchNUI('previewVehicle', {
      model: selectedVehicle.model,
      color: primaryColor,
      secondaryColor: secondaryColor,
      plate: plateText || null,
    })
  }, [selectedVehicle, primaryColor, secondaryColor, plateText])

  const handleExitPreview = useCallback(() => {
    fetchNUI('exitPreview')
    setPreviewing(false)
  }, [])

  const handlePrimaryColorChange = useCallback((color) => {
    setPrimaryColor(color)
    if (previewing) fetchNUI('changePrimaryColor', { color })
  }, [previewing])

  const handleSecondaryColorChange = useCallback((color) => {
    setSecondaryColor(color)
    if (previewing) fetchNUI('changeSecondaryColor', { color })
  }, [previewing])

  const handleToggleSecondary = useCallback((enabled) => {
    if (enabled) {
      const c = { ...primaryColor }
      setSecondaryColor(c)
      if (previewing) fetchNUI('changeSecondaryColor', { color: c })
    } else {
      setSecondaryColor(null)
      if (previewing) fetchNUI('changeSecondaryColor', { color: primaryColor })
    }
  }, [primaryColor, previewing])

  const handlePlateChange = useCallback((plate) => {
    const clean = plate.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 8)
    setPlateText(clean)
    setPlateAvailable(null)
    if (clean.length > 0 && previewing) {
      fetchNUI('changePlate', { plate: clean })
    }
  }, [previewing])

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
      color: primaryColor,
      secondaryColor: secondaryColor,
      plate: plateText || null,
    })
  }, [selectedVehicle, primaryColor, secondaryColor, plateText, purchasing])

  const handleClose = useCallback(() => {
    if (previewing) {
      fetchNUI('exitPreview')
      setPreviewing(false)
    }
    setVisible(false)
    fetchNUI('closeUI')
  }, [previewing])

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (previewing) {
          handleExitPreview()
        } else if (selectedVehicle) {
          handleBack()
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, selectedVehicle, previewing, handleBack, handleClose, handleExitPreview])

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
      primaryColor={primaryColor}
      onPrimaryColorChange={handlePrimaryColorChange}
      secondaryColor={secondaryColor}
      onSecondaryColorChange={handleSecondaryColorChange}
      onToggleSecondary={handleToggleSecondary}
      secondaryColorPrice={secondaryColorPrice}
      plateText={plateText}
      onPlateChange={handlePlateChange}
      plateAvailable={plateAvailable}
      onCheckPlate={handleCheckPlate}
      purchasing={purchasing}
      onPurchase={handlePurchase}
      onClose={handleClose}
      previewing={previewing}
      onPreview={handlePreview}
      onExitPreview={handleExitPreview}
    />
  )
}
