import React from "react";

export default function DishCard({ item, cartCount, onAdd, onRemove }) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(item.price / 100);

  return (
    <div className="glass-card overflow-hidden hover:shadow-[0_8px_32px_rgba(212,168,78,0.15)] transition-all duration-300 group flex flex-col h-full border border-ristro-card-border/50">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-black/40">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ristro-text-muted">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-ristro-gold text-xs font-semibold border border-ristro-gold/30 uppercase tracking-widest shadow-lg">
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="text-xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {item.title}
          </h3>
          <span className="text-lg font-bold text-ristro-gold shrink-0 ml-3">
            {formattedPrice}
          </span>
        </div>

        <p className="text-sm text-ristro-text-muted flex-grow mb-6 leading-relaxed">
          {item.description}
        </p>

        {/* Action Area */}
        <div className="mt-auto">
          {cartCount > 0 ? (
            <div className="flex items-center justify-between bg-ristro-input-bg border border-ristro-card-border rounded-lg p-1.5">
              <button
                onClick={() => onRemove(item)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-black/40 text-white hover:bg-black/60 transition-colors active:scale-95"
              >
                -
              </button>
              <span className="font-bold text-white text-lg w-8 text-center">{cartCount}</span>
              <button
                onClick={() => onAdd(item)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-ristro-gold text-black hover:bg-yellow-500 transition-colors active:scale-95 text-lg font-bold"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="w-full py-3 rounded-lg bg-ristro-gold text-black font-bold uppercase tracking-wider text-sm hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,168,78,0.4)] transition-all duration-300 active:scale-[0.98]"
            >
              Add to Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
