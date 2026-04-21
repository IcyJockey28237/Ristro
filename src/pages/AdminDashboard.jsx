import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DishFormModal from "../components/DishFormModal";

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/menu");
      setMenuItems(response.data);
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

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
    // If your browser blocked native popups previously, window.confirm silently fails.
    try {
      await axios.delete(`http://localhost:8000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` }
      });
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(`Error deleting item: ${err.message}. Details: ${JSON.stringify(err.response?.data)}`);
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem("ristro_token")}` };
      if (editingDish) {
        // Update
        const res = await axios.put(`http://localhost:8000/api/menu/${editingDish.id}`, payload, { headers });
        setMenuItems(menuItems.map(item => item.id === editingDish.id ? res.data : item));
      } else {
        // Create
        const res = await axios.post("http://localhost:8000/api/menu", payload, { headers });
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
          <h1 className="text-3xl font-bold text-ristro-gold tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Ristro Control Mode
          </h1>
          <div className="hidden md:block h-6 w-px bg-white/10"></div>
          <span className="hidden md:inline-block px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-6">
          <p className="hidden md:block text-white/50 text-sm">
            {user?.email}
          </p>
          <button onClick={handleLogout} className="text-sm font-medium text-white/60 hover:text-red-400 transition-colors">
            Exit Control
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-outfit)" }}>Menu Management</h2>
            <p className="text-ristro-text-muted text-sm">Add, remove, or modify dishes shown to customers.</p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-ristro-gold text-black py-2.5 px-5 rounded-lg hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,168,78,0.4)] transition-all font-bold tracking-wide active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Dish
          </button>
        </div>

        {/* Dynamic Table */}
        <div className="glass-card overflow-hidden border border-ristro-card-border">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-ristro-text-muted text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-white/10 w-16">Image</th>
                  <th className="p-4 font-semibold border-b border-white/10">Dish Title</th>
                  <th className="p-4 font-semibold border-b border-white/10">Category</th>
                  <th className="p-4 font-semibold border-b border-white/10">Price</th>
                  <th className="p-4 font-semibold border-b border-white/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="spinner mx-auto" style={{ width: 32, height: 32, borderWidth: 3 }}></div>
                    </td>
                  </tr>
                ) : menuItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-ristro-text-muted">
                      No menu items found. Start by adding one.
                    </td>
                  </tr>
                ) : (
                  menuItems.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-md border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center text-xs opacity-50">None</div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/50 truncate max-w-xs">{item.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs tracking-wide">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-ristro-gold font-bold">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price / 100)}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="text-white/50 hover:text-blue-400 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-white/50 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
