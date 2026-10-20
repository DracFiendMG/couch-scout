import { v4 as uuidv4 } from 'uuid';

export interface ProductDeal {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  retailer: string;
  url: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  couponAvailable?: boolean;
  couponCode?: string;
  shippingInfo?: string;
  imageUrl?: string;
}

export interface SearchTaskProgress {
  step: string;
  retailer?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'warning';
  message: string;
  timestamp: string;
}

/**
 * Normalizes scraped prices (e.g., "$49.99", "USD 79.00") into clean numbers
 */
export function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Curated high-fidelity mock data generator for offline/sandbox testing
 * Ensures immediate demo capabilities without network or credential roadblocks.
 */
export function generateCuratedDeals(query: string, retailers: string[]): ProductDeal[] {
  const qLower = query.toLowerCase();

  const mockTemplates = [
    {
      keyword: 'keyboard',
      deals: [
        {
          title: 'Keychron K6 Pro QMK/VIA Wireless Custom Mechanical Keyboard',
          retailer: 'Amazon',
          price: 64.99,
          originalPrice: 89.99,
          discountPercent: 28,
          currency: 'USD',
          inStock: true,
          rating: 4.7,
          reviewCount: 1840,
          couponAvailable: true,
          couponCode: 'SLOTHKEY10',
          shippingInfo: 'Free 2-day delivery',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
          url: 'https://amazon.com/dp/B08X6K6PRO',
        },
        {
          title: 'Royal Kludge RK68 Hot-Swappable 65% RGB Wireless Keyboard',
          retailer: 'BestBuy',
          price: 49.99,
          originalPrice: 69.99,
          discountPercent: 29,
          currency: 'USD',
          inStock: true,
          rating: 4.5,
          reviewCount: 920,
          couponAvailable: false,
          shippingInfo: 'Free store pickup or $4.99 shipping',
          imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60',
          url: 'https://bestbuy.com/site/rk68',
        },
        {
          title: 'EPOMAKER EP84 Plus 75% Hot Swap Mechanical Gaming Keyboard',
          retailer: 'eBay',
          price: 59.00,
          originalPrice: 75.00,
          discountPercent: 21,
          currency: 'USD',
          inStock: true,
          rating: 4.8,
          reviewCount: 450,
          couponAvailable: true,
          couponCode: 'SAVE5EBAY',
          shippingInfo: 'Free standard shipping from top rated seller',
          imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60',
          url: 'https://ebay.com/itm/epomaker-ep84',
        },
      ],
    },
    {
      keyword: 'headphones',
      deals: [
        {
          title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
          retailer: 'Amazon',
          price: 328.00,
          originalPrice: 399.99,
          discountPercent: 18,
          currency: 'USD',
          inStock: true,
          rating: 4.6,
          reviewCount: 8420,
          couponAvailable: true,
          couponCode: 'CLIP $20 COUPON',
          shippingInfo: 'Free Prime next-day shipping',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          url: 'https://amazon.com/dp/B09XS7JWHH',
        },
        {
          title: 'Bose QuietComfort 45 Bluetooth Wireless Headphones',
          retailer: 'BestBuy',
          price: 279.00,
          originalPrice: 329.00,
          discountPercent: 15,
          currency: 'USD',
          inStock: true,
          rating: 4.7,
          reviewCount: 3100,
          couponAvailable: false,
          shippingInfo: 'Free standard delivery',
          imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60',
          url: 'https://bestbuy.com/site/bose-qc45',
        },
      ],
    },
  ];

  const matched = mockTemplates.find((t) => qLower.includes(t.keyword));
  if (matched) {
    return matched.deals.map((d) => ({ ...d, id: uuidv4() }));
  }

  // Generic dynamic generator based on user query
  return retailers.slice(0, 3).map((retailer, i) => {
    const basePrice = 50 + (i + 1) * 18;
    const discount = 15 + i * 5;
    const finalPrice = Number((basePrice * (1 - discount / 100)).toFixed(2));

    return {
      id: uuidv4(),
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Verified Edition`,
      retailer,
      price: finalPrice,
      originalPrice: basePrice,
      discountPercent: discount,
      currency: 'USD',
      inStock: true,
      rating: Number((4.3 + (i % 5) * 0.1).toFixed(1)),
      reviewCount: 200 + i * 150,
      couponAvailable: i === 0,
      couponCode: i === 0 ? 'SLOTHDEAL' : undefined,
      shippingInfo: 'Free shipping on orders over $35',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60',
      url: `https://${retailer.toLowerCase().replace(/[^a-z]/g, '')}.com/search?q=${encodeURIComponent(query)}`,
    };
  });
}
