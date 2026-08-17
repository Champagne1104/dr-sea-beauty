(function () {
  "use strict";

  const products = [
    {
      sku: "DRSEA-1000",
      ref: "1000",
      name: "Prebiotic Anti-Age Eye Cream-Serum",
      size: "30 ml",
      category: "Facial Care",
      price: 27.4,
      image: "assets/products/DRSEA-1000-main.jpg",
      imageAlt: "Dr. SEA Prebiotic Anti-Age Eye Cream-Serum box and bottle",
      summary: "Lightweight daily moisture for the delicate eye area with Prebiulin and biotin.",
      details: "A cream-serum texture created for the eye area. It supports a hydrated, smoother-looking appearance and fits easily into morning or evening routines.",
      highlights: ["Eye-area moisture", "Prebiulin and biotin", "Morning or evening use"]
    },
    {
      sku: "DRSEA-1001",
      ref: "1001",
      name: "Prebiotic Hydrating Day Cream",
      size: "50 ml",
      category: "Facial Care",
      price: 27.4,
      summary: "Comforting daytime hydration for skin that feels soft and cared for.",
      details: "A daily face cream designed to help maintain moisture and comfort. Apply to clean skin as the moisturizing step in a daytime routine.",
      highlights: ["Daily hydration", "Comforting cream texture", "Prebiotic facial care"]
    },
    {
      sku: "DRSEA-1002",
      ref: "1002",
      name: "Prebiotic Regenerating Night Cream",
      size: "50 ml",
      category: "Facial Care",
      price: 27.4,
      summary: "Overnight moisture for a rested, replenished-looking complexion.",
      details: "A nourishing night cream that helps keep skin feeling moisturized and comfortable while you sleep. Use on clean skin in the evening.",
      highlights: ["Nighttime moisture", "Comfort-focused care", "Prebiotic facial care"]
    },
    {
      sku: "DRSEA-1003",
      ref: "1003",
      name: "Daily Facial Oil-Free Mattifier",
      subtitle: "Dunaliella & Dead Sea Minerals",
      size: "50 ml",
      category: "Facial Care",
      price: 23.4,
      summary: "Lightweight, oil-free daily care with Dunaliella and Dead Sea minerals.",
      details: "A lightweight facial moisturizer for a fresh, balanced-looking finish without a heavy feel. Designed for everyday cosmetic care.",
      highlights: ["Oil-free formula", "Lightweight finish", "Dead Sea minerals"]
    },
    {
      sku: "DRSEA-1004",
      ref: "1004",
      name: "Superfood Facial Cream",
      subtitle: "Avocado & Aloe Vera",
      size: "50 ml",
      category: "Facial Care",
      price: 23.4,
      summary: "Everyday facial moisture with avocado and aloe vera.",
      details: "A comfortable daily cream formulated with avocado and aloe vera for moisturized, soft-feeling skin.",
      highlights: ["Avocado and aloe vera", "Soft-feeling finish", "Everyday moisture"]
    },
    {
      sku: "DRSEA-1005",
      ref: "1005",
      name: "Balancing Fluid SPF 15",
      subtitle: "Biosaccharides, Olive Oil & Green Tea",
      size: "50 ml",
      category: "Facial Care",
      price: 22.4,
      summary: "Lightweight facial hydration with biosaccharides, olive oil and green tea.",
      details: "A balancing face fluid for normal to combination skin. Use according to the package directions and pair with appropriate sun-protection habits.",
      highlights: ["Normal to combination skin", "Lightweight hydration", "SPF 15 package claim"]
    },
    {
      sku: "DRSEA-1006",
      ref: "1006",
      name: "Moisturizing Brightening Cream SPF 15",
      subtitle: "NEOGLOW & Vitamin C",
      size: "50 ml",
      category: "Facial Care",
      price: 22.4,
      summary: "Moisturizing facial care with NEOGLOW and vitamin C for a fresh-looking complexion.",
      details: "A daily cosmetic moisturizer created to support hydration and a brighter-looking appearance. Follow the directions printed on the package.",
      highlights: ["Moisturizing care", "NEOGLOW and vitamin C", "SPF 15 package claim"]
    },
    {
      sku: "DRSEA-1007",
      ref: "1007",
      name: "Lifting Cream for Face, Eyes & Neck SPF 15",
      subtitle: "Pomegranate & Ginger",
      size: "50 ml",
      category: "Facial Care",
      price: 22.4,
      summary: "Multi-area moisturizing care with pomegranate and ginger.",
      details: "A face, eye-area and neck cream intended for daily cosmetic care. It helps skin feel moisturized and supports a smoother-looking appearance.",
      highlights: ["Face, eye area and neck", "Pomegranate and ginger", "SPF 15 package claim"]
    },
    {
      sku: "DRSEA-1101",
      ref: "1101",
      name: "Moisturizing Shampoo",
      subtitle: "Moroccan Argan Oil & Amino Acids",
      size: "300 ml",
      category: "Hair Care",
      price: 13.4,
      summary: "Everyday cleansing with Moroccan argan oil and an amino-acid complex.",
      details: "A moisturizing shampoo for routine cleansing and soft-feeling hair. Massage into wet hair and rinse according to package directions.",
      highlights: ["Everyday cleansing", "Moroccan argan oil", "Amino-acid complex"]
    },
    {
      sku: "DRSEA-1092",
      ref: "1092",
      name: "Portofino Deodorant",
      size: "50 g",
      category: "Men's Care",
      price: 16.4,
      summary: "Compact daily deodorant care with the Portofino fragrance profile.",
      details: "A 50 g deodorant designed for everyday freshness. Apply only as directed on the package.",
      highlights: ["Daily freshness", "Portofino fragrance", "Compact 50 g size"]
    }
  ];

  const bySku = new Map(products.map((product) => [product.sku, product]));
  const byRef = new Map(products.map((product) => [product.ref, product]));

  window.DrSeaCatalog = Object.freeze({
    products: Object.freeze(products),
    find(value) {
      const key = String(value || "").trim();
      return bySku.get(key.toUpperCase()) || byRef.get(key) || null;
    },
    money(value) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    }
  });
})();
