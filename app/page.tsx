import { ZunllyHome } from '@/components/zunlly-home'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'

export default async function Page() {
  const supabase = await createClient()
  
  // Database se data fetch karo
  const { data } = await supabase
    .from('products')
    .select('id, name, price, images, fragrance_notes, categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Data ko ZunllyHome ke format mein map karo
  const products = (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: Array.isArray(product.categories) 
      ? product.categories[0]?.name ?? 'Collection' 
      : product.categories?.name ?? 'Collection',
    
    // ✅ FIX: Price ko string ki jagah Number bheja hai taake formatPrice kaam kare
    price: Number(product.price) || 0, 
    
    image: getProductImageUrl(product.images),
    notes: Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : '',
    tag: '',
    product_reviews: [] 
  }))

  return <ZunllyHome products={products} />
}