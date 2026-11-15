import { ZunllyHome } from '@/components/zunlly-home'
import { createClient } from '@/lib/supabase/server' // ✅ Server Import
import { getProductImageUrl } from '@/lib/product-image'

export default async function Page() {
  const supabase = await createClient()
  
  // ✅ FIX: Query mein product_reviews add kiya
  const { data } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      price, 
      images, 
      fragrance_notes, 
      categories(name),
      product_reviews ( rating )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const products = (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: Array.isArray(product.categories) 
      ? product.categories[0]?.name ?? 'Collection' 
      : product.categories?.name ?? 'Collection',
    
    // Price ko number banao taake NaN error na aaye
    price: Number(product.price) || 0, 
    
    image: getProductImageUrl(product.images),
    notes: Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : '',
    tag: '',
    
    // ✅ FIX: Reviews ka data pass kiya
    product_reviews: product.product_reviews || []
  }))

  return <ZunllyHome products={products} />
}