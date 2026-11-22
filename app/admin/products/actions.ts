'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized. Please log in again.')

  const name = String(formData.get('name') || '')
  const price = Number(formData.get('price'))
  const sale_price = formData.get('sale_price') ? Number(formData.get('sale_price')) : null
  const sale_end_date = formData.get('sale_end_date') ? String(formData.get('sale_end_date')) : null
  
  const description = String(formData.get('description') || '')
  const category = String(formData.get('category') || 'Fragrance')
  const stock = Number(formData.get('stock') || 0)
  
  const brand = String(formData.get('brand') || '')
  const condition = String(formData.get('condition') || 'New')
  const fragrance_notes = String(formData.get('fragrance_notes') || '')
  const size_ml = String(formData.get('size_ml') || '')
  const warranty = String(formData.get('warranty') || '')
  const return_policy = String(formData.get('return_policy') || '')
  const featuresString = String(formData.get('features') || '')
  const featuresArray = featuresString.split('\n').filter(f => f.trim() !== '')

  // ✅ Images Upload Logic
  const imageFiles = formData.getAll('images') as File[]
  const uploadedImageUrls: string[] = []

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`Image ${file.name} is larger than 5MB.`)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error("❌ IMAGE UPLOAD ERROR:", uploadError)
        throw new Error('Image upload failed: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
        
      // ✅ Extra safety: URL se koi bhi ghalat bracket/slash nikal do
      const cleanUrl = publicUrl.replace(/[\[\]"\\]/g, '')
      uploadedImageUrls.push(cleanUrl)
    }
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

  const { error } = await supabase.from('products').insert({
    name,
    slug, 
    price,
    sale_price,
    sale_end_date,
    description,
    category,
    stock,
    images: uploadedImageUrls, 
    status: 'published',
    created_by: user.id, 
    brand,
    condition,
    fragrance_notes,
    size_ml,
    warranty,
    return_policy,
    features: featuresArray
  })

  if (error) {
    console.error("❌ PRODUCT INSERT ERROR:", error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  redirect('/admin/products')
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id'))
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
}