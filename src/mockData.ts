import { useEffect, useState } from 'react';
import { CreditCard, MapPinned, PackageCheck, Search, ShieldCheck, Star, Truck, Users, Wallet } from 'lucide-react';
import { adminTransactions, customerOrders, driverTrips, orderQueue, restaurants, restaurantMenus, salesStats } from './mockData';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import type { CartItem, MenuItem, OrderStatus, Role } from './types';

const roleOptions: { id: Role; label: string }[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'driver', label: 'Driver' },
  { id: 'admin', label: 'Admin' },
];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function App() {
  const [role, setRole] = useState<Role>('customer');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tip, setTip] = useState(4.5);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('biteflow-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('biteflow-cart', JSON.stringify(cart));
  }, [cart]);

  const selectedRestaurant = restaurants.find((item) => item.id === selectedRestaurantId) ?? restaurants[0];
  const menuItems = restaurantMenus[selectedRestaurant.id] ?? [];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const term = search.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.cuisine.toLowerCase().includes(term) ||
      restaurant.tags.join(' ').toLowerCase().includes(term)
    );
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3.2;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax + tip;

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = () => {
    if (!isSupabaseConfigured) {
      alert('Demo checkout ready. Add your Supabase keys and Stripe secret to enable live payment flow.');
      return;
    }

    if (supabase) {
      console.log('Checkout initiated via Supabase + Stripe flow');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-lg font-bold text-slate-900">
              B
            </div>
            <div>
              <p className="text-xl font-bold">BiteFlow</p>
              <p className="text-xs text-slate-400">Multi-role food delivery platform</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 md:max-w-xl">
            <label className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-400">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search restaurants or cuisines"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <button className="rounded-2xl border border-white/10 bg-slate-800/80 p-2.5 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
              <ShieldCheck size={18} />
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {roleOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => setRole(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                role === item.id
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950'
                  : 'border border-white/10 bg-slate-900/80 text-slate-200 hover:border-cyan-500/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {role === 'customer' && (
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard title="Nearby restaurants" value="18" change="+4 new" accent="cyan" />
                <MetricCard title="Average ETA" value="21 min" change="-3 min" accent="emerald" />
                <MetricCard title="Saved orders" value="6" change="2 favorites" accent="violet" />
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Restaurants near you</p>
                    <p className="text-sm text-slate-400">Curated for your current location</p>
                  </div>
                  <button className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                    Live map
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredRestaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      type="button"
                      onClick={() => setSelectedRestaurantId(restaurant.id)}
                      className={`overflow-hidden rounded-2xl border text-left transition ${
                        selectedRestaurant.id === restaurant.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/10 bg-slate-950/40 hover:border-cyan-500/50'
                      }`}
                    >
                      <img src={restaurant.image} alt={restaurant.name} className="h-32 w-full object-cover" />
                      <div className="space-y-3 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold">{restaurant.name}</p>
                            <p className="text-sm text-slate-400">{restaurant.cuisine}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
                            <Star size={12} className="fill-current" /> {restaurant.rating}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                          {restaurant.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 bg-slate-800 px-2 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{restaurant.eta} min</span>
                          <span>Delivery ${restaurant.deliveryFee.toFixed(2)}</span>
                          <span className={restaurant.open ? 'text-emerald-400' : 'text-red-400'}>
                            {restaurant.open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{selectedRestaurant.name}</p>
                    <p className="text-sm text-slate-400">{selectedRestaurant.cuisine}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                    {selectedRestaurant.eta} min
                  </span>
                </div>

                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.dietary.map((tag) => (
                              <span key={tag} className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="whitespace-nowrap font-semibold text-emerald-300">{currency.format(item.price)}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
                          {item.modifiers.map((modifier) => (
                            <span key={modifier} className="rounded-full border border-white/10 px-2 py-1">
                              {modifier}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Cart</p>
                    <p className="text-sm text-slate-400">Persistent checkout summary</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </div>
                </div>

                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                      Your cart is empty. Add some favorites to continue.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-2.5">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-400">{currency.format(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-sm"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>{currency.format(tax)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>{currency.format(deliveryFee)}</span></div>
                  <div className="flex justify-between items-center">
                    <span>Tip</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={tip}
                      onChange={(event) => setTip(Number(event.target.value) || 0)}
                      className="w-20 rounded-lg border border-white/10 bg-slate-800 px-2 py-1 text-right text-white outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-base font-semibold text-white">
                    <span>Total</span>
                    <span>{currency.format(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:opacity-95"
                >
                  Proceed to Stripe
                </button>
              </div>
            </aside>
          </div>
        )}

        {role === 'restaurant' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">Restaurant dashboard</p>
                  <p className="text-sm text-slate-400">Order flow and fulfillment</p>
                </div>
                <button className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  Live queue
                </button>
              </div>

              <div className="space-y-3">
                {orderQueue.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{order.customer}</p>
                        <p className="text-sm text-slate-400">{order.restaurant}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                      <span>{order.id}</span>
                      <span>{order.eta}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-semibold text-emerald-300">{currency.format(order.total)}</p>
                      <div className="flex gap-2">
                        <button className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                          Accept
                        </button>
                        <button className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
              <p className="text-xl font-semibold">Menu editor</p>
              <div className="mt-4 space-y-3">
                {restaurantMenus['a-2']?.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                      <button className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                        Active
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{currency.format(item.price)}</span>
                      <button className="text-xs text-cyan-300">Edit item</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {role === 'driver' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">Available deliveries</p>
                  <p className="text-sm text-slate-400">Pickup and drop-off queue</p>
                </div>
                <button className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                  3 trips online
                </button>
              </div>

              <div className="space-y-3">
                {driverTrips.map((trip) => (
                  <div key={trip.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{trip.customer}</p>
                        <p className="text-sm text-slate-400">{trip.distance} • {trip.eta}</p>
                      </div>
                      <button className="rounded-full bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-300">
                        Ready
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2"><MapPinned size={14} className="text-cyan-300" /><span>{trip.pickup}</span></div>
                      <div className="flex items-center gap-2"><PackageCheck size={14} className="text-emerald-300" /><span>{trip.dropoff}</span></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <button className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                        Route link
                      </button>
                      <button className="rounded-full border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white">
                        Picked up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">Live tracking</p>
                  <p className="text-sm text-slate-400">Rider route preview</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
                  On route
                </div>
              </div>

              <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950">
                <div className="absolute left-10 top-16 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.9)]" />
                <div className="absolute right-14 top-12 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.14),_transparent_55%)]" />
                <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full opacity-80">
                  <path d="M 20 220 C 90 150, 120 200, 180 135 S 260 80, 340 170" stroke="rgba(148,163,184,0.6)" strokeWidth="3" fill="none" strokeDasharray="8 8" />
                  <path d="M 70 50 L 140 220 L 260 120 L 360 200" stroke="rgba(56,189,248,0.45)" strokeWidth="3" fill="none" />
                </svg>
              </div>
            </section>
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {salesStats.map((stat) => (
                <MetricCard key={stat.label} title={stat.label} value={stat.value} change={stat.change} accent="violet" />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">Recent transactions</p>
                    <p className="text-sm text-slate-400">Live payment overview</p>
                  </div>
                  <button className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                    <CreditCard size={12} /> Stripe synced
                  </button>
                </div>

                <div className="space-y-3">
                  {adminTransactions.map((txn) => (
                    <div key={txn.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                      <div>
                        <p className="font-medium">{txn.name}</p>
                        <p className="text-xs text-slate-400">{txn.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-300">{txn.amount}</p>
                        <p className={`text-[10px] font-medium ${txn.status === 'Paid' ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {txn.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                <p className="text-xl font-semibold">User management</p>
                <div className="mt-4 space-y-3">
                  {['Customers', 'Vendors', 'Drivers', 'Support Agents'].map((label, index) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-semibold text-slate-950">
                          {label.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-slate-400">{180 + index * 42} active</p>
                        </div>
                      </div>
                      <button className="text-xs text-cyan-300">View</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-300" />
            Secure checkout and real-time dispatch
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2"><Wallet size={14} className="text-cyan-300" /> Stripe-ready</span>
            <span className="inline-flex items-center gap-2"><Users size={14} className="text-violet-300" /> Multi-role</span>
            <span className="inline-flex items-center gap-2"><Truck size={14} className="text-emerald-300" /> Live tracking</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, accent }: { title: string; value: string; change: string; accent: 'cyan' | 'emerald' | 'violet'; }) {
  const accentMap = {
    cyan: 'from-cyan-500/20 to-sky-500/20 text-cyan-300 border-cyan-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    violet: 'from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/30',
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-4 ${accentMap[accent]}`}>
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-300">{change}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map = {
    Placed: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    Preparing: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    'Out for Delivery': 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  } as const;

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${map[status]}`}>{status}</span>;
}

export default App;
