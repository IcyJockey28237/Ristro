import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DishFormModal from "../components/DishFormModal";
import { API_URL } from "../config";
import coffee from "../assets/coffee.png";

// Custom Status Selector Component
function StatusSelector({ currentStatus, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statuses = [
    { value: "pending", label: "Pending", color: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { value: "preparing", label: "Preparing", color: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10", border: "border-blue-500/20" },
    { value: "completed", label: "Completed", color: "bg-green-500", text: "text-green-500", light: "bg-green-500/10", border: "border-green-500/20" },
  ];

  const current = statuses.find(s => s.value === currentStatus) || statuses[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${current.border} ${current.light} transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group`}
      >
        <span className={`w-2 h-2 rounded-full ${current.color} shadow-[0_0_8px_rgba(255,255,255,0.3)]`}></span>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${current.text}`}>{current.label}</span>
        <svg className={`w-3 h-3 ${current.text} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-44 z-50 bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-fade-in origin-top-right">
          <p className="text-[9px] uppercase tracking-widest text-white/30 px-3 py-2 font-bold">Change Status</p>
          <div className="space-y-1">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  onUpdate(s.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  currentStatus === s.value ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.color} ${currentStatus === s.value ? 'scale-125 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'opacity-40'}`}></span>
                <span className={`text-xs font-semibold ${currentStatus === s.value ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {s.label}
                </span>
                {currentStatus === s.value && (
                  <svg className="w-3 h-3 text-ristro-gold ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders"); // "menu" or "orders"
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu`);
      setMenuItems(response.data);
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      const response = await axios.get(`${API_URL}/orders`, { headers });
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "menu") {
      fetchMenu();
    } else {
      fetchOrders();
      // Set up polling for orders to see new ones automatically
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openCreateModal = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await axios.delete(`${API_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` }
      });
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  const handleAvailabilityToggle = async (id, currentStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      const res = await axios.patch(`${API_URL}/menu/${id}/availability`, { available: !currentStatus }, { headers });
      setMenuItems(menuItems.map(item => item.id === id ? res.data : item));
    } catch (err) {
      console.error(err);
      alert("Failed to update availability.");
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      const res = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, { headers });
      setOrders(orders.map(order => order.id === orderId ? res.data : order));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? This action cannot be undone.")) return;
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      await axios.delete(`${API_URL}/orders/${orderId}`, { headers });
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm("CLEAR ALL ORDERS? This will permanently erase the entire order history.")) return;
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      await axios.delete(`${API_URL}/orders`, { headers });
      setOrders([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear orders.");
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      if (editingDish) {
        const res = await axios.put(`${API_URL}/menu/${editingDish.id}`, payload, { headers });
        setMenuItems(menuItems.map(item => item.id === editingDish.id ? res.data : item));
      } else {
        const res = await axios.post(`${API_URL}/menu`, payload, { headers });
        setMenuItems([...menuItems, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save dish.");
    }
  };

  return (
    <div className="min-h-screen bg-ristro-bg text-ristro-text font-inter selection:bg-ristro-gold/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-ristro-card-border/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={coffee} alt="Ristro Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-3xl font-bold text-ristro-gold tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              Ristro Control
            </h1>
          </div>
          <div className="hidden md:block h-6 w-px bg-white/10"></div>
          <span className="px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "orders" ? "bg-ristro-gold text-black shadow-lg" : "text-white/60 hover:text-white"}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab("menu")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "menu" ? "bg-ristro-gold text-black shadow-lg" : "text-white/60 hover:text-white"}`}
            >
              Menu
            </button>
          </nav>
          <div className="hidden lg:block h-6 w-px bg-white/10"></div>
          <button onClick={handleLogout} className="text-sm font-medium text-white/40 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {activeTab === "menu" ? (
          <>
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-outfit)" }}>Menu Management</h2>
                <p className="text-ristro-text-muted text-sm">Control dish details and stock availability.</p>
              </div>
              
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-ristro-gold text-black py-2.5 px-5 rounded-lg hover:bg-yellow-500 transition-all font-bold active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Dish
              </button>
            </div>

            <div className="glass-card border border-ristro-card-border">
              <div className="overflow-x-visible">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-ristro-text-muted text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-white/10">Dish</th>
                      <th className="p-4 font-semibold border-b border-white/10">Price</th>
                      <th className="p-4 font-semibold border-b border-white/10">Status</th>
                      <th className="p-4 font-semibold border-b border-white/10 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan="4" className="p-12 text-center"><div className="spinner mx-auto"></div></td></tr>
                    ) : menuItems.length === 0 ? (
                      <tr><td colSpan="4" className="p-12 text-center text-white/40">No items found.</td></tr>
                    ) : (
                      menuItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image_url || coffee} className="w-10 h-10 rounded-md object-cover border border-white/10" alt="" />
                              <div>
                                <p className="font-semibold text-white text-sm">{item.title}</p>
                                <p className="text-xs text-white/40">{item.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-ristro-gold font-mono text-sm">
                            ₹{(item.price / 100).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleAvailabilityToggle(item.id, item.available)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${item.available ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
                            >
                              {item.available ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button onClick={() => openEditModal(item)} className="p-2 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-md text-white/60 hover:text-red-400 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-outfit)" }}>Order Management</h2>
                  <p className="text-ristro-text-muted text-sm">Monitor and process incoming customer orders.</p>
                </div>
                <div className="hidden lg:block h-10 w-px bg-white/10"></div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  {["all", "pending", "preparing", "completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                        orderStatusFilter === status ? "bg-white/20 text-white" : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClearAllOrders}
                  className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Clear All
                </button>
                <button 
                  onClick={fetchOrders}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  title="Refresh Orders"
                >
                  <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading && orders.length === 0 ? (
                <div className="p-20 text-center"><div className="spinner mx-auto"></div></div>
              ) : orders.filter(o => orderStatusFilter === "all" || o.status === orderStatusFilter).length === 0 ? (
                <div className="glass-card p-20 text-center text-white/40 border border-white/5">
                  <p>{orderStatusFilter === "all" ? "No orders yet." : `No ${orderStatusFilter} orders found.`}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders
                    .filter(o => orderStatusFilter === "all" || o.status === orderStatusFilter)
                    .map(order => (
                    <div key={order.id} className="glass-card border border-white/10 flex flex-col md:flex-row">
                      <div className={`w-2 md:w-3 ${order.status === "pending" ? "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : order.status === "preparing" ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"}`}></div>
                      <div className="flex-1 p-5 lg:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-white tracking-tighter" style={{ fontFamily: "var(--font-outfit)" }}>ORD-{order.id.toString().padStart(4, '0')}</span>
                            <div className="h-4 w-px bg-white/10"></div>
                            {order.table_number && (
                              <>
                                <span className="px-2.5 py-0.5 rounded-md bg-ristro-gold/10 text-ristro-gold text-[10px] font-bold uppercase tracking-wider border border-ristro-gold/20">
                                  Table {order.table_number}
                                </span>
                                <div className="h-4 w-px bg-white/10"></div>
                              </>
                            )}
                            <span className="text-xs text-white/40 font-mono flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete Order"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                            <StatusSelector 
                              currentStatus={order.status} 
                              onUpdate={(newStatus) => handleStatusUpdate(order.id, newStatus)} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 font-bold flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-ristro-gold"></span>
                              Ordered Items
                            </p>
                            <ul className="space-y-2">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-white/80 flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                  <span className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-ristro-gold">{item.quantity}</span>
                                    <span className="font-medium">{item.menu_item?.title || "Unknown Dish"}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-col justify-end">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-ristro-gold"></span>
                              Final Bill
                            </p>
                            <p className="text-3xl font-bold text-ristro-gold tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                              ₹{(order.total_price / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <DishFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDish}
      />
    </div>
  );
}
