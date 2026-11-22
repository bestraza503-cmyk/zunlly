"use client"

import { FormEvent, useState } from "react"

// ✅ Type update kiya taake naye fields handle hon
type Product = { 
  id: string; 
  name: string; 
  brand: string | null; 
  sku: string | null; 
  description: string; 
  price: number; 
  sale_price?: number | null; 
  sale_end_date?: string | null; 
  compare_at_price?: number | null; 
  stock: number; 
  status: string; 
  category_id: string | null; 
  fragrance_notes: unknown; 
  sizes: unknown; 
  images: unknown 
}

export function ProductEditForm({ product }: { product: Product }) {
  const [form, setForm] = useState({ 
    name: product.name, 
    brand: product.brand || "ZUNLLY", 
    sku: product.sku || "", 
    description: product.description, 
    price: String(product.price), 
    salePrice: product.sale_price ? String(product.sale_price) : "", 
    saleEndDate: product.sale_end_date ? new Date(product.sale_end_date).toISOString().slice(0, 16) : "", 
    stock: String(product.stock), 
    status: product.status 
  })
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  function update(key: keyof typeof form, value: string) { 
    setForm((current) => ({ ...current, [key]: value })) 
  }

  async function submit(event: FormEvent) { 
    event.preventDefault(); 
    setSaving(true); 
    setMessage(""); 
    
    // ✅ API ko sale_price aur sale_end_date bhi bheje
    const response = await fetch("/api/admin/products", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        id: product.id, 
        name: form.name.trim(), 
        brand: form.brand.trim(), 
        sku: form.sku.trim() || null, 
        description: form.description.trim(), 
        price: Number(form.price), 
        sale_price: form.salePrice ? Number(form.salePrice) : null, 
        sale_end_date: form.saleEndDate || null, 
        stock: Number(form.stock), 
        status: form.status 
      }) 
    }); 
    
    const result = await response.json(); 
    setMessage(response.ok ? "Product saved." : result.error || "Could not save product."); 
    setSaving(false) 
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Details */}
        <label className="grid gap-2 text-sm font-semibold">Name<input required type="text" value={form.name} onChange={(event) => update("name", event.target.value)} className="rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
        <label className="grid gap-2 text-sm font-semibold">Brand<input required type="text" value={form.brand} onChange={(event) => update("brand", event.target.value)} className="rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
        <label className="grid gap-2 text-sm font-semibold">SKU<input type="text" value={form.sku} onChange={(event) => update("sku", event.target.value)} className="rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
        <label className="grid gap-2 text-sm font-semibold">Stock<input required type="number" min="0" value={form.stock} onChange={(event) => update("stock", event.target.value)} className="rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
      </div>

      {/* ✅ Price & Discount Section */}
      <div className="grid gap-4 md:grid-cols-3 p-4 bg-orange-50/30 border border-[#c46c3b]/20 rounded-xl">
        <label className="grid gap-2 text-sm font-semibold text-[#3b281c]">Real Price (PKR)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} className="rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
        <label className="grid gap-2 text-sm font-semibold text-[#c46c3b]">Discounted Price<input type="number" min="0" step="0.01" value={form.salePrice} onChange={(event) => update("salePrice", event.target.value)} placeholder="Optional" className="rounded-xl border border-[#c46c3b]/40 px-4 py-3 font-normal outline-none focus:border-[#c89b3c] bg-white" /></label>
        <label className="grid gap-2 text-sm font-semibold text-[#c46c3b]">Sale End Date<input type="datetime-local" value={form.saleEndDate} onChange={(event) => update("saleEndDate", event.target.value)} className="rounded-xl border border-[#c46c3b]/40 px-4 py-3 font-normal outline-none focus:border-[#c89b3c] bg-white text-sm" /></label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">Description<textarea required value={form.description} onChange={(event) => update("description", event.target.value)} className="min-h-40 rounded-xl border border-[#eadfce] px-4 py-3 font-normal outline-none focus:border-[#c89b3c]" /></label>
      
      <label className="grid gap-2 text-sm font-semibold">Status
        <select value={form.status} onChange={(event) => update("status", event.target.value)} className="rounded-xl border border-[#eadfce] bg-white px-4 py-3 font-normal">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <div className="flex items-center gap-3">
        <button disabled={saving} className="rounded-xl bg-[#3b281c] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
        {message && <p className="text-sm text-[#8a6b58]">{message}</p>}
      </div>
    </form>
  )
}