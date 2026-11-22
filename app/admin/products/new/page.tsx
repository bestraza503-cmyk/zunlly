'use client'

import Link from 'next/link'
import { createProduct } from '../actions'
import { ArrowLeft, UploadCloud, Package, DollarSign, Layers, Star, ShieldCheck, Tag, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function NewProductPage() {
  const [previews, setPreviews] = useState<string[]>([])
  // ✅ Files ko hold karne ke liye state
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Images add karne ka logic (Purani + Nayi)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files
    if (!newFiles || newFiles.length === 0) return

    // Nayi files ko purani files ke sath mila do
    const combinedFiles = [...files, ...Array.from(newFiles)]
    setFiles(combinedFiles)

    // Preview URLs banao
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)

    // DataTransfer ka use karke input ki value update karo taake form submit pe saari images jayein
    const dataTransfer = new DataTransfer()
    combinedFiles.forEach(file => dataTransfer.items.add(file))
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
  }

  // ✅ Image remove karne ka logic
  const removeImage = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove)
    setFiles(updatedFiles)

    const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file))
    setPreviews(updatedPreviews)

    // Input value update karo
    const dataTransfer = new DataTransfer()
    updatedFiles.forEach(file => dataTransfer.items.add(file))
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-sm font-semibold text-[#c46c3b] inline-flex items-center gap-1 hover:text-[#a55626] mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1 className="font-serif text-3xl text-[#3b281c]">List a New Product</h1>
        </div>
      </div>
      
      <form action={createProduct} encType="multipart/form-data" className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <Package size={20} className="text-[#c46c3b]"/> Basic Information
            </h2>
            <div>
              <label className="block text-sm font-bold text-[#3b281c] mb-2">Product Title *</label>
              <input required type="text" name="name" placeholder="e.g. ZUNLLY Midnight Oud 100ml" className="w-full border border-[#eadfce] p-3.5 rounded-xl outline-none focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#3b281c] mb-2">Description</label>
              <textarea name="description" rows={5} placeholder="Describe your product..." className="w-full border border-[#eadfce] p-3.5 rounded-xl outline-none focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20 transition-all text-sm resize-y" />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <Tag size={20} className="text-[#c46c3b]"/> Specifications
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-bold mb-2">Brand</label><input type="text" name="brand" placeholder="e.g. ZUNLLY" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Condition</label><select name="condition" className="w-full border p-3.5 rounded-xl bg-white"><option value="New">New</option><option value="Used">Used</option></select></div>
              <div><label className="block text-sm font-bold mb-2">Size</label><input type="text" name="size_ml" placeholder="e.g. 100ml" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Notes</label><input type="text" name="fragrance_notes" placeholder="e.g. Oud, Rose" className="w-full border p-3.5 rounded-xl" /></div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#c46c3b]"/> Features & Policies
            </h2>
            <div>
              <label className="block text-sm font-bold mb-2">Key Features (One per line)</label>
              <textarea name="features" rows={4} placeholder="Long lasting&#10;Premium ingredients" className="w-full border p-3.5 rounded-xl resize-y" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-bold mb-2">Warranty</label><input type="text" name="warranty" placeholder="e.g. No Warranty" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Return Policy</label><input type="text" name="return_policy" placeholder="e.g. 7 Days Return" className="w-full border p-3.5 rounded-xl" /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          
          {/* ✅ MULTIPLE IMAGE UPLOAD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eadfce]">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c]">Product Images *</h2>
            
            <div className="border-2 border-dashed border-[#d8d1c5] p-6 text-center rounded-xl bg-[#fbf7f1] hover:bg-[#f8f7f4] transition-colors relative group">
              <input 
                ref={fileInputRef}
                required={previews.length === 0} 
                type="file" 
                name="images" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud size={28} className="text-[#c46c3b]" />
              </div>
              <p className="text-sm font-bold text-[#3b281c]">Click to upload images</p>
              <p className="text-xs text-[#8a6b58] mt-1">Multiple images allowed (JPG, PNG)</p>
            </div>

            {/* ✅ Image Preview Grid */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group/preview">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/preview:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ PRICE & DISCOUNT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <DollarSign size={20} className="text-[#c46c3b]"/> Price & Stock
            </h2>
            
            <div>
              <label className="block text-sm font-bold mb-2">Real Price (PKR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">PKR</span>
                <input required type="number" name="price" placeholder="4500" className="w-full border p-3.5 pl-14 rounded-xl font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 pt-2 border-t border-[#eadfce]/50">
              <div>
                <label className="block text-sm font-bold mb-2 text-[#c46c3b]">Discounted Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">PKR</span>
                  <input type="number" name="sale_price" placeholder="3500" className="w-full border border-[#c46c3b]/30 p-3.5 pl-14 rounded-xl font-semibold bg-orange-50/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-[#c46c3b]">Sale End Date (Optional)</label>
                <input type="datetime-local" name="sale_end_date" className="w-full border border-[#c46c3b]/30 p-3.5 rounded-xl bg-orange-50/30 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Stock Quantity *</label>
              <input required type="number" name="stock" placeholder="e.g. 50" className="w-full border p-3.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2"><Layers size={16} /> Category</label>
              <select name="category" className="w-full border p-3.5 rounded-xl bg-white">
                <option value="For Him">For Him</option>
                <option value="For Her">For Her</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1d1c1a] text-white py-4 rounded-xl font-bold hover:bg-[#c46c3b] transition-colors shadow-lg flex items-center justify-center gap-2">
            <Star size={18} /> Publish Listing
          </button>
        </div>
      </form>
    </div>
  )
}