import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'sb_cart_v1'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStored)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const totalQty = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
    [items],
  )

  const addToCart = useCallback((service, qty = 1) => {
    setItems((prev) => {
      const id = service.id
      const idx = prev.findIndex((p) => p.serviceId === id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + qty,
        }
        return next
      }
      return [
        ...prev,
        {
          serviceId: id,
          name: service.name,
          price: Number(service.price),
          quantity: qty,
          categoryName: service.category_name || '',
          image_url: service.image_url || '',
        },
      ]
    })
    setDrawerOpen(true)
  }, [])

  const setQuantity = useCallback((serviceId, quantity) => {
    const q = Math.max(0, Number(quantity) || 0)
    setItems((prev) => {
      if (q === 0) return prev.filter((i) => i.serviceId !== serviceId)
      return prev.map((i) =>
        i.serviceId === serviceId ? { ...i, quantity: q } : i,
      )
    })
  }, [])

  const removeItem = useCallback((serviceId) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items,
      totalQty,
      subtotal,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addToCart,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      totalQty,
      subtotal,
      drawerOpen,
      addToCart,
      setQuantity,
      removeItem,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
