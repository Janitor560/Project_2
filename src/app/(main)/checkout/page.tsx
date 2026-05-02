'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, MapPin, Truck, Zap, CreditCard, ShoppingBag } from 'lucide-react';
import { useCartStore }  from '@/store/useCartStore';
import { useToast }      from '@/components/providers/ToastProvider';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import { EmptyState }    from '@/components/ui/EmptyState';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const cart     = useCartStore();
  const items    = useCartStore((s) => s.items);
  const isExpress = useCartStore((s) => s.isExpressDelivery);

  const [address,    setAddress]    = useState(cart.customerAddress);
  const [processing, setProcessing] = useState(false);

  const subtotal     = cart.getTotalPrice();
  const expressExtra = isExpress ? 15 * items.length : 0;
  const total        = subtotal + expressExtra;

  async function handlePlaceOrder() {
    if (!session) { router.push('/auth/signin?callbackUrl=/checkout'); return; }
    if (!address)  { toast('error', 'Please enter your delivery address'); return; }
    if (items.length === 0) { toast('error', 'Cart is empty'); return; }

    setProcessing(true);
    try {
      // 1. Create the order (triggers routing algorithm on the server)
      const orderRes = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId:      i.productId,
            quantity:       i.quantity,
            unitPrice:      i.unitPrice,
            customizations: i.customizations,
          })),
          customerAddress:   address,
          customerLat:       cart.customerLat ?? undefined,
          customerLng:       cart.customerLng ?? undefined,
          isExpressDelivery: isExpress,
          design: items[0]?.designSnapshot,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? 'Order creation failed');

      const orderId = orderData.data.id;

      // 2. Create Stripe checkout session
      const stripeRes = await fetch('/api/stripe/create-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) throw new Error(stripeData.error ?? 'Payment session failed');

      cart.clearCart();
      // Redirect to Stripe-hosted checkout
      window.location.href = stripeData.data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast('error', 'Order failed', msg);
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some products to get started."
          action={<Link href="/products" className="btn-primary">Browse Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-brand-600" /> Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Left: Items + Delivery ────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Cart items */}
          <div className="card divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.product.imageUrl ? (
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{getCategoryLabel(item.product.category)}</p>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.customizations).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="badge bg-gray-100 text-gray-600">
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded border border-gray-200 text-sm hover:bg-gray-50 flex items-center justify-center"
                    >−</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded border border-gray-200 text-sm hover:bg-gray-50 flex items-center justify-center"
                    >+</button>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" /> Delivery Address
            </h2>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Enter your full delivery address (street, city, state, ZIP)"
              value={address}
              onChange={(e) => { setAddress(e.target.value); cart.setAddress(e.target.value); }}
            />
            <p className="mt-2 text-xs text-gray-400 flex items-start gap-1">
              <Truck className="h-3.5 w-3.5 mt-0.5" />
              Our routing system uses your address to assign the nearest vendor for fastest delivery.
            </p>
          </div>

          {/* Express delivery */}
          <div className="card p-5">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isExpress}
                onChange={(e) => cart.setExpressDelivery(e.target.checked)}
                className="mt-1 rounded text-brand-600 h-4 w-4"
              />
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold-500" />
                  Express 1-Day Delivery
                  <span className="badge bg-gold-100 text-gold-700">+$15/item</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Guaranteed next-day delivery. Order routed to fastest available vendor.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ── Right: Order Summary ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({cart.getTotalItems()} items)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {isExpress && (
                <div className="flex justify-between text-gold-700">
                  <span>Express delivery</span>
                  <span>+{formatCurrency(expressExtra)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-700">{formatCurrency(total)}</span>
              </div>
            </div>

            {!session ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 text-center">Sign in to complete your order</p>
                <Link href="/auth/signin?callbackUrl=/checkout" className="btn-primary w-full justify-center">
                  Sign in to Checkout
                </Link>
              </div>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !address}
                className="btn-primary w-full mt-4 justify-center py-3"
              >
                <CreditCard className="h-4 w-4" />
                {processing ? 'Processing…' : `Pay ${formatCurrency(total)}`}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0a7 7 0 100 14A7 7 0 007 0zm0 2a5 5 0 110 10A5 5 0 017 2zm-.5 3v4l3 1.5.5-.87-2.5-1.25V5H6.5z"/>
              </svg>
              Secured by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
