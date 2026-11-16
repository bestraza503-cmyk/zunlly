'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Heart, Menu, Search, ShoppingBag, Sparkles, UserRound, X, Star, Flame, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { createClient } from '@/lib/supabase/client' 
import { CardWishlistButton } from '@/components/card-wishlist-button'
import { useRouter } from 'next/navigation'
import { Toast, ToastType } from '@/components/toast'

type StoreProduct = { 
  id: string; name: string; category: string; price: string | number; 
  image: string; notes: string; tag: string;
  product_reviews?: { rating: number }[]; 
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const featureCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }
  })
}

function ProductCard({ product, onAdd, onBuyNow, onShowToast }: { 
  product: StoreProduct; 
  onAdd: () => void; 
  onBuyNow: () => void;
  onShowToast: (message: string, type: ToastType) => void;
}) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    onAdd()
    setAdded(true)
    onShowToast(`${product.name}`, 'cart')
    setTimeout(() => setAdded(false), 2000)
  }

  const reviews = product.product_reviews || []
  const reviewCount = reviews.length
  const avgRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0

  return (
    <motion.article 
      variants={fadeUp} 
      className="group flex flex-col relative bg-white p-2.5 sm:p-3 shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow-md"
    >
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f4f2ee] rounded-md mb-2.5 sm:mb-3">
          <Image 
            src={product.image || '/placeholder.jpg'} 
            alt={product.name} 
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
          />
          {product.tag && (
            <span className="absolute left-1.5 sm:left-2 top-1.5 sm:top-2 bg-white/95 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[9px] font-semibold uppercase tracking-[.15em] sm:tracking-[.2em] text-[#292722] rounded shadow-sm">
              {product.tag}
            </span>
          )}
          <div className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 z-10 scale-90 sm:scale-100">
            <CardWishlistButton productId={product.id} />
          </div>
        </div>
      </Link>

      <Link href={`/shop/${product.id}`} className="flex flex-col mt-1 flex-1">
        <p className="text-[10px] sm:text-[9px] font-semibold uppercase tracking-[.15em] sm:tracking-[.2em] text-[#b49a62] mb-1 sm:mb-1">
          {product.category || 'FRAGRANCE'}
        </p>
        <div className="flex flex-col min-[400px]:flex-row min-[400px]:justify-between items-start gap-1 min-[400px]:gap-2">
          <h3 className="font-serif text-[16px] sm:text-[14px] md:text-[16px] leading-tight text-[#292722] group-hover:text-[#b49a62] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[14px] sm:text-[12px] md:text-[13px] font-bold text-[#292722] whitespace-nowrap pt-0.5">
            {String(product.price).includes('PKR') ? product.price : `PKR ${Number(product.price).toLocaleString('en-PK')}`}
          </p>
        </div>
        <p className="mt-1 sm:mt-1 text-[12px] sm:text-[10px] md:text-[11px] text-[#827b70] line-clamp-1 mb-2 sm:mb-2">
          {product.notes || 'Signature Scent'}
        </p>
        
        <div className="flex items-center gap-1.5 sm:gap-1.5 mb-3 sm:mb-3">
          <div className="flex text-[#b49a62]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                fill={star <= Number(avgRating) ? 'currentColor' : 'none'} 
                strokeWidth={1.5} 
                className="mr-[1px] sm:w-[11px] sm:h-[11px]"
              />
            ))}
          </div>
          <span className="text-[11px] sm:text-[10px] text-[#827b70] font-medium">({reviewCount})</span>
        </div>
      </Link>

      {/* ✅ SIRF BUY NOW BUTTON */}
      <div className="mt-auto">
        <button 
          onClick={(e) => { e.preventDefault(); onBuyNow(); }} 
          className="w-full py-2.5 sm:py-2 text-[12px] sm:text-[10px] font-bold uppercase tracking-[.1em] text-[#1d1c1a] bg-white border border-[#1d1c1a] hover:bg-[#1d1c1a] hover:text-white transition-colors rounded"
        >
          Buy Now
        </button>
      </div>
    </motion.article>
  )
}

export function ZunllyHome({ 
  products, 
  heroImage = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90' 
}: { products: StoreProduct[]; heroImage?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({ message: '', type: 'cart', visible: false })
  
  const supabase = createClient()
  const router = useRouter() 
  const { count: cartCount, add: addCartItem } = useCart()
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true })
  }

  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.category} ${p.notes}`.toLowerCase().includes(query.toLowerCase())), [products, query])
  
  const addToCart = async (product: StoreProduct) => {
    await addCartItem({ id: product.id, name: product.name, price: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0, image: product.image })
  }

  const buyNow = (product: StoreProduct) => {
    router.push(`/checkout?buy_now=${product.id}&qty=1`)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const userInitial = userName.charAt(0).toUpperCase()

  const hotSellingProducts = products.slice(0, 4)
  const bestSellingProducts = products.length > 4 ? products.slice(4, 8) : products.slice(4)

  const features = [
    {icon: Truck, title: 'Free Delivery', desc: 'On orders over PKR 10,000'},
    {icon: ShieldCheck, title: '100% Authentic', desc: 'Premium quality guaranteed'},
    {icon: Sparkles, title: 'Long Lasting', desc: 'Composed to linger beautifully'},
    {icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns'}
  ]

  /* ============================================================
     ✅ HERO SLIDER — PREMIUM LUXURY IMAGES
     ============================================================ */
  const heroSlides = useMemo(() => [
    {
      image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=2000&q=90',
      eyebrow: 'The Signature Collection',
      titleLine1: 'Scent is',
      titleLine2: 'memory.',
      description: 'Considered fragrances that linger beyond the moment. Composed with intention, worn with confidence.',
    },
    {
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90',
      eyebrow: 'For Him & For Her',
      titleLine1: 'Wear your',
      titleLine2: 'story.',
      description: 'From bold oud to soft florals — discover fragrances that speak louder than words, and last longer than moments.',
    },
    {
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=2000&q=90',
      eyebrow: 'New Arrivals',
      titleLine1: 'Find your',
      titleLine2: 'forever scent.',
      description: 'Handcrafted in Pakistan with the finest ingredients. Luxury that feels personal, expressive, and entirely yours.',
    },
  ], [])

  const [activeSlide, setActiveSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const AUTOPLAY_MS = 3000

  const goToSlide = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > activeSlide ? 1 : -1))
    setActiveSlide(index)
  }, [activeSlide])

  const nextSlide = useCallback(() => {
    setDirection(1)
    setActiveSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      nextSlide()
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [nextSlide, isPaused])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    setIsPaused(true)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide()
        else prevSlide()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
    setIsPaused(false)
  }

  const slide = heroSlides[activeSlide]

  const slideVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.08, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir: number) => ({ opacity: 0, scale: 1.02, x: dir > 0 ? -60 : 60, transition: { duration: 0.5, ease: 'easeIn' } })
  }

  const textVariants: Variants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#292722] font-sans selection:bg-[#b49a62] selection:text-white relative">
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      <div className="bg-[#1d1c1a] py-3 sm:py-2.5 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee text-[11px] sm:text-[9px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#d8c49a]">
          <span className="mx-6">Complimentary delivery across Pakistan on orders over PKR 4,000</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Quality meets value. Discover your signature scent.</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Complimentary delivery across Pakistan on orders over PKR 4,000</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Quality meets value. Discover your signature scent.</span>
          <span className="mx-4">✦</span>
        </div>
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 bg-white transition-all duration-300 border-b border-gray-100 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="mx-auto flex h-[72px] sm:h-[84px] max-w-[1440px] items-center justify-between px-4 sm:px-5 lg:px-12 relative">
          <div className="flex items-center gap-4 sm:gap-8 flex-1">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ml-2 hover:text-[#b49a62]">
              {menuOpen ? <X size={28} className="sm:w-6 sm:h-6" /> : <Menu size={28} className="sm:w-6 sm:h-6" />}
            </button>
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="ZUNLLY Logo" width={90} height={32} className="object-contain w-[95px] sm:w-[110px] h-auto" />
            </Link>
            <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[.15em] text-gray-900">
              <Link href="/shop" className="hover:text-[#b49a62] transition-colors relative group">Shop All<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
              <Link href="/category/for-him" className="hover:text-[#b49a62] transition-colors relative group">For Him<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
              <Link href="/category/for-her" className="hover:text-[#b49a62] transition-colors relative group">For Her<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 justify-end">
            <div className="hidden xl:flex items-center border-b border-gray-300 pb-1 w-48 focus-within:border-[#b49a62] transition-colors">
              <Search size={16} className="text-gray-500" />
              <input type="text" placeholder="Search..." onClick={() => setSearchOpen(true)} readOnly className="ml-2 bg-transparent text-[12px] outline-none w-full cursor-pointer placeholder:text-gray-500" />
            </div>
            <button onClick={() => setSearchOpen(true)} className="xl:hidden hover:text-[#b49a62] p-1"><Search size={26} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" /></button>
            
            {user ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-[#b49a62] p-1">
                <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full border-2 border-[#b49a62] bg-white flex items-center justify-center text-[#1d1c1a] font-bold text-base sm:text-sm shadow-sm">
                  {userInitial}
                </div>
                <span className="hidden sm:block text-[12px] font-bold text-gray-800">
                  {userName.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-[#b49a62]">Login</Link>
                <span className="hidden sm:block text-gray-300">|</span>
                <Link href="/signup" className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-gray-900 hover:text-[#b49a62]">Signup</Link>
                <Link href="/login" className="sm:hidden hover:text-[#b49a62] p-1"><UserRound size={26} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" /></Link>
              </div>
            )}
            
            <Link href="/cart" className="relative hover:text-[#b49a62] p-1">
              <ShoppingBag size={26} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#b49a62] text-[10px] sm:text-[9px] font-bold text-white shadow-sm">{cartCount}</span>}
            </Link>
          </div>
        </div>
        {menuOpen && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="lg:hidden border-t border-gray-100 bg-white px-5 sm:px-6 py-6 sm:py-6 overflow-hidden">
            <div className="flex flex-col gap-6 sm:gap-6 text-[16px] sm:text-[12px] font-bold uppercase tracking-[.15em] text-gray-900">
              <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop All</Link>
              <Link href="/category/for-him" onClick={() => setMenuOpen(false)}>For Him</Link>
              <Link href="/category/for-her" onClick={() => setMenuOpen(false)}>For Her</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)}>Our Story</Link>
            </div>
          </motion.nav>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white/98 p-4 sm:p-6 backdrop-blur-xl sm:p-12">
          <button onClick={() => setSearchOpen(false)} className="absolute right-4 sm:right-6 top-4 sm:top-6 hover:text-[#b49a62]"><X size={30} className="sm:w-7 sm:h-7" /></button>
          <div className="mx-auto mt-24 sm:mt-32 max-w-2xl">
            <p className="text-[12px] sm:text-[10px] font-bold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#b49a62]">Search the collection</p>
            <div className="mt-5 sm:mt-6 flex items-center border-b-2 border-[#292722] pb-3 sm:pb-4">
              <Search size={26} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or notes..." className="ml-3 sm:ml-4 flex-1 bg-transparent font-serif text-2xl sm:text-3xl outline-none placeholder:text-gray-300 text-gray-900" />
            </div>
            <div className="mt-6 sm:mt-8 grid gap-2">
              {query && filtered.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} onClick={() => setSearchOpen(false)} className="flex items-center justify-between border-b border-gray-100 py-4 sm:py-4 hover:text-[#b49a62] group">
                  <span className="font-serif text-xl sm:text-xl">{product.name}</span>
                  <ArrowRight size={22} className="sm:w-[18px] sm:h-[18px] text-gray-300 group-hover:text-[#b49a62]" />
                </Link>
              ))}
              {query && !filtered.length && <p className="text-base sm:text-sm text-gray-500 mt-4">No results found for "{query}"</p>}
            </div>
          </div>
        </div>
      )}

      <main>
        {/* ============================================================
            ✅ HERO SLIDER — MOBILE PE BADA + ZOOM PROPER
            ============================================================ */}
        <section
          className="relative h-[80vh] min-h-[560px] sm:h-[85vh] sm:min-h-[600px] w-full overflow-hidden bg-[#1d1c1a]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* IMAGE LAYER */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={activeSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full h-full"
              >
                <Image
                  src={slide.image}
                  alt={`ZUNLLY hero slide ${activeSlide + 1}`}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center brightness-[0.72]"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* TEXT LAYER */}
          <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-5 sm:px-6 lg:px-16 z-10 pointer-events-none">
            <div className="max-w-xl text-white pt-8 sm:pt-10 lg:pt-0 pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <p className="mb-4 sm:mb-4 text-[12px] sm:text-[10px] font-semibold uppercase tracking-[.25em] sm:tracking-[.35em] text-[#d8c49a]">
                    {slide.eyebrow}
                  </p>
                  <h1 className="font-serif text-6xl min-[400px]:text-7xl leading-[1.05] sm:text-6xl md:text-7xl md:text-[5.5rem]">
                    {slide.titleLine1}<br />
                    <em className="font-light text-white/90">{slide.titleLine2}</em>
                  </h1>
                  <p className="mt-6 sm:mt-8 max-w-sm text-base sm:text-sm leading-relaxed text-white/85">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link href="/shop" className="bg-white px-8 sm:px-8 py-4 sm:py-4 text-center text-[13px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] text-[#292722] transition-transform hover:scale-105 hover:bg-[#d8c49a]">
                  Shop Collection
                </Link>
                <Link href="/about" className="border border-white/40 px-8 sm:px-8 py-4 sm:py-4 text-center text-[13px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] text-white transition-all hover:bg-white hover:text-[#292722]">
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          {/* ARROWS — desktop only */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"
          >
            <ArrowRight size={20} />
          </button>

          {/* DOTS — bottom center */}
          <div className="absolute bottom-7 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx, idx > activeSlide ? 1 : -1)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`relative transition-all duration-500 rounded-full ${
                  activeSlide === idx
                    ? 'w-12 sm:w-10 h-3 sm:h-2 bg-[#d8c49a]'
                    : 'w-3 h-3 sm:w-2 sm:h-2 bg-white/50 hover:bg-white/80'
                }`}
              >
                {activeSlide === idx && (
                  <motion.span
                    key={`progress-${activeSlide}-${isPaused}`}
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '0%' : '100%' }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                )}
              </button>
            ))}
          </div>

          {/* SWIPE ZONE (mobile) */}
          <div
            className="absolute inset-0 z-[5] md:hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </section>

        {/* ✅ HOT SELLING — WAPIS 2 COLUMNS ON MOBILE */}
        {hotSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-[#f8f6f0] px-4 sm:px-5 py-16 sm:py-24 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-4 sm:gap-6 sm:flex-row sm:items-end mb-10 sm:mb-12">
                <div>
                  <p className="text-[13px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#b49a62] flex items-center gap-2"><Flame size={18} className="sm:w-[14px] sm:h-[14px] text-red-500" /> Trending Now</p>
                  <h2 className="mt-3 sm:mt-4 font-serif text-6xl sm:text-4xl md:text-5xl">Hot Selling.</h2>
                </div>
                <Link href="/shop" className="text-[13px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] border-b-2 border-[#292722] pb-1 hover:text-[#b49a62] hover:border-[#b49a62] transition-colors flex items-center gap-2 w-fit">View All <ArrowRight size={17} className="sm:w-[14px] sm:h-[14px]" /></Link>
              </motion.div>
              
              {/* ✅ GRID COLS-2 ON MOBILE */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
                {hotSellingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onBuyNow={() => buyNow(product)} onShowToast={showToast} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-5 py-16 sm:py-24 lg:px-12 lg:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-10 sm:mb-16"><p className="text-[12px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#b49a62]">Discover</p><h2 className="mt-3 sm:mt-4 font-serif text-4xl sm:text-4xl md:text-5xl">Find your signature.</h2></motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[['For Him', '/category/for-him', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85'], ['For Her', '/category/for-her', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'], ['Unisex', '/category/unisex', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85']].map(([name, href, image]) => (
              <motion.div key={name} variants={fadeUp}><Link href={href} className="group relative block h-[320px] sm:h-[450px] overflow-hidden bg-[#ded7cd]"><Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" /><div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 text-white"><h3 className="font-serif text-4xl sm:text-3xl">{name}</h3><p className="mt-2 sm:mt-2 text-[12px] sm:text-[10px] font-semibold uppercase tracking-[.15em] sm:tracking-[.2em] text-white/90 group-hover:text-[#d8c49a] transition-colors flex items-center gap-2">Explore <ArrowRight size={15} className="sm:w-[14px] sm:h-[14px] transition-transform group-hover:translate-x-1" /></p></div></Link></motion.div>
            ))}
          </motion.div>
        </section>

        {/* BEST SELLERS */}
        {bestSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-white px-4 sm:px-5 py-16 sm:py-24 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-4 sm:gap-6 sm:flex-row sm:items-end mb-10 sm:mb-12"><div><p className="text-[13px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#b49a62]">Best Sellers</p><h2 className="mt-3 sm:mt-4 font-serif text-6xl sm:text-4xl md:text-5xl">The iconic scents.</h2></div><Link href="/shop" className="text-[13px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] border-b-2 border-[#292722] pb-1 hover:text-[#b49a62] hover:border-[#b49a62] transition-colors flex items-center gap-2 w-fit">View All <ArrowRight size={17} className="sm:w-[14px] sm:h-[14px]" /></Link></motion.div>
              
              {/* ✅ GRID COLS-2 ON MOBILE FOR BEST SELLERS TOO */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
                {bestSellingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onBuyNow={() => buyNow(product)} onShowToast={showToast} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* BRAND STORY */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-5 py-16 sm:py-24 lg:px-12 lg:py-32 overflow-hidden">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-24">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative"><div className="relative aspect-[4/5] w-full"><Image src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85" alt="ZUNLLY Craftsmanship" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div className="absolute -bottom-5 sm:-bottom-6 -right-3 sm:-right-4 border border-[#cdbb91] bg-white px-5 sm:px-8 py-4 sm:py-6"><p className="font-serif text-4xl sm:text-4xl text-[#b49a62]">01</p><p className="mt-1 sm:mt-1 text-[11px] sm:text-[9px] font-bold uppercase tracking-[.15em] sm:tracking-[.2em] text-[#827b70]">Crafted with care</p></div></motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-lg">
              <motion.div variants={fadeUp}><Sparkles size={26} className="sm:w-6 sm:h-6 text-[#b49a62]" /><p className="mt-5 sm:mt-6 text-[12px] sm:text-[10px] font-bold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#b49a62]">The ZUNLLY Standard</p><h2 className="mt-3 sm:mt-4 font-serif text-5xl sm:text-4xl md:text-5xl leading-tight">The art of<br /><em className="font-light">staying memorable.</em></h2></motion.div>
              <motion.p variants={fadeUp} className="mt-5 sm:mt-6 text-base sm:text-sm leading-relaxed text-[#827b70]">We believe luxury should be felt, not flaunted. Every ZUNLLY fragrance is composed with exceptional ingredients and an eye for balance — creating scents that feel personal, expressive, and entirely your own.</motion.p>
              <motion.ul variants={fadeUp} className="mt-7 sm:mt-8 space-y-4 sm:space-y-4 text-[13px] sm:text-[11px] font-bold uppercase tracking-[.1em] text-[#292722]"><li className="flex items-center gap-3"><Check size={18} className="sm:w-4 sm:h-4 text-[#b49a62]" /> Long-lasting compositions</li><li className="flex items-center gap-3"><Check size={18} className="sm:w-4 sm:h-4 text-[#b49a62]" /> Thoughtfully sourced ingredients</li><li className="flex items-center gap-3"><Check size={18} className="sm:w-4 sm:h-4 text-[#b49a62]" /> Designed in Pakistan</li></motion.ul>
            </motion.div>
          </div>
        </section>

        {/* ✅ BRAND FEATURES — FOOTER KE FORAN UPAR + ANIMATED BOXES */}
        <section className="relative bg-gradient-to-b from-white via-[#f8f6f0] to-white border-t border-[#ded8cc] py-16 sm:py-20 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-[#b49a62]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#b49a62]/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-5 lg:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="text-center mb-12 sm:mb-14"
            >
              <p className="text-[12px] sm:text-[10px] font-bold uppercase tracking-[.25em] text-[#b49a62]">Why Choose Us</p>
              <h2 className="mt-3 sm:mt-3 font-serif text-4xl sm:text-4xl md:text-5xl">The ZUNLLY Promise.</h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
            >
              {features.map((item, idx) => (
                <motion.div
                  key={idx}
                  custom={idx}
                  variants={featureCard}
                  whileHover={{ y: -10, scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl bg-white border border-[#e8e2d6] shadow-sm hover:shadow-2xl hover:shadow-[#b49a62]/20 hover:border-[#b49a62]/40 cursor-default overflow-hidden"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#b49a62]/10 to-transparent" />

                  <div className="relative mb-4 sm:mb-5">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.6, 0.25] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.35 }}
                      className="absolute inset-0 rounded-full bg-[#b49a62]/40 blur-md"
                    />
                    <motion.div
                      whileHover={{ rotate: [0, -12, 12, -8, 0] }}
                      transition={{ duration: 0.7 }}
                      className="relative h-16 w-16 sm:h-16 sm:w-16 rounded-full bg-[#f8f6f0] group-hover:bg-white flex items-center justify-center shadow-sm border border-[#ded8cc] group-hover:border-[#b49a62] transition-colors"
                    >
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.25 }}
                      >
                        <item.icon size={28} className="sm:w-7 sm:h-7 text-[#b49a62]" strokeWidth={1.5} />
                      </motion.div>
                    </motion.div>
                  </div>

                  <h4 className="font-serif text-[17px] sm:text-[18px] text-[#1d1c1a] mb-1.5 group-hover:text-[#b49a62] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[13px] sm:text-[12px] font-medium tracking-wide text-[#827b70]">
                    {item.desc}
                  </p>

                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 bg-gradient-to-r from-transparent via-[#b49a62] to-transparent transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#232F3E] text-white">
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-[#37475A] hover:bg-[#485769] py-4 sm:py-4 text-center cursor-pointer transition-colors"><span className="text-[15px] sm:text-[13px] font-medium">Back to top</span></div>
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-10 sm:py-12 px-4 sm:px-5">
          <div><h4 className="font-bold text-white mb-3 sm:mb-3 text-[17px] sm:text-[15px]">Get to Know Us</h4><ul className="space-y-2 sm:space-y-2 text-[15px] sm:text-[13px] text-gray-300"><li><Link href="/about" className="hover:underline">Our Story</Link></li><li><Link href="/contact" className="hover:underline">Contact Us</Link></li></ul></div>
          <div><h4 className="font-bold text-white mb-3 sm:mb-3 text-[17px] sm:text-[15px]">Shop With Us</h4><ul className="space-y-2 sm:space-y-2 text-[15px] sm:text-[13px] text-gray-300"><li><Link href="/shop" className="hover:underline">All Fragrances</Link></li><li><Link href="/category/for-him" className="hover:underline">For Him</Link></li><li><Link href="/category/for-her" className="hover:underline">For Her</Link></li><li><Link href="/category/unisex" className="hover:underline">Unisex</Link></li></ul></div>
          <div><h4 className="font-bold text-white mb-3 sm:mb-3 text-[17px] sm:text-[15px]">Let Us Help You</h4><ul className="space-y-2 sm:space-y-2 text-[15px] sm:text-[13px] text-gray-300"><li><Link href="/account" className="hover:underline">Your Account</Link></li><li><Link href="/shipping" className="hover:underline">Shipping Rates & Policies</Link></li><li><Link href="/shipping" className="hover:underline">Returns & Replacements</Link></li></ul></div>
          <div>
            <h4 className="font-bold text-white mb-3 sm:mb-3 text-[17px] sm:text-[15px]">Let's Connect</h4>
            <ul className="space-y-2 sm:space-y-2 text-[15px] sm:text-[13px] text-gray-300">
              <li><a href="https://www.instagram.com/zunllyofficial/" className="hover:underline">Instagram</a></li>
              <li><a href="https://web.facebook.com/profile.php?id=61595457614392" className="hover:underline">Facebook</a></li>
              <li><a href="https://www.tiktok.com/@zunllyofficial" className="hover:underline">Tiktok</a></li>
            </ul>
          </div>
        </div>
        <div className="bg-[#131A22] py-8 sm:py-8 text-center border-t border-gray-700 flex flex-col items-center justify-center"><Link href="/" className="mb-4 sm:mb-4 inline-block"><Image src="/logo.png" alt="ZUNLLY Logo" width={100} height={35} className="object-contain brightness-0 invert opacity-90 w-[95px] sm:w-[100px] h-auto" /></Link><p className="text-[13px] sm:text-[12px] text-gray-400 px-4">© 2026 ZUNLLY. All rights reserved. Designed & Crafted in Pakistan.</p></div>
      </footer>

      <motion.a href="https://wa.me/923028770999" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50 flex items-center justify-center group">
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30 group-hover:opacity-0 transition-opacity duration-300" />
        <div className="relative bg-[#25D366] text-white p-4 sm:p-4 rounded-full shadow-[0_10px_20px_rgba(37,211,102,0.3)] transition-shadow duration-300 group-hover:shadow-[0_10px_25px_rgba(37,211,102,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-7 sm:h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
      </motion.a>
</div>
  )
}