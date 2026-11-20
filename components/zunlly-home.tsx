'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Heart, Menu, Search, ShoppingBag, Sparkles, UserRound, X, Star, Flame, Truck, ShieldCheck, RotateCcw, ChevronDown } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { createClient } from '@/lib/supabase/client'
import { CardWishlistButton } from '@/components/card-wishlist-button' // Aapka existing component
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
    <article className="group flex flex-col relative bg-white p-3 sm:p-4 rounded-md border border-[#ebe2d5] transition-all hover:border-[#a67c52] h-full">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden bg-[#f4ebe1] rounded-md mb-2 sm:mb-3">
          <Image
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          {product.tag && (
            <span className="absolute left-1.5 top-1.5 bg-white/95 px-1 py-0.5 text-[7px] sm:text-[9px] font-semibold uppercase tracking-[.1em] text-[#3e2723] rounded shadow-sm">
              {product.tag}
            </span>
          )}
          <div className="absolute right-1.5 top-1.5 z-10 scale-90 sm:scale-100 origin-top-right">
            <CardWishlistButton productId={product.id} />
          </div>
        </div>
      </Link>

      <Link href={`/shop/${product.id}`} className="flex flex-col mt-0 flex-1">
        <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[.15em] text-[#a67c52] mb-0.5">
          {product.category || 'COLLECTION'}
        </p>
        
        <div className="flex flex-col gap-0.5 mb-1">
          <h3 className="font-serif text-[13px] sm:text-[15px] leading-tight text-[#3e2723] group-hover:text-[#a67c52] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-[13px] font-bold text-[#3e2723]">
            {String(product.price).includes('PKR') ? product.price : `PKR ${Number(product.price).toLocaleString('en-PK')}`}
          </p>
        </div>

        <p className="text-[9px] sm:text-[11px] text-[#7a6b5d] line-clamp-1 mb-1">
          {product.notes || 'Signature Scent'}
        </p>

        <div className="flex items-center gap-1 mb-2 mt-auto">
          <div className="flex text-[#a67c52]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                fill={star <= Number(avgRating) ? 'currentColor' : 'none'}
                strokeWidth={1.5}
                className="mr-[0.5px] sm:w-[12px] sm:h-[12px]"
              />
            ))}
          </div>
          <span className="text-[8px] sm:text-[10px] text-[#7a6b5d] font-medium">({reviewCount})</span>
        </div>
      </Link>

      <div className="mt-auto">
        <button
          onClick={(e) => { e.preventDefault(); onBuyNow(); }}
          className="w-full py-1.5 sm:py-2.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-[.1em] text-white bg-[#3e2723] hover:bg-[#a67c52] transition-colors rounded"
        >
          Buy Now
        </button>
      </div>
    </article>
  )
}

export function ZunllyHome({
  products,
  heroImage = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90'
}: { products: StoreProduct[]; heroImage?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [shopHovered, setShopHovered] = useState(false)

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

  const hotSellingProducts = products.slice(0, 12)
  const bestSellingProducts = products.length > 8 ? products.slice(8, 12) : products.slice(4, 8)

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over PKR 10,000' },
    { icon: ShieldCheck, title: '100% Authentic', desc: 'Premium quality guaranteed' },
    { icon: Sparkles, title: 'Long Lasting', desc: 'Composed to linger beautifully' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' }
  ]

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

  const [hotSellingIndex, setHotSellingIndex] = useState(0)
  const [isHotSellingPaused, setIsHotSellingPaused] = useState(false)

  useEffect(() => {
    if (isHotSellingPaused) return
    const timer = setInterval(() => {
      setHotSellingIndex((prev) => (prev + 1) % hotSellingProducts.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [hotSellingProducts.length, isHotSellingPaused])

  const nextHotSelling = () => {
    setHotSellingIndex((prev) => (prev + 1) % hotSellingProducts.length)
  }
  const prevHotSelling = () => {
    setHotSellingIndex((prev) => (prev - 1 + hotSellingProducts.length) % hotSellingProducts.length)
  }

  const getCarouselItems = () => {
    if (hotSellingProducts.length === 0) return []
    const prevIdx = (hotSellingIndex - 1 + hotSellingProducts.length) % hotSellingProducts.length
    const currIdx = hotSellingIndex
    const nextIdx = (hotSellingIndex + 1) % hotSellingProducts.length
    return [
      { ...hotSellingProducts[prevIdx], position: 'left' as const, key: `item-${prevIdx}-left` },
      { ...hotSellingProducts[currIdx], position: 'center' as const, key: `item-${currIdx}-center` },
      { ...hotSellingProducts[nextIdx], position: 'right' as const, key: `item-${nextIdx}-right` },
    ]
  }

  const carouselItems = getCarouselItems()

  return (
    <div className="min-h-screen bg-[#f4ebe1] text-[#3e2723] font-sans selection:bg-[#a67c52] selection:text-white relative">

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#3e2723] py-2.5 sm:py-2 text-center">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[.15em] text-[#f4ebe1]">
          Free Delivery Over Rs 5,000 · Cash on Delivery · 925 Sterling Silver
        </p>
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 bg-white transition-all duration-300 border-b border-[#ebe2d5] ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="mx-auto flex h-[68px] sm:h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-5 lg:px-12 relative">

          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image src="/logo.png" alt="ZUNLLY Logo" width={90} height={32} className="object-contain w-[76px] sm:w-[96px] h-auto" />
          </Link>

          {/* NAV */}
          <nav className="hidden lg:flex items-center gap-7 text-[11px] font-bold uppercase tracking-[.15em] text-[#3e2723]">
            <Link href="/" className="relative pb-1 hover:text-[#a67c52] transition-colors">
              HOME
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#a67c52]" />
            </Link>

            <div
              className="relative flex items-center"
              onMouseEnter={() => setShopHovered(true)}
              onMouseLeave={() => setShopHovered(false)}
            >
              <Link href="/shop" className="relative pb-1 hover:text-[#a67c52] transition-colors flex items-center gap-1">
                SHOP
                <ChevronDown size={12} className={`transition-transform duration-300 ${shopHovered ? 'rotate-180' : ''}`} />
              </Link>

              <AnimatePresence>
                {shopHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full mt-2 w-48 bg-white border border-[#ebe2d5] shadow-lg rounded-sm py-1.5 z-50"
                  >
                    {[
                      { label: 'ALL FRAGRANCES', href: '/shop' },
                      { label: 'FOR HIM', href: '/category/for-him' },
                      { label: 'FOR HER', href: '/category/for-her' },
                      { label: 'UNISEX', href: '/category/unisex' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-[10.5px] font-bold tracking-wider text-[#3e2723] hover:bg-[#f4ebe1] hover:text-[#a67c52] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className="relative pb-1 hover:text-[#a67c52] transition-colors">OUR STORY</Link>
            <Link href="/track-order" className="relative pb-1 hover:text-[#a67c52] transition-colors">TRACK ORDER</Link>
            <Link href="/contact" className="relative pb-1 hover:text-[#a67c52] transition-colors">CONTACT</Link>
          </nav>

          {/* ICONS */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
            <button onClick={() => setSearchOpen(true)} className="hover:text-[#a67c52] p-1 transition-colors"><Search size={22} strokeWidth={1.5} /></button>
            
            {/* Wishlist Heart - Mobile & Desktop */}
            <Link href="/wishlist" className="hover:text-[#a67c52] p-1 transition-colors">
              <Heart size={22} strokeWidth={1.5} />
            </Link>

            {user ? (
              <Link href="/account" className="hover:text-[#a67c52] p-1 transition-colors">
                <div className="h-8 w-8 rounded-full border border-[#a67c52] bg-white flex items-center justify-center text-[#3e2723] font-bold text-sm">
                  {userInitial}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="hover:text-[#a67c52] p-1 transition-colors"><UserRound size={22} strokeWidth={1.5} /></Link>
            )}
            <Link href="/cart" className="relative hover:text-[#a67c52] p-1 transition-colors">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3e2723] text-[9px] font-bold text-white shadow-sm">{cartCount}</span>}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-1 hover:text-[#a67c52] transition-colors">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="lg:hidden border-t border-[#ebe2d5] bg-white px-5 py-6 overflow-hidden">
            <div className="flex flex-col gap-5 text-[14px] font-bold uppercase tracking-[.12em] text-[#3e2723]">
              <Link href="/" onClick={() => setMenuOpen(false)}>HOME</Link>
              <Link href="/shop" onClick={() => setMenuOpen(false)}>SHOP</Link>
              <div className="pl-4 flex flex-col gap-3 border-l-2 border-[#a67c52]/40 text-[12px] text-[#7a6b5d]">
                <Link href="/category/for-him" onClick={() => setMenuOpen(false)}>For Him</Link>
                <Link href="/category/for-her" onClick={() => setMenuOpen(false)}>For Her</Link>
                <Link href="/category/unisex" onClick={() => setMenuOpen(false)}>Unisex</Link>
              </div>
              <Link href="/about" onClick={() => setMenuOpen(false)}>OUR STORY</Link>
              <Link href="/track-order" onClick={() => setMenuOpen(false)}>TRACK ORDER</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>CONTACT</Link>
            </div>
          </motion.nav>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white/98 p-4 sm:p-6 backdrop-blur-xl sm:p-12">
          <button onClick={() => setSearchOpen(false)} className="absolute right-4 sm:right-6 top-4 sm:top-6 hover:text-[#a67c52]"><X size={30} className="sm:w-7 sm:h-7" /></button>
          <div className="mx-auto mt-24 sm:mt-32 max-w-2xl">
            <p className="text-[12px] sm:text-[10px] font-bold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#a67c52]">Search the collection</p>
            <div className="mt-5 sm:mt-6 flex items-center border-b-2 border-[#3e2723] pb-3 sm:pb-4">
              <Search size={26} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or notes..." className="ml-3 sm:ml-4 flex-1 bg-transparent font-serif text-2xl sm:text-3xl outline-none placeholder:text-gray-300 text-gray-900" />
            </div>
            <div className="mt-6 sm:mt-8 grid gap-2">
              {query && filtered.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} onClick={() => setSearchOpen(false)} className="flex items-center justify-between border-b border-gray-100 py-4 hover:text-[#a67c52] group">
                  <span className="font-serif text-xl">{product.name}</span>
                  <ArrowRight size={22} className="text-gray-300 group-hover:text-[#a67c52]" />
                </Link>
              ))}
              {query && !filtered.length && <p className="text-base sm:text-sm text-gray-500 mt-4">No results found for "{query}"</p>}
            </div>
          </div>
        </div>
      )}

      <main>
        {/* HERO SECTION */}
        <section
          className="relative h-[75vh] min-h-[500px] sm:h-[85vh] sm:min-h-[600px] w-full overflow-hidden bg-[#3e2723]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
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
                <Image src={slide.image} alt={`ZUNLLY hero slide ${activeSlide + 1}`} fill priority sizes="100vw" className="object-cover object-center brightness-[0.72]" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-5 sm:px-6 lg:px-16 z-10 pointer-events-none">
            <div className="max-w-[90%] sm:max-w-md text-white pt-4 sm:pt-10 lg:pt-0 pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div key={activeSlide} variants={textVariants} initial="enter" animate="center" exit="exit">
                  <p className="mb-2 sm:mb-3 text-[10px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.35em] text-[#d8c49a]">{slide.eyebrow}</p>
                  <h1 className="font-serif text-[2.5rem] min-[400px]:text-5xl leading-[1.1] sm:text-6xl md:text-7xl md:text-[5.5rem]">
                    {slide.titleLine1}<br />
                    <em className="font-light text-white/90">{slide.titleLine2}</em>
                  </h1>
                  <p className="mt-3 sm:mt-8 max-w-sm text-[13px] sm:text-sm leading-relaxed text-white/85">{slide.description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 sm:mt-10 flex flex-col gap-2.5 sm:flex-row sm:gap-4">
                <Link href="/shop" className="bg-white px-6 sm:px-8 py-3 sm:py-4 text-center text-[10px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] text-[#3e2723] transition-transform hover:scale-105 hover:bg-[#d8c49a]">
                  Shop Collection
                </Link>
                <Link href="/about" className="border border-white/40 px-6 sm:px-8 py-3 sm:py-4 text-center text-[10px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] text-white transition-all hover:bg-white hover:text-[#3e2723]">
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          <button onClick={prevSlide} aria-label="Previous slide" className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"><ArrowLeft size={20} /></button>
          <button onClick={nextSlide} aria-label="Next slide" className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"><ArrowRight size={20} /></button>

          <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {heroSlides.map((_, idx) => (
              <button key={idx} onClick={() => goToSlide(idx, idx > activeSlide ? 1 : -1)} aria-label={`Go to slide ${idx + 1}`} className={`relative transition-all duration-500 rounded-full ${activeSlide === idx ? 'w-8 sm:w-10 h-2 sm:h-2 bg-[#d8c49a]' : 'w-2 h-2 sm:w-2 sm:h-2 bg-white/50 hover:bg-white/80'}`}>
                {activeSlide === idx && (
                  <motion.span key={`progress-${activeSlide}-${isPaused}`} initial={{ width: '0%' }} animate={{ width: isPaused ? '0%' : '100%' }} transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }} className="absolute inset-0 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>

          <div className="absolute inset-0 z-[5] md:hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} />
        </section>

        {/* HOT SELLING CAROUSEL */}
        {hotSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-[#f4ebe1] px-4 sm:px-5 py-12 sm:py-16 lg:px-12 overflow-hidden">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-4 sm:gap-6 sm:flex-row sm:items-end mb-6 sm:mb-8">
                <div>
                  <p className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#a67c52] flex items-center gap-2"><Flame size={16} className="sm:w-[14px] sm:h-[14px] text-[#a67c52]" /> Trending Now</p>
                  <h2 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-4xl md:text-5xl">Hot Selling.</h2>
                </div>
                <Link href="/shop" className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] border-b-2 border-[#3e2723] pb-1 hover:text-[#a67c52] hover:border-[#a67c52] transition-colors flex items-center gap-2 w-fit">View All <ArrowRight size={15} className="sm:w-[14px] sm:h-[14px]" /></Link>
              </motion.div>

              <div 
                className="relative w-full h-[480px] sm:h-[500px] md:h-[520px] flex justify-center items-center perspective-[1400px] overflow-hidden"
                onMouseEnter={() => setIsHotSellingPaused(true)}
                onMouseLeave={() => setIsHotSellingPaused(false)}
              >
                {/* LEFT ARROW FOR HOT SELLING */}
                <button onClick={prevHotSelling} aria-label="Previous product" className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#3e2723] shadow-md border border-[#ebe2d5] transition-all hover:scale-110">
                  <ArrowLeft size={20} />
                </button>

                {/* RIGHT ARROW FOR HOT SELLING */}
                <button onClick={nextHotSelling} aria-label="Next product" className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#3e2723] shadow-md border border-[#ebe2d5] transition-all hover:scale-110">
                  <ArrowRight size={20} />
                </button>

                <div className="relative w-full max-w-[1200px] h-full flex items-center justify-center">
                  {carouselItems.map((item) => {
                    const isCenter = item.position === 'center'
                    const isLeft = item.position === 'left'
                    const isRight = item.position === 'right'

                    return (
                      <motion.div
                        key={item.key}
                        animate={{
                          x: isLeft ? '-65%' : isRight ? '65%' : '0%', 
                          y: isCenter ? 0 : 30, 
                          scale: isCenter ? 1 : 0.72, 
                          rotateY: isLeft ? 15 : isRight ? -15 : 0,
                          rotateZ: isLeft ? -2 : isRight ? 2 : 0,
                          opacity: isCenter ? 1 : 0.7, 
                          zIndex: isCenter ? 30 : 20,
                        }}
                        transition={{ type: 'spring', stiffness: 130, damping: 20, mass: 0.7 }}
                        className="absolute w-[280px] sm:w-[300px] md:w-[320px]"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <ProductCard
                          product={item}
                          onAdd={() => addToCart(item)}
                          onBuyNow={() => buyNow(item)}
                          onShowToast={showToast}
                        />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-5 py-14 sm:py-24 lg:px-12 lg:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-8 sm:mb-16">
            <p className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#a67c52]">Discover</p>
            <h2 className="mt-2 sm:mt-4 font-serif text-3xl sm:text-4xl md:text-5xl">Find your signature.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-3 sm:gap-6 md:grid-cols-3">
            {[
              ['For Him', '/category/for-him', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85'],
              ['For Her', '/category/for-her', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'],
              ['Unisex', '/category/unisex', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85']
            ].map(([name, href, image]) => (
              <motion.div key={name} variants={fadeUp}>
                <Link href={href} className="group relative block h-[260px] sm:h-[450px] overflow-hidden bg-[#ded7cd] rounded-sm">
                  <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 text-white">
                    <h3 className="font-serif text-3xl sm:text-3xl">{name}</h3>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-[10px] font-semibold uppercase tracking-[.15em] sm:tracking-[.2em] text-white/90 group-hover:text-[#d8c49a] transition-colors flex items-center gap-2">Explore <ArrowRight size={14} className="sm:w-[14px] sm:h-[14px] transition-transform group-hover:translate-x-1" /></p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* BEST SELLERS */}
        {bestSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-[#f4ebe1] px-4 sm:px-5 py-14 sm:py-24 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-4 sm:gap-6 sm:flex-row sm:items-end mb-8 sm:mb-12">
                <div>
                  <p className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#a67c52]">Best Sellers</p>
                  <h2 className="mt-2 sm:mt-4 font-serif text-3xl sm:text-4xl md:text-5xl">The iconic scents.</h2>
                </div>
                <Link href="/shop" className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[.12em] sm:tracking-[.15em] border-b-2 border-[#3e2723] pb-1 hover:text-[#a67c52] hover:border-[#a67c52] transition-colors flex items-center gap-2 w-fit">View All <ArrowRight size={15} className="sm:w-[14px] sm:h-[14px]" /></Link>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
                {bestSellingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onBuyNow={() => buyNow(product)} onShowToast={showToast} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* BRAND STORY (Old) */}
        <section className="mx-auto max-w-[1440px] px-4 sm:px-5 py-14 sm:py-24 lg:px-12 lg:py-32 overflow-hidden">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-24">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
              <div className="relative aspect-[4/5] w-full">
                <Image src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85" alt="ZUNLLY Craftsmanship" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-4 border border-[#cdbb91] bg-white px-4 sm:px-8 py-3 sm:py-6">
                <p className="font-serif text-3xl sm:text-4xl text-[#a67c52]">01</p>
                <p className="mt-1 text-[10px] sm:text-[9px] font-bold uppercase tracking-[.15em] sm:tracking-[.2em] text-[#7a6b5d]">Crafted with care</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-lg">
              <motion.div variants={fadeUp}>
                <Sparkles size={24} className="sm:w-6 sm:h-6 text-[#a67c52]" />
                <p className="mt-4 sm:mt-6 text-[11px] sm:text-[10px] font-bold uppercase tracking-[.2em] sm:tracking-[.25em] text-[#a67c52]">The ZUNLLY Standard</p>
                <h2 className="mt-3 sm:mt-4 font-serif text-4xl sm:text-4xl md:text-5xl leading-tight">The art of<br /><em className="font-light">staying memorable.</em></h2>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-4 sm:mt-6 text-sm sm:text-sm leading-relaxed text-[#7a6b5d]">We believe luxury should be felt, not flaunted. Every ZUNLLY fragrance is composed with exceptional ingredients and an eye for balance — creating scents that feel personal, expressive, and entirely your own.</motion.p>
              <motion.ul variants={fadeUp} className="mt-6 sm:mt-8 space-y-3.5 text-[12px] sm:text-[11px] font-bold uppercase tracking-[.1em] text-[#3e2723]">
                <li className="flex items-center gap-3"><Check size={16} className="sm:w-4 sm:h-4 text-[#a67c52]" /> Long-lasting compositions</li>
                <li className="flex items-center gap-3"><Check size={16} className="sm:w-4 sm:h-4 text-[#a67c52]" /> Thoughtfully sourced ingredients</li>
                <li className="flex items-center gap-3"><Check size={16} className="sm:w-4 sm:h-4 text-[#a67c52]" /> Designed in Pakistan</li>
              </motion.ul>
            </motion.div>
          </div>
        </section>

        {/* NEW LOGO & DESCRIPTION SECTION */}
        <section className="bg-[#f4ebe1] border-t border-[#ded8cc] py-14 sm:py-20 px-4 sm:px-5 lg:px-12">
          <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={staggerContainer}
              className="order-2 lg:order-1 max-w-xl"
            >
              <motion.div variants={fadeUp}>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[.2em] text-[#7a6b5d] mb-3 sm:mb-4">
                  ZUNLLY FRAGRANCES BY ZUNLLY LLC
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.8rem] leading-[1.15] text-[#3e2723] mb-5 sm:mb-6">
                  More Than a Fragrance. <br className="hidden sm:block" />A Little Piece of Peace.
                </h2>
              </motion.div>
              
              <motion.div variants={fadeUp} className="space-y-4 text-[14px] sm:text-[15px] text-[#7a6b5d] leading-relaxed">
                <p>
                  ZUNLLY was created with a simple dream — to make fragrances that give you more than beauty. 
                  Something that reminds a tired soul to find peace, and every person who wears it to remember their worth.
                </p>
                <p>
                  Because sometimes, a little sparkle is all we need to feel beautiful again.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-7 sm:mt-9">
                <Link href="/about" className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-[.15em] text-[#8B0000] border-b border-[#8B0000] pb-1 hover:text-[#a67c52] hover:border-[#a67c52] transition-colors">
                  Read Our Story
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 w-full"
            >
              <div className="relative aspect-square w-full bg-[#fcf9f2] border border-[#e3d8c8] flex items-center justify-center p-10 sm:p-16">
                <Image 
                  src="/logo.png" 
                  alt="ZUNLLY Logo" 
                  width={400} 
                  height={400} 
                  className="object-contain w-full h-auto max-w-[280px] opacity-90"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if(target.parentElement) {
                      target.parentElement.innerHTML = '<span className="text-[#8B0000] font-serif text-3xl sm:text-5xl text-center font-bold">ZUNLLY</span>';
                    }
                  }}
                />
              </div>
            </motion.div>

          </div>
        </section>

        {/* BRAND FEATURES */}
        <section className="relative bg-gradient-to-b from-white via-[#f4ebe1] to-white border-t border-[#ded8cc] py-14 sm:py-20 overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-[#a67c52]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#a67c52]/10 blur-3xl" />

          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-5 lg:px-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="text-center mb-10 sm:mb-14">
              <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[.25em] text-[#a67c52]">Why Choose Us</p>
              <h2 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-4xl md:text-5xl">The ZUNLLY Promise.</h2>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {features.map((item, idx) => (
                <motion.div key={idx} custom={idx} variants={featureCard} whileHover={{ y: -8, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="group relative flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white border border-[#e8dfd3] shadow-sm hover:shadow-xl hover:shadow-[#a67c52]/15 hover:border-[#a67c52]/40 cursor-default overflow-hidden">
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#a67c52]/10 to-transparent" />
                  <div className="relative mb-3 sm:mb-5">
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.35 }} className="absolute inset-0 rounded-full bg-[#a67c52]/40 blur-md" />
                    <motion.div whileHover={{ rotate: [0, -12, 12, -8, 0] }} transition={{ duration: 0.7 }} className="relative h-11 w-11 sm:h-16 sm:w-16 rounded-full bg-[#f4ebe1] group-hover:bg-white flex items-center justify-center shadow-sm border border-[#ded8cc] group-hover:border-[#a67c52] transition-colors">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.25 }}>
                        <item.icon size={20} className="sm:w-7 sm:h-7 text-[#a67c52]" strokeWidth={1.5} />
                      </motion.div>
                    </motion.div>
                  </div>
                  <h4 className="font-serif text-[14px] sm:text-[18px] text-[#3e2723] mb-1 group-hover:text-[#a67c52] transition-colors">{item.title}</h4>
                  <p className="text-[10px] sm:text-[12px] font-medium tracking-wide text-[#7a6b5d]">{item.desc}</p>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 bg-gradient-to-r from-transparent via-[#a67c52] to-transparent transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1d1c1a] text-[#f4ebe1]">
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-[#2a2824] hover:bg-[#35322d] py-4 text-center cursor-pointer transition-colors border-b border-[#3a3732]">
          <span className="text-[11px] sm:text-[11px] uppercase tracking-[.2em] font-semibold text-[#d8c49a]">Back to top ↑</span>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 py-12 sm:py-16 px-4 sm:px-6">
          <div>
            <h4 className="font-serif text-[17px] sm:text-[18px] text-[#d8c49a] mb-3 sm:mb-4">Get to Know Us</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[13px] text-gray-400">
              <li><Link href="/about" className="hover:text-[#d8c49a] transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-[#d8c49a] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-[17px] sm:text-[18px] text-[#d8c49a] mb-3 sm:mb-4">Shop With Us</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-[13px] text-gray-400">
              <li><Link href="/shop" className="hover:text-[#d8c49a] transition-colors">All Fragrances</Link></li>
              <li><Link href="/category/for-him" className="hover:text-[#d8c49a] transition-colors">For Him</Link></li>
              <li><Link href="/category/for-her" className="hover:text-[#d8c49a] transition-colors">For Her</Link></li>
              <li><Link href="/category/unisex" className="hover:text-[#d8c49a] transition-colors">Unisex</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-[17px] sm:text-[18px] text-[#d8c49a] mb-3 sm:mb-4">Let Us Help You</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-[13px] text-gray-400">
              <li><Link href="/account" className="hover:text-[#d8c49a] transition-colors">Your Account</Link></li>
              <li><Link href="/shipping" className="hover:text-[#d8c49a] transition-colors">Shipping & Policies</Link></li>
              <li><Link href="/shipping" className="hover:text-[#d8c49a] transition-colors">Returns & Replacements</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-[17px] sm:text-[18px] text-[#d8c49a] mb-3 sm:mb-4">Let's Connect</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-[13px] text-gray-400">
              <li><a href="https://www.instagram.com/zunllyofficial/" target="_blank" rel="noreferrer" className="hover:text-[#d8c49a] transition-colors">Instagram</a></li>
              <li><a href="https://web.facebook.com/profile.php?id=61595457614392" target="_blank" rel="noreferrer" className="hover:text-[#d8c49a] transition-colors">Facebook</a></li>
              <li><a href="https://www.tiktok.com/@zunllyofficial" target="_blank" rel="noreferrer" className="hover:text-[#d8c49a] transition-colors">Tiktok</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#151412] py-6 sm:py-8 text-center border-t border-[#2a2824] flex flex-col items-center justify-center">
          <Link href="/" className="mb-3 sm:mb-4 inline-block">
            <Image src="/logo.png" alt="ZUNLLY Logo" width={100} height={35} className="object-contain brightness-0 invert opacity-90 w-[80px] sm:w-[100px] h-auto" />
          </Link>
          <p className="text-[11px] sm:text-[11px] tracking-wider text-gray-500 px-4">© 2026 ZUNLLY. All rights reserved. Designed & Crafted in Pakistan.</p>
        </div>
      </footer>

      <motion.a href="https://wa.me/923028770999" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-50 flex items-center justify-center group">
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30 group-hover:opacity-0 transition-opacity duration-300" />
        <div className="relative bg-[#25D366] text-white p-3.5 sm:p-4 rounded-full shadow-[0_10px_20px_rgba(37,211,102,0.3)] transition-shadow duration-300 group-hover:shadow-[0_10px_25px_rgba(37,211,102,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-7 sm:h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
      </motion.a>

      <style jsx global>{`
        @media (max-width: 360px) {
          header .max-w-\\[1440px\\] { padding-left: 12px; padding-right: 12px; }
          header nav { gap: 14px; }
          header .text-\\[11px\\] { font-size: 10px; }
          .perspective-\\[1400px\\] { perspective: 1000px; }
        }
        @media (max-width: 640px) {
          article { box-shadow: none !important; }
          article:hover { border-color: #a67c52; }
        }
      `}</style>
    </div>
  )
}