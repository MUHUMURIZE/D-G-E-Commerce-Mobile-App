const CATEGORY_CATALOG = [
  {
    category: 'Clothes',
    basePrice: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900',
    products: [
      'Everyday Cotton T-Shirt', 'Ribbed Knit Top', 'Linen Weekend Shirt', 'Classic Polo Shirt',
      'Relaxed Cotton Blazer', 'Tailored Chino Trousers', 'Straight-Leg Denim Jeans',
      'Lightweight Summer Dress', 'Wrap Midi Dress', 'Printed Cotton Skirt', 'Soft Knit Cardigan',
      'Smart Office Shirt', 'Weekend Hoodie', 'Essential Cotton Shorts', 'Light Rain Jacket',
      'Traditional Imigongo Print Shirt', 'Elegant Evening Gown', 'Classic Two-Piece Suit',
    ],
  },
  {
    category: 'Shoes',
    basePrice: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',
    products: [
      'Everyday Leather Sneaker', 'Classic Canvas Trainer', 'City Walking Shoe',
      'Leather Low-Top Sneaker', 'Everyday Leather Loafer', 'Comfort Ballet Flat',
      'Minimal Leather Sandal', 'Weekend Slide Sandal', 'Smart Office Pump',
      'Classic Chelsea Boot', 'Lightweight Running Shoe', 'Trail Walking Shoe',
      'Children’s School Shoe', 'Leather Derby Shoe', 'Woven Summer Espadrille',
      'Elegant Evening Heel', 'Cushioned House Slipper', 'Traditional Leather Sandal',
    ],
  },
  {
    category: 'Bags',
    basePrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900',
    products: [
      'Structured Crossbody Bag', 'Classic Leather Tote', 'Everyday Shopper Bag',
      'Compact Evening Clutch', 'Canvas Market Tote', 'Workday Laptop Bag',
      'Travel Weekend Duffle', 'Lightweight Day Backpack', 'Mini Shoulder Bag',
      'Woven Sisal Market Bag', 'Zip-Top Everyday Purse', 'Adjustable Belt Bag',
      'Handwoven Kigali Basket Bag', 'School Book Backpack', 'Foldable Travel Tote',
      'Classic Satchel Bag', 'Leather Card Wallet', 'Compact Camera Bag',
    ],
  },
  {
    category: 'Jewellery',
    basePrice: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900',
    products: [
      'Gold-Tone Hoop Earrings', 'Delicate Pendant Necklace', 'Classic Chain Bracelet',
      'Minimal Signet Ring', 'Pearl Stud Earrings', 'Layered Chain Necklace',
      'Woven Bead Bracelet', 'Gold-Plated Cuff Bracelet', 'Everyday Stud Earrings',
      'Adjustable Stacking Ring', 'Traditional Imigongo Brooch', 'Crystal Drop Earrings',
      'Slim Bangle Bracelet', 'Heart Pendant Necklace', 'Beaded Statement Necklace',
      'Classic Analog Watch', 'Gentleman’s Leather Watch', 'Gift Jewellery Set',
    ],
  },
  {
    category: 'Cosmetics',
    basePrice: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900',
    products: [
      'Moisturising Shea Body Butter', 'Gentle Daily Face Cleanser', 'Hydrating Face Cream',
      'Broad-Spectrum SPF 50 Sunscreen', 'Nourishing Lip Balm', 'Natural Hair Oil Blend',
      'Soft Matte Lip Colour', 'Lightweight Liquid Foundation', 'Everyday Mascara',
      'Cleansing Micellar Water', 'Refreshing Facial Toner', 'Overnight Repair Serum',
      'Gentle Baby Lotion', 'Aloe Vera Soothing Gel', 'Botanical Shampoo',
      'Moisture-Rich Conditioner', 'Hand and Nail Cream', 'Natural Rosewater Mist',
    ],
  },
  {
    category: 'Household Equipment',
    basePrice: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900',
    products: [
      'Handwoven Storage Basket', 'Stoneware Dinner Plate Set', 'Cotton Kitchen Towel Set',
      'Stainless Steel Water Flask', 'Reusable Food Storage Set', 'Woven Table Runner',
      'Ceramic Tea Cup Pair', 'Bamboo Serving Board', 'Cotton Cushion Cover',
      'Compact Electric Kettle', 'Two-Burner Gas Cooker', 'Non-Stick Cooking Pot',
      'Solar LED Table Lamp', 'Handmade Ceramic Vase', 'Cotton Bed Sheet Set',
      'Insulated Lunch Container', 'Essential Cleaning Brush Set', 'Woven Laundry Hamper',
    ],
  },
];

function buildCatalog() {
  return CATEGORY_CATALOG.flatMap((category, categoryIndex) =>
    category.products.map((name, productIndex) => {
      const price = category.basePrice + productIndex * (categoryIndex % 2 === 0 ? 4200 : 6100);
      return {
        name,
        category: category.category,
        description: `${name}, thoughtfully selected for everyday life in Rwanda. Made for quality, comfort, and lasting value.`,
        price,
        stock: 4 + ((productIndex * 7 + categoryIndex * 3) % 37),
        imageUrl: category.imageUrl,
        rating: Number((4 + ((productIndex * 13 + categoryIndex * 7) % 10) / 10).toFixed(1)),
      };
    }));
}

module.exports = { CATEGORY_CATALOG, buildCatalog };
