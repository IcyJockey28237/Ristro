import { useState, useEffect } from "react";

export default function DishFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Mains",
    image_url: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        price: (initialData.price / 100).toString(),
        category: initialData.category,
        image_url: initialData.image_url || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "Mains",
        image_url: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Math.round(parseFloat(formData.price) * 100), // convert dollars to cents
      available: 1
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-ristro-bg border border-ristro-card-border rounded-2xl shadow-2xl overflow-hidden glass-card">
        <div className="p-6 border-b border-ristro-card-border bg-black/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-ristro-gold" style={{ fontFamily: "var(--font-outfit)" }}>
            {initialData ? "Edit Dish" : "Add New Dish"}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Title</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="input-field"
              placeholder="e.g. Wagyu Steak"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-1">Price (USD)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="input-field"
              >
                <option value="Starters">Starters</option>
                <option value="Mains">Mains</option>
                <option value="Desserts">Desserts</option>
                <option value="Drinks">Drinks</option>
                <option value="Coffee">Coffee</option>
                <option value="Pastries">Pastries</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="input-field py-3 resize-none custom-scrollbar"
              placeholder="A delicious description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Image URL</label>
            <input 
              type="text" 
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
              className="input-field"
              placeholder="/dishes/example.png or http://..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-ristro-gold text-black hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,168,78,0.4)] transition-all font-bold"
            >
              {initialData ? "Save Changes" : "Create Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
