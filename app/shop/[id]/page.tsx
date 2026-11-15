'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CountdownTimer } from '@/components/countdown-timer'
import { Star, Heart, ChevronLeft, ChevronRight, Share2, Zap, Search, ShoppingBag, UserRound, Menu, X } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { getProductImageUrl } from '@/lib/product-image'
import { Toast, ToastType } from '@/components/toast'
import { ShareModal } from '@/components/share-modal'
import { ProductReviews } from '@/components/product-reviews'
import TrackView from '@/components/track-view' // ✅ TrackView Import kiya

// ✅ Helper function for PKR Price
const formatPKR = (price: number) => {
  const safePrice = Number(price) || 0
  return `PKR ${safePrice.toLocaleString('en-PK')}`
}

// ✅ Type definitions for safety
type ProductType = {
  id: string
  name: string
  price: number
  sale_price?: number | null
  sale_end_date?: string | null
  description?: string
  images: any
  gallery_images?: string[] | null
  fragrance_notes?: string[] | null
  sizes?: string[] | null
  category_type?: string | null
  product_reviews?: { rating: number }[]
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const [product, setProduct] = useState<ProductType | null>(null)
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // ✅ SEARCH STATES
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '', type: 'cart', visible: false
  })

  const router = useRouter()
  const { add, count } = useCart()

  // ✅ Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // Fetch Current Product
      const { data: productData } = await supabase
        .from('products')
        .select('*, product_reviews(rating)')
        .eq('id', productId)
        .single()
      
      if (productData) {
        setProduct(productData as ProductType)
        setSelectedSize(productData.sizes?.[0] || '')
        
        // Fetch Suggestions
        const { data: suggestions } = await supabase
          .from('products')
          .select('id, name, price, images, product_reviews(rating)')
          .eq('status', 'published')
          .neq('id', productId)
          .limit(4)
        if (suggestions) setSuggestedProducts(suggestions)
      }

      // Fetch All Products for Search
      const { data: allProd } = await supabase
        .from('products')
        .select('id, name, price, images, category_id')
        .eq('status', 'published')
      
      if (allProd) setAllProducts(allProd)

      setLoading(false)
    }
    fetchData()
  }, [productId])

  useEffect(() => {
    setCartCount(count)
  }, [count])

  const handleAddToCart = () => {
    if (!product) return
    try {
      const finalPrice = isOnSale ? (product.sale_price || product.price) : product.price
      add({ id: product.id, name: product.name, price: Number(finalPrice), image: allImages[0], variant: selectedSize }, quantity)
      setToast({ message: `${quantity} x ${product.name}`, type: 'cart', visible: true })
    } catch (err) {
      console.error("Cart Error:", err)
    }
  }

  const handleAddToWishlist = () => {
    if (!product) return
    setToast({ message: product.name, type: 'wishlist', visible: true })
  }

  const handleShare = async () => {
    if (!product) return
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: `Check out ${product.name} on ZUNLLY!`, url: window.location.href }) } catch (err) { console.log('Error sharing:', err) }
    } else { setIsShareOpen(true) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">Loading...</div>
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">Product not found</div>

  // ✅ Safe calculations
  const allImages = [product.images?.[0], ...(product.gallery_images || [])].filter(Boolean)
  const reviews = product.product_reviews || []
  const reviewCount = reviews.length
  const avgRating = reviewCount > 0 ? (reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0
  const isOnSale = !!(product.sale_price && product.sale_end_date && new Date(product.sale_end_date) > new Date())
  const finalPrice = isOnSale ? (product.sale_price || product.price) : product.price

  const nextImage = () => setActiveImage((prev) => (prev + 1) % allImages.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const userInitial = userName.charAt(0).toUpperCase()

  // ✅ Filter Search Suggestions
  const filteredSuggestions = allProducts.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  return (
    <main className="min-h-screen bg-white text-[#292722] pb-24 font-sans">
      
      {/* ✅ TrackView Yahan Laga Diya Hai (Jaise hi page load hoga view count hoga) */}
      <TrackView productId={product.id} />

      {/* ✅ ZUNLLY SIGNATURE HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto flex h-[80px] max-w-[1440px] items-center justify-between px-5 lg:px-12 relative">
          
          {/* Left: Menu & Links */}
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 -ml-2 hover:text-[#b49a62]">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[.15em] text-gray-900">
              <Link href="/shop" className="hover:text-[#b49a62] transition-colors">Shop</Link>
              <Link href="/category/for-him" className="hover:text-[#b49a62] transition-colors">For Him</Link>
              <Link href="/category/for-her" className="hover:text-[#b49a62] transition-colors">For Her</Link>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Link href="/" className="group flex flex-col items-center">
              <Image src="/logo.png" alt="ZUNLLY Logo" width={110} height={40} className="object-contain group-hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          
          {/* Right: Icons */}
          <div className="flex items-center gap-4 lg:gap-5 flex-1 justify-end">
            
            {/* ✅ SMART EXPANDABLE SEARCH */}
            <div ref={searchRef} className="relative flex items-center justify-end">
              <div 
                className={`flex items-center bg-gray-50 border border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
                  isSearchOpen ? 'w-[250px] md:w-[350px] px-3 py-1.5 rounded-md border-[#b49a62]' : 'w-[36px] h-[36px] justify-center rounded-full hover:bg-gray-100 cursor-pointer'
                }`}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={isSearchOpen ? 16 : 20} className={`text-gray-500 shrink-0 ${isSearchOpen ? 'mr-2' : ''}`} strokeWidth={1.5} />
                
                {isSearchOpen && (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search fragrances..."
                      className="bg-transparent border-none outline-none text-[13px] w-full text-gray-800 placeholder:text-gray-400"
                    />
                    <button onClick={(e) => { e.stopPropagation(); setIsSearchOpen(false); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-800">
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* LIVE SUGGESTIONS DROPDOWN */}
              {isSearchOpen && searchQuery.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-[250px] md:w-[350px] bg-white border border-gray-100 shadow-2xl rounded-lg overflow-hidden z-50">
                  {filteredSuggestions.length > 0 ? (
                    <div className="py-2">
                      <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Products</p>
                      {filteredSuggestions.map((p: any) => (
                        <Link 
                          key={p.id} 
                          href={`/shop/${p.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                            <Image src={getProductImageUrl(p.images)} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-[#b49a62] font-semibold">{formatPKR(Number(p.price))}</p>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1">
                        <Link href={`/shop?q=${searchQuery}`} onClick={() => setIsSearchOpen(false)} className="block text-center px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                          View all results
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-[#b49a62] transition-colors p-1">
                <div className="h-8 w-8 rounded-full border-2 border-[#b49a62] bg-white flex items-center justify-center text-[#1d1c1a] font-bold text-sm shadow-sm hover:bg-[#b49a62] hover:text-white transition-all">
                  {userInitial}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="hover:text-[#b49a62] p-1"><UserRound size={22} strokeWidth={1.5} /></Link>
            )}
            
            <Link href="/cart" className="relative hover:text-[#b49a62] p-1">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#b49a62] text-[9px] font-bold text-white shadow-sm">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-[80%] max-w-[300px] h-full bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <Image src="/logo.png" alt="ZUNLLY" width={100} height={30} className="object-contain" />
              <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-6 text-[13px] font-bold uppercase tracking-[.15em]">
              <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
              <Link href="/category/for-him" onClick={() => setIsMenuOpen(false)}>For Him</Link>
              <Link href="/category/for-her" onClick={() => setIsMenuOpen(false)}>For Her</Link>
              <Link href="/category/unisex" onClick={() => setIsMenuOpen(false)}>Unisex</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
            </nav>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} productName={product.name} />

      {/* Main Product Content */}
      <div className="max-w-[1440px] mx-auto px-5 py-8 lg:px-12">
        <nav className="flex text-[11px] text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[80px_1fr_450px]">
          
          {/* LEFT: Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3">
            {allImages.map((img: string, idx: number) => (
              <button key={idx} onClick={() => setActiveImage(idx)} className={`relative aspect-square w-full border-2 rounded overflow-hidden transition-all ${activeImage === idx ? 'border-[#1d1c1a]' : 'border-transparent hover:border-gray-300'}`}>
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* CENTER: Main Image */}
          <div className="flex flex-col">
            <div className="relative aspect-square w-full bg-[#f8f8f8] rounded-lg overflow-hidden group border border-gray-100">
              <Image src={allImages[activeImage] || '/placeholder.jpg'} alt={product.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-110" priority />
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={24} className="text-gray-700" /></button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={24} className="text-gray-700" /></button>
                </>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {isOnSale && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">SALE</span>}
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={handleAddToWishlist} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Heart size={20} className="text-gray-600 hover:text-red-500 transition-colors" />
                </button>
                <button onClick={handleShare} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex lg:hidden gap-2 mt-4 overflow-x-auto pb-2">
              {allImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-16 h-16 shrink-0 border rounded overflow-hidden ${activeImage === idx ? 'border-[#1d1c1a]' : 'border-transparent'}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-serif text-gray-900 leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#b49a62]">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={14} fill={star <= Number(avgRating) ? 'currentColor' : 'none'} strokeWidth={1} />))}</div>
              <span className="text-xs text-[#b49a62] hover:underline cursor-pointer">{reviewCount} product ratings</span>
            </div>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-6">
              <div className="w-10 h-10 bg-[#1d1c1a] text-[#b49a62] rounded-full flex items-center justify-center font-bold text-lg">Z</div>
              <div>
                <p className="text-sm font-medium">ZUNLLY Official <span className="text-gray-500">({reviewCount})</span></p>
                <p className="text-xs text-gray-500">98.5% positive feedback</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">{formatPKR(Number(finalPrice))}</p>
              {isOnSale && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 line-through">{formatPKR(Number(product.price))}</span>
                  <span className="text-xs text-red-600 font-medium">Save {Math.round(((Number(product.price) - Number(finalPrice)) / Number(product.price)) * 100)}%</span>
                </div>
              )}
            </div>
            {isOnSale && product.sale_end_date && (<div className="mb-6 bg-red-50 border border-red-100 p-3 rounded-md"><CountdownTimer endDate={product.sale_end_date} /></div>)}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-20">Condition:</span><span className="text-sm font-medium">New</span></div>
              {product.sizes && product.sizes.length > 0 && (<div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-20">Size:</span><select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-black">{product.sizes.map((size: string) => <option key={size} value={size}>{size}</option>)}</select></div>)}
              <div className="flex items-center gap-4"><span className="text-sm text-gray-600 w-20">Quantity:</span><div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-32"><input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 text-sm text-center outline-none" /></div><span className="text-xs text-gray-500">More than 10 available</span></div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => router.push(`/checkout?buy_now=${product.id}&qty=${quantity}&size=${selectedSize}`)} className="w-full bg-[#b49a62] text-white py-3 rounded-full text-base font-semibold hover:bg-[#a38852] transition-colors shadow-sm">Buy It Now</button>
              
              <button onClick={handleAddToCart} className="w-full bg-white text-[#1d1c1a] border border-[#1d1c1a] py-3 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors">
                Add to cart
              </button>
              
              <button onClick={handleAddToWishlist} className="w-full bg-white text-[#1d1c1a] border border-gray-300 py-3 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart size={18} /> Add to Watchlist
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-100"><Zap size={18} className="text-[#b49a62]" /><p className="text-sm font-medium">People want this. <span className="text-gray-600 font-normal">12 people are watching this.</span></p></div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-100"><Zap size={18} className="text-[#b49a62]" /><p className="text-sm font-medium">This one's trending. <span className="text-gray-600 font-normal">99 have already sold.</span></p></div>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping:</span><span className="font-medium text-gray-900">Free standard delivery</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Returns:</span><span className="font-medium text-[#b49a62] cursor-pointer">30 days returns, Buyer pays return shipping</span></div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 max-w-4xl border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold mb-4">About this product</h2>
          <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{product.description || 'Experience the luxury of ZUNLLY.'}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2"><span className="text-gray-500">Brand:</span> <span className="font-medium">ZUNLLY</span></div>
            <div className="flex gap-2"><span className="text-gray-500">Category:</span> <span className="font-medium">{product.category_type || 'Fragrance'}</span></div>
            <div className="flex gap-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(', ') : 'N/A'}</span></div>
            <div className="flex gap-2"><span className="text-gray-500">Type:</span> <span className="font-medium">Eau de Parfum</span></div>
          </div>
        </div>

        {/* ✅ REVIEWS SECTION */}
        <ProductReviews productId={product.id} />

        {/* Similar Items */}
        {suggestedProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-200 pt-10">
            <div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-semibold">Similar Items</h2><p className="text-sm text-gray-500 mt-1">Sponsored</p></div><Link href="/shop" className="text-[#b49a62] text-sm hover:underline">See all</Link></div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {suggestedProducts.map((sp: any) => {
                const spReviews = sp.product_reviews || []
                const spReviewCount = spReviews.length
                const spAvgRating = spReviewCount > 0 ? (spReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / spReviewCount).toFixed(1) : 0
                return (
                  <Link href={`/shop/${sp.id}`} key={sp.id} className="group flex flex-col border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square bg-[#f8f8f8] mb-3 rounded overflow-hidden"><Image src={getProductImageUrl(sp.images)} alt={sp.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" /><button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><Heart size={14} className="text-gray-600" /></button></div>
                    <h3 className="text-sm text-gray-900 line-clamp-2 group-hover:text-[#b49a62] transition-colors">{sp.name}</h3>
                    <div className="mt-1 flex items-center gap-1"><div className="flex text-[#b49a62]">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={10} fill={star <= Number(spAvgRating) ? 'currentColor' : 'none'} />))}</div><span className="text-[10px] text-gray-500">({spReviewCount})</span></div>
                    <p className="mt-2 text-lg font-bold text-gray-900">{formatPKR(Number(sp.price))}</p>
                    <p className="text-xs text-gray-500 mt-1">Free delivery</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}