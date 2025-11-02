"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { apiService } from "@/services/api";
import { FaUser, FaShoppingCart, FaHeart, FaSearch, FaBars, FaFilter, FaBox } from "react-icons/fa";

export default function BuyerNavbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [producers, setProducers] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProducer, setSelectedProducer] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          
          // Load cart and wishlist counts from API
          try {
            const cartData = await apiService.getCart();
            setCartItems(cartData.length || 0);
          } catch (error) {
            console.error("Error loading cart count:", error);
            setCartItems(0);
          }
          
          try {
            const wishlistData = await apiService.getWishlist();
            setWishlistItems(wishlistData.length || 0);
          } catch (error) {
            console.error("Error loading wishlist count:", error);
            setWishlistItems(0);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      }
    };
    
    loadUserData();
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (selectedCategory !== "All") {
      params.append('category', selectedCategory);
    }
    if (selectedProducer !== "All") {
      params.append('producer', selectedProducer);
    }
    if (sortBy !== "name") {
      params.append('sort', sortBy);
    }
    if (priceRange[0] > 0) {
      params.append('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < maxPrice) {
      params.append('maxPrice', priceRange[1].toString());
    }
    
    const queryString = params.toString();
    router.push(`/dashboard/buyer/products${queryString ? `?${queryString}` : ''}`);
  };

  const loadProducers = async () => {
    try {
      const productsData = await apiService.getProducts();
      const producerNames = new Set<string>();
      productsData.forEach((product: any) => {
        if (product.producer?.company_name) {
          producerNames.add(product.producer.company_name);
        } else if (product.producer_company) {
          producerNames.add(product.producer_company);
        }
      });
      setProducers(["All", ...Array.from(producerNames)]);
    } catch (error) {
      console.error("Error loading producers:", error);
    }
  };

  useEffect(() => {
    loadProducers();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(["All", ...categoriesData]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Bar */}
      <div style={{ background: '#f8fafc', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Welcome to Bis-Connect - Your B2B Marketplace
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <Link href="/dashboard/buyer/orders" style={{ color: '#6b7280', textDecoration: 'none' }}>My Orders</Link>
            <Link href="/dashboard/buyer/messages" style={{ color: '#6b7280', textDecoration: 'none' }}>Messages</Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#6b7280', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FaUser style={{ fontSize: '12px' }} />
                {user?.first_name || 'Account'}
              </button>
              {showDropdown && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  background: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                  padding: '8px 0',
                  minWidth: 180,
                  zIndex: 1000,
                  marginTop: '4px'
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                      {user?.first_name || 'User'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{user?.email}</div>
                  </div>
                  <Link href="/dashboard/buyer/account" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#374151', fontSize: '14px' }}>
                    Account Settings
                  </Link>
                  <Link href="/dashboard/buyer/wishlist" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#374151', fontSize: '14px' }}>
                    Wishlist ({wishlistItems})
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      padding: '8px 16px', 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626', 
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/dashboard/buyer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0070f3', margin: 0 }}>Bis-Connect</h1>
        </Link>

        {/* Right Side - Cart & Wishlist */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Cart */}
          <Link href="/dashboard/buyer/cart" style={{ 
            textDecoration: 'none', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            position: 'relative'
          }}>
            <FaShoppingCart style={{ fontSize: '20px' }} />
            {cartItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {cartItems > 9 ? '9+' : cartItems}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link href="/dashboard/buyer/wishlist" style={{ 
            textDecoration: 'none', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            position: 'relative'
          }}>
            <FaHeart style={{ fontSize: '20px' }} />
            {wishlistItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {wishlistItems > 9 ? '9+' : wishlistItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category Navigation */}
      <div style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '24px', overflowX: 'auto' }}>
          <Link href="/dashboard/buyer" style={{ 
            textDecoration: 'none', 
            color: pathname === '/dashboard/buyer' ? '#0070f3' : '#374151',
            fontWeight: pathname === '/dashboard/buyer' ? 600 : 500,
            padding: '12px 0',
            borderBottom: pathname === '/dashboard/buyer' ? '2px solid #0070f3' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}>
            All Products
          </Link>
          <Link href="/dashboard/buyer/products" style={{ 
            textDecoration: 'none', 
            color: pathname.startsWith('/dashboard/buyer/products') ? '#0070f3' : '#374151',
            fontWeight: pathname.startsWith('/dashboard/buyer/products') ? 600 : 500,
            padding: '12px 0',
            borderBottom: pathname.startsWith('/dashboard/buyer/products') ? '2px solid #0070f3' : '2px solid transparent',
            whiteSpace: 'nowrap'
          }}>
            Browse Products
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '16px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              {/* Sort */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}>Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    background: '#fff'
                  }}
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    background: '#fff'
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Producer */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}>Producer</label>
                <select
                  value={selectedProducer}
                  onChange={(e) => setSelectedProducer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    background: '#fff'
                  }}
                >
                  {producers.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}>Price Range (₦)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                  <span style={{ alignSelf: 'center', color: '#6b7280' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    max={maxPrice}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              {/* Apply Filters Button */}
              <div>
                <button
                  type="button"
                  onClick={handleSearch}
                  style={{
                    width: '100%',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
} 