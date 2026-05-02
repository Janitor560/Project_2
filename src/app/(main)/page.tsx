import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Medal, Star, Truck, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-gold-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm mb-6">
                <Zap className="h-4 w-4 text-gold-400" />
                Smart Routing · Fast Delivery · 100% Custom
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Awards That <br />
                <span className="text-gold-400">Stand Out</span>
              </h1>
              <p className="mt-5 text-lg text-white/75 max-w-lg">
                Design custom trophies, medals, plaques, and apparel. Our smart routing system
                connects you with the closest vendor for fast, reliable delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary text-base px-6 py-3 bg-gold-500 hover:bg-gold-600 text-gray-900">
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/auth/register" className="btn-secondary text-base px-6 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Get started free
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/60">
                {['No minimums on trophies', '1-day express available', 'Free design tools'].map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-400" /> {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Product preview grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { label: 'Gold Trophy',  img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300&h=300&fit=crop', color: 'from-yellow-400/20' },
                { label: 'Team Jersey',  img: 'https://images.unsplash.com/photo-1562114808-b4b33cf6e67b?w=300&h=300&fit=crop', color: 'from-blue-400/20' },
                { label: 'Medal',        img: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=300&h=300&fit=crop', color: 'from-purple-400/20' },
                { label: 'Wood Plaque',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', color: 'from-orange-400/20' },
              ].map((item) => (
                <div key={item.label} className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.color} to-white/5 border border-white/10 aspect-square`}>
                  <Image src={item.img} alt={item.label} fill className="object-cover opacity-80" />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose AwardsPro?</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              From design to delivery, we handle everything. Our technology ensures your order
              reaches you as fast as possible.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="h-6 w-6 text-brand-600" />,
                title: 'Smart Routing',
                desc: 'Our algorithm automatically routes your order to the nearest vendor with stock, minimising delivery time.',
              },
              {
                icon: <Truck className="h-6 w-6 text-brand-600" />,
                title: '1-Day Express',
                desc: 'Need it fast? Select express delivery and we\'ll prioritise your order for same or next-day shipment.',
              },
              {
                icon: <Star className="h-6 w-6 text-brand-600" />,
                title: 'Live Preview',
                desc: 'Use our design tool to add text, upload logos, and see exactly how your award will look before ordering.',
              },
              {
                icon: <Trophy className="h-6 w-6 text-brand-600" />,
                title: 'Premium Quality',
                desc: 'All awards are manufactured to the highest standard using premium materials and precise engraving.',
              },
              {
                icon: <Shield className="h-6 w-6 text-brand-600" />,
                title: 'Secure Payments',
                desc: 'Pay safely with Stripe. Your payment is protected with industry-standard encryption.',
              },
              {
                icon: <Medal className="h-6 w-6 text-brand-600" />,
                title: 'Bulk Discounts',
                desc: 'Order 50+ medals or jerseys and automatically unlock volume pricing.',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Trophies',  cat: 'TROPHY',  img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&h=400&fit=crop', desc: 'Gold, silver & custom' },
              { label: 'Medals',    cat: 'MEDAL',   img: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=600&h=400&fit=crop', desc: 'Sports & academic' },
              { label: 'Plaques',   cat: 'PLAQUE',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', desc: 'Wood & acrylic' },
              { label: 'Jerseys',   cat: 'JERSEY',  img: 'https://images.unsplash.com/photo-1562114808-b4b33cf6e67b?w=600&h=400&fit=crop', desc: 'Team uniforms' },
              { label: 'Hoodies',   cat: 'HOODIE',  img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=400&fit=crop', desc: 'Custom apparel' },
              { label: 'All Products', cat: '',     img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop', desc: 'Browse everything' },
            ].map((c) => (
              <Link
                key={c.label}
                href={`/products${c.cat ? `?category=${c.cat}` : ''}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-200 aspect-[4/3]"
              >
                <Image
                  src={c.img}
                  alt={c.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-bold text-white text-xl">{c.label}</h3>
                  <p className="text-sm text-white/70">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-700">
        <div className="mx-auto max-w-2xl text-center px-4">
          <Trophy className="h-12 w-12 text-gold-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Ready to Create Something Special?</h2>
          <p className="mt-4 text-brand-200">
            Join thousands of teams and organisations who trust AwardsPro for their recognition needs.
          </p>
          <Link href="/products" className="mt-8 inline-flex btn-primary text-base px-8 py-3 bg-gold-500 hover:bg-gold-600 text-gray-900">
            Start Designing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
