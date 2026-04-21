import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DishCard from "../components/DishCard";
import { API_URL } from "../config";

export default function CustomerDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Simple cart state: mapping item.id to quantity
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        setMenuItems(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch menu", err);
        setError("Could not load the menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdd = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemove = (item) => {
    setCart((prev) => {
      const newCount = (prev[item.id] || 0) - 1;
      if (newCount <= 0) {
        const newCart = { ...prev };
        delete newCart[item.id];
        return newCart;
      }
      return { ...prev, [item.id]: newCount };
    });
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(cart).map(([id, quantity]) => {
        const menuItem = menuItems.find((m) => m.id === parseInt(id));
        return {
          menu_item_id: parseInt(id),
          quantity,
          price_at_time: menuItem.price,
        };
      });

      const totalPrice = items.reduce((sum, it) => sum + it.price_at_time * it.quantity, 0);

      await axios.post(
        `${API_URL}/orders`,
        { items, total_price: totalPrice },
        { headers: { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` } }
      );

      setOrderSuccess(true);
      setCart({});
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Derive categories dynamically from properties
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];

  // Derive cart totals
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPriceInCents = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
  // Filter Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ristro-bg text-ristro-text font-inter selection:bg-ristro-gold/30">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-ristro-card-border/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-ristro-gold tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Ristro
          </h1>
          <div className="hidden md:block h-6 w-px bg-white/10"></div>
          <p className="hidden md:block text-ristro-text-muted text-sm capitalize">
            Welcome back, {user?.name.split(" ")[0]}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10 py-2.5 rounded-full bg-white/5 border-white/10 hover:border-ristro-gold/50 focus:border-ristro-gold"
          />
        </div>

        {/* Cart & Logout */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsCartOpen(true); setOrderSuccess(false); }}
            className="relative p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 border border-transparent hover:border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span className="font-semibold hidden sm:inline">Order</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ristro-gold text-[11px] font-bold text-black border-2 border-[#09090b]">
                {totalItems}
              </span>
            )}
          </button>
          
          <div className="h-6 w-px bg-white/10"></div>
          
          <button onClick={handleLogout} className="text-sm font-medium text-white/60 hover:text-ristro-gold transition-colors">
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-ristro-gold text-black border-ristro-gold shadow-[0_0_15px_rgba(212,168,78,0.3)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white/50 mb-2">No dishes found</h2>
            <p className="text-white/30">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <DishCard
                key={item.id}
                item={item}
                cartCount={cart[item.id] || 0}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-ristro-bg border-l border-ristro-card-border h-full flex flex-col shadow-2xl transform transition-transform duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-ristro-card-border flex items-center justify-between bg-black/40">
              <h2 className="text-2xl font-bold text-ristro-gold" style={{ fontFamily: "var(--font-outfit)" }}>Your Order</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-white/60 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {orderSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Order Placed!</h3>
                  <p className="text-ristro-text-muted">Your order has been sent to the kitchen and will be ready shortly.</p>
                </div>
              ) : totalItems === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-ristro-text-muted">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-lg">Your cart is empty.</p>
                  <p className="text-sm mt-2 opacity-70">Add some delicious items from the menu.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menuItems.find(m => m.id === parseInt(id));
                    if (!item) return null;
                    return (
                      <div key={id} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                        <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-md object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                          <p className="text-ristro-gold text-sm font-bold mt-1">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price / 100)}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10">
                          <button onClick={() => handleAdd(item)} className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white rounded hover:bg-white/20 transition-colors">+</button>
                          <span className="text-sm font-bold w-6 text-center text-white">{qty}</span>
                          <button onClick={() => handleRemove(item)} className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white rounded hover:bg-white/20 transition-colors">-</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {!orderSuccess && totalItems > 0 && (
              <div className="p-6 border-t border-ristro-card-border bg-black/40 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-ristro-text-muted">Total</span>
                  <span className="font-bold text-ristro-gold text-2xl" style={{ fontFamily: "var(--font-outfit)" }}>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalPriceInCents / 100)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-ristro-gold text-black hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(212,168,78,0.4)]
                    relative overflow-hidden group flex justify-center items-center h-[52px]"
                >
                  {isSubmitting ? (
                     <div className="spinner !border-black !border-t-transparent w-6 h-6 border-2" />
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
