'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload, Type, Palette, ZoomIn, ShoppingCart, RotateCcw,
  ChevronDown, Check, Sparkles, Truck
} from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCartStore }   from '@/store/useCartStore';
import { useToast }       from '@/components/providers/ToastProvider';
import { PageLoader }     from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import type { Product }   from '@/types';

const FONTS = ['Arial', 'Times New Roman', 'Playfair Display', 'Roboto', 'Script MT'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

export default function CustomizePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { toast } = useToast();

  const [product, setProduct]         = useState<Product | null>(null);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [quantity, setQuantity]       = useState(1);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedFabric, setSelectedFabric] = useState(0);
  const [selectedPrint, setSelectedPrint]   = useState(0);
  const [expressDelivery, setExpressDelivery] = useState(false);

  const design = useDesignStore();
  const cart   = useCartStore();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Dynamic price calculation
  const computePrice = useCallback(() => {
    if (!product) return 0;
    const cf = product.customizableFields;
    let price = product.basePrice;
    if (cf.size?.priceModifier?.[selectedSize]) price += cf.size.priceModifier[selectedSize];
    if (cf.fabric?.priceModifier?.[selectedFabric]) price += cf.fabric.priceModifier[selectedFabric];
    if (cf.printMethod?.priceModifier?.[selectedPrint]) price += cf.printMethod.priceModifier[selectedPrint];
    if (expressDelivery) price += 15;
    return price;
  }, [product, selectedSize, selectedFabric, selectedPrint, expressDelivery]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.data?.url) {
        design.setImageUrl(data.data.url);
        toast('success', 'Logo uploaded!');
      } else {
        toast('error', 'Upload failed', data.error ?? 'Please try again');
      }
    } catch {
      toast('error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function addToCart() {
    if (!product) return;

    const cf = product.customizableFields;
    const customizations: Record<string, unknown> = {
      text:  design.text,
      font:  design.font,
      color: design.color,
    };
    if (cf.size?.options)        customizations.size        = cf.size.options[selectedSize];
    if (cf.fabric?.options)      customizations.fabric      = cf.fabric.options[selectedFabric];
    if (cf.printMethod?.options) customizations.printMethod = cf.printMethod.options[selectedPrint];

    cart.addItem(product, quantity, customizations, design.getSnapshot());
    cart.setExpressDelivery(expressDelivery);
    toast('success', 'Added to cart!', `${product.name} × ${quantity}`);
    router.push('/checkout');
  }

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
      Product not found.
    </div>
  );

  const cf    = product.customizableFields;
  const price = computePrice();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customize: {product.name}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left: Live Preview ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Live Preview</span>
            </div>

            {/* Preview canvas */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-72 p-8">
              {/* Background product image */}
              {product.imageUrl && (
                <div className="relative h-48 w-48">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-contain opacity-70" />
                </div>
              )}

              {/* Uploaded logo overlay */}
              {design.imageUrl && (
                <div className="absolute top-4 right-4 h-16 w-16 rounded-lg overflow-hidden border-2 border-white shadow-md">
                  <Image src={design.imageUrl} alt="Logo" fill className="object-contain" />
                </div>
              )}

              {/* Text overlay */}
              {design.text && (
                <div
                  className="absolute bottom-8 left-0 right-0 text-center px-4 py-2"
                  style={{
                    fontFamily: design.font ?? 'Arial',
                    fontSize:   `${design.fontSize ?? 18}px`,
                    color:      design.color ?? '#1a1a1a',
                    textShadow: '0 1px 3px rgba(255,255,255,0.8)',
                  }}
                >
                  {design.text}
                </div>
              )}

              {!design.text && !design.imageUrl && (
                <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
                  <span className="text-xs text-gray-400 bg-white/60 backdrop-blur-sm rounded px-2 py-1">
                    Add text or logo to preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Routing preview */}
          <div className="card p-4 bg-brand-50 border-brand-100">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-800">Smart Delivery Routing</p>
                <p className="text-xs text-brand-600 mt-0.5">
                  When you order, our algorithm assigns the nearest vendor with stock for fastest delivery.
                  {expressDelivery ? ' Express 1-day shipping selected.' : ' Standard 2–5 day delivery.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Customization Panel ───────────────────────────────────── */}
        <div className="space-y-6">
          {/* Text customization */}
          {cf.text && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Type className="h-4 w-4 text-brand-600" />
                <h3 className="font-semibold text-gray-900">{cf.text.label}</h3>
              </div>
              <textarea
                className="input resize-none"
                rows={2}
                maxLength={cf.text.maxLength}
                placeholder={`Enter your text (max ${cf.text.maxLength} chars)`}
                value={design.text ?? ''}
                onChange={(e) => design.setText(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">{(design.text ?? '').length}/{cf.text.maxLength}</p>
            </div>
          )}

          {/* Font selection */}
          {cf.font && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Font Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {cf.font.options.map((f) => (
                  <button
                    key={f}
                    onClick={() => design.setFont(f)}
                    className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                      design.font === f
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {design.font === f && <Check className="inline h-3 w-3 mr-1" />}
                    {f}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <label className="label">Size</label>
                <select
                  className="input w-24"
                  value={design.fontSize ?? 18}
                  onChange={(e) => design.setFontSize(Number(e.target.value))}
                >
                  {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Color picker */}
          {cf.color && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-brand-600" />
                <h3 className="font-semibold text-gray-900">{cf.color.label}</h3>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={design.color ?? '#1a1a1a'}
                  onChange={(e) => design.setColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 p-1"
                />
                <input
                  type="text"
                  className="input w-28"
                  value={design.color ?? '#1a1a1a'}
                  onChange={(e) => design.setColor(e.target.value)}
                />
                {/* Preset colours */}
                <div className="flex gap-1.5">
                  {['#1a56db','#e3a008','#0e9f6e','#f05252','#7e3af2','#111827'].map((c) => (
                    <button
                      key={c}
                      onClick={() => design.setColor(c)}
                      className="h-6 w-6 rounded-full border-2 border-white shadow transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Text color for non-apparel */}
          {!cf.color && cf.text && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-brand-600" />
                <h3 className="font-semibold text-gray-900">Text Color</h3>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={design.color ?? '#1a1a1a'}
                  onChange={(e) => design.setColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 p-1"
                />
                {['#111827','#fbbf24','#1a56db','#7e3af2','#e3a008','#0e9f6e'].map((c) => (
                  <button
                    key={c}
                    onClick={() => design.setColor(c)}
                    className="h-6 w-6 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {cf.size && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {cf.size.options.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(i)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedSize === i
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s}
                    {cf.size?.priceModifier?.[i] ? (
                      <span className="ml-1 text-xs text-gray-400">+{formatCurrency(cf.size.priceModifier[i])}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fabric / Print method */}
          {cf.fabric && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Fabric</h3>
              <div className="space-y-2">
                {cf.fabric.options.map((f, i) => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="fabric" checked={selectedFabric === i} onChange={() => setSelectedFabric(i)} className="text-brand-600" />
                    <span className="text-sm">{f}</span>
                    {cf.fabric?.priceModifier?.[i] ? (
                      <span className="text-xs text-gray-400">+{formatCurrency(cf.fabric.priceModifier[i])}</span>
                    ) : <span className="text-xs text-green-600">Included</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {cf.printMethod && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Print Method</h3>
              <div className="space-y-2">
                {cf.printMethod.options.map((p, i) => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="print" checked={selectedPrint === i} onChange={() => setSelectedPrint(i)} className="text-brand-600" />
                    <span className="text-sm">{p}</span>
                    {cf.printMethod?.priceModifier?.[i] ? (
                      <span className="text-xs text-gray-400">+{formatCurrency(cf.printMethod.priceModifier[i])}</span>
                    ) : <span className="text-xs text-green-600">Included</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Logo upload */}
          {cf.logoUpload?.enabled && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="h-4 w-4 text-brand-600" />
                <h3 className="font-semibold text-gray-900">{cf.logoUpload.label}</h3>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary w-full"
              >
                {uploading ? 'Uploading…' : design.imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
              {design.imageUrl && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Image uploaded
                  <button onClick={() => design.setImageUrl('')} className="ml-auto text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 10 MB</p>
            </div>
          )}

          {/* Quantity + Express */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="label">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-8 w-8 rounded-lg border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={expressDelivery}
                  onChange={(e) => setExpressDelivery(e.target.checked)}
                  className="mt-1 rounded text-brand-600"
                />
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                    Express Delivery
                  </div>
                  <div className="text-xs text-gray-400">+$15 · Ships in 1 day</div>
                </div>
              </label>
            </div>
          </div>

          {/* Price summary + Add to cart */}
          <div className="card p-5 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Unit price</p>
                <p className="text-3xl font-bold text-brand-700">{formatCurrency(price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total ({quantity}×)</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(price * quantity)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { design.resetDesign(); setSelectedSize(0); setQuantity(1); }}
                className="btn-secondary"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button onClick={addToCart} className="btn-primary flex-1">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
