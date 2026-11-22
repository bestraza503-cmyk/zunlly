import { ZunllyHome } from '@/components/zunlly-home'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'

export default async function Page() {
  const supabase = await createClient()
  
  // ✅ Query mein sale_price aur sale_end_date add kar diya hai
  const { data } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      price, 
      sale_price,
      sale_end_date,
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
    
    // ✅ Prices properly handle ki hain
    price: Number(product.price) || 0, 
    sale_price: product.sale_price ? Number(product.sale_price) : null,
    sale_end_date: product.sale_end_date || null,
    
    image: getProductImageUrl(product.images),
    notes: Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : '',
    tag: '',
    
    // ✅ Reviews pass kiye
    product_reviews: product.product_reviews || []
  }))

  return <ZunllyHome products={products} />
}