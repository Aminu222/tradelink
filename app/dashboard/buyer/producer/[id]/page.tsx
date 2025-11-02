"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaSearch, FaHeart, FaShoppingCart, FaStar, FaIndustry, FaArrowLeft, FaUser } from "react-icons/fa";
import { apiService } from "@/services/api";

export default function ProducerStorePage() {
  const params = useParams();
  const router = useRouter();
  const [producer, setProducer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (params.id) {
      const initializeData = async () => {
        await fetchProducerData();
        await loadUserData();
      };
      initializeData();
    }
  }, [params.id]);

  const loadUserData = async () => {
    try {
      // Load wishlist from API
      const wishlistData = await apiService.getWishlist();
      const wishlistIds = wishlistData.map((item: any) => item.product.id.toString());
      setWishlist(wishlistIds);
      localStorage.setItem("buyerWishlist", JSON.stringify(wishlistIds));
      
      // Load cart from localStorage for now (cart API is already implemented)
      const storedCart = JSON.parse(localStorage.getItem("buyerCart") || "{}");
      setCart(storedCart);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to localStorage
      const storedWishlist = JSON.parse(localStorage.getItem("buyerWishlist") || "[]");
      const storedCart = JSON.parse(localStorage.getItem("buyerCart") || "{}");
      setWishlist(storedWishlist);
      setCart(storedCart);
    }
  };

  const fetchProducerData = async () => {
    try {
      setLoading(true);
      const producerId = params.id;
      
      if (!producerId) {
        throw new Error('Producer ID is required');
      }
      
      console.log('Fetching producer data for ID:', producerId);
      
      // Fetch producer details
      try {
        const producerData = await apiService.getProducerDetails(producerId.toString());
        console.log('Producer data:', producerData);
        setProducer(producerData);
      } catch (producerError: any) {
        console.error('Error fetching producer details:', producerError);
        // If producer details fail, try to get info from products
        const productsData = await apiService.getProducts();
        const producerProducts = productsData.filter((p: any) => p.producer_id?.toString() === producerId.toString());
        
        if (producerProducts.length > 0) {
          const firstProduct = producerProducts[0];
          setProducer({
            id: firstProduct.producer_id,
            company_name: firstProduct.producer_company,
            first_name: firstProduct.producer_first_name,
            last_name: firstProduct.producer_last_name,
            username: firstProduct.producer_username
          });
        } else {
          throw new Error('Producer not found');
        }
      }
      
      // Fetch all products and filter by producer
      const productsData = await apiService.getProducts();
      const producerProducts = productsData.filter((p: any) => p.producer_id?.toString() === producerId.toString());
      console.log('Producer products:', producerProducts);
      setProducts(producerProducts);
    } catch (err: any) {
      console.error('Error fetching producer data:', err);
      setError(err.message || 'Failed to load producer data');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      if (wishlist.includes(productId)) {
        // Remove from wishlist - we need to get the wishlist item ID first
        const wishlistData = await apiService.getWishlist();
        const wishlistItem = wishlistData.find((item: any) => item.product.id === parseInt(productId));
        if (wishlistItem) {
          await apiService.removeFromWishlist(wishlistItem.id);
          const newWishlist = wishlist.filter(id => id !== productId);
          setWishlist(newWishlist);
          localStorage.setItem("buyerWishlist", JSON.stringify(newWishlist));
          console.log('Removed from wishlist:', productId);
        } else {
          console.error('Wishlist item not found for product:', productId);
          // If we can't find the wishlist item, just remove it from local state
          const newWishlist = wishlist.filter(id => id !== productId);
          setWishlist(newWishlist);
          localStorage.setItem("buyerWishlist", JSON.stringify(newWishlist));
        }
      } else {
        // Add to wishlist
        await apiService.addToWishlist({
          product_id: parseInt(productId)
        });
        const newWishlist = [...wishlist, productId];
        setWishlist(newWishlist);
        localStorage.setItem("buyerWishlist", JSON.stringify(newWishlist));
        console.log('Added to wishlist:', productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // If there's an error, refresh the wishlist data
      try {
        const wishlistData = await apiService.getWishlist();
        const wishlistIds = wishlistData.map((item: any) => item.product.id.toString());
        setWishlist(wishlistIds);
        localStorage.setItem("buyerWishlist", JSON.stringify(wishlistIds));
      } catch (refreshError) {
        console.error('Error refreshing wishlist:', refreshError);
      }
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await apiService.addToCart({
        product_id: parseInt(productId),
        quantity: 1
      });
      
      // Update local cart state
      const newCart = { ...cart };
      newCart[productId] = (newCart[productId] || 0) + 1;
      setCart(newCart);
      localStorage.setItem("buyerCart", JSON.stringify(newCart));
      
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      // Get the cart item ID from the backend
      const cartData = await apiService.getCart();
      const cartItem = cartData.find((item: any) => item.product_id === parseInt(productId));
      
      if (cartItem) {
        await apiService.removeFromCart(cartItem.id);
      }
      
      // Update local cart state
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
      localStorage.setItem("buyerCart", JSON.stringify(newCart));
      
      console.log('Product removed from cart successfully');
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartQuantity = (productId: string) => cart[productId] || 0;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>;
  if (error) return (
    <div style={{ padding: 32 }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          marginBottom: 24
        }}
      >
        <FaArrowLeft />
        Back to Products
      </button>
      <div style={{ textAlign: 'center', padding: 64, color: '#dc2626' }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Producer Not Found</h3>
        <p>{error}</p>
        <p style={{ marginTop: 16, color: '#6b7280' }}>
          The producer you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>
  );
  if (!producer) return <div style={{ padding: 32 }}>Producer not found</div>;

  return (
    <div style={{ padding: 32 }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          marginBottom: 24
        }}
      >
        <FaArrowLeft />
        Back to Products
      </button>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          {producer.company_name || `${producer.first_name} ${producer.last_name}`}
        </h1>
        <p style={{ color: '#6b7280' }}>
          {filteredProducts.length} products available
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <div style={{ height: 200, background: '#f3f4f6', position: 'relative' }}>
              {product.images && product.images[0] ? (
                <img
                  src={`http://localhost:5000${product.images[0]}`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                  <FaIndustry style={{ fontSize: 48 }} />
                </div>
              )}
              
              <button
                onClick={() => toggleWishlist(product.id.toString())}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: wishlist.includes(product.id.toString()) ? '#ec4899' : '#6b7280'
                }}
              >
                <FaHeart />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {product.name}
              </h3>

              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
                {product.description?.substring(0, 100)}...
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>
                  {product.currency || 'NGN'} {product.price?.toLocaleString()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaStar style={{ color: '#fbbf24' }} />
                  <span style={{ fontSize: 14, color: '#6b7280' }}>
                    {product.rating || '4.5'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => getCartQuantity(product.id.toString()) > 0 
                    ? removeFromCart(product.id.toString()) 
                    : addToCart(product.id.toString())
                  }
                  style={{
                    flex: 1,
                    background: getCartQuantity(product.id.toString()) > 0 ? '#dc2626' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <FaShoppingCart />
                  {getCartQuantity(product.id.toString()) > 0 ? `Remove (${getCartQuantity(product.id.toString())})` : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => router.push(`/dashboard/buyer/products/${product.id}`)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: '#6b7280' }}>
          <FaSearch style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No products found</h3>
          <p>This producer doesn't have any products matching your search</p>
        </div>
      )}
    </div>
  );
}
