"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FaSearch, FaFilter, FaHeart, FaShoppingCart, FaStar, FaMapMarkerAlt, 
  FaIndustry, FaTh, FaList, FaSort, FaEye, FaEyeSlash, FaTruck,
  FaShieldAlt, FaClock, FaCheckCircle, FaTimes, FaBars, FaUser, FaTimes as FaClose,
  FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown
} from "react-icons/fa";
import { apiService } from "@/services/api";

function Spinner() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ 
        width: 40, 
        height: 40, 
        border: '4px solid #f3f4f6', 
        borderTop: '4px solid #0070f3', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading amazing products...</p>
    </div>
  );
}

export default function BuyerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProducer, setSelectedProducer] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState("name");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const [categories, setCategories] = useState<string[]>(["All"]);
  const [producers, setProducers] = useState<string[]>(["All"]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Advanced E-commerce Features
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await fetchProducts();
      await loadUserData();
      await loadCategories();
    };
    initializeData();
  }, []);

  useEffect(() => {
    // Handle URL parameters for advanced search
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    const producerParam = urlParams.get('producer');
    const sortParam = urlParams.get('sort');
    const minPriceParam = urlParams.get('minPrice');
    const maxPriceParam = urlParams.get('maxPrice');

    if (searchParam) setSearch(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (producerParam) setSelectedProducer(producerParam);
    if (sortParam) setSortBy(sortParam);
    if (minPriceParam) setPriceRange([parseInt(minPriceParam), priceRange[1]]);
    if (maxPriceParam) setPriceRange([priceRange[0], parseInt(maxPriceParam)]);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadProducers();
    }
  }, [products]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, search, selectedCategory, selectedProducer, priceRange, sortBy]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-dropdown]')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const loadUserData = async () => {
    try {
      // Load wishlist from API
      const wishlistData = await apiService.getWishlist();
      const wishlistIds = wishlistData.map((item: any) => item.product.id.toString());
      setWishlist(wishlistIds);
      localStorage.setItem("buyerWishlist", JSON.stringify(wishlistIds));
      setWishlistItems(wishlistData.length || 0);
      
      // Load cart from API
      const cartData = await apiService.getCart();
      setCartItems(cartData.length || 0);
      
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
      setWishlistItems(storedWishlist.length || 0);
      setCartItems(Object.keys(storedCart).length || 0);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(["All", ...categoriesData]);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducers = async () => {
    try {
      // Extract unique producer names from products
      const producerNames = new Set<string>();
      products.forEach(product => {
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      console.log('Fetched products:', data); // Debug log
      
      // Debug: Log image information for each product
      data.forEach((product: any, index: number) => {
        console.log(`Product ${index + 1} (${product.name}):`, {
          id: product.id,
          main_image_url: product.main_image_url,
          images: product.images,
          hasImages: product.images && product.images.length > 0,
          firstImage: product.images?.[0]
        });
      });
      
      setProducts(data);
      setFilteredProducts(data);
      
      // Calculate max price for price range
      if (data && data.length > 0) {
        const maxProductPrice = Math.max(...data.map((p: any) => p.price || 0));
        setMaxPrice(maxProductPrice);
        setPriceRange([0, maxProductPrice]);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err); // Debug log
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const performLiveSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const filtered = products.filter((product: any) => {
        const searchTerm = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.category && product.category.toLowerCase().includes(searchTerm)) ||
          (product.producer_company && product.producer_company.toLowerCase().includes(searchTerm)) ||
          (product.producer_username && product.producer_username.toLowerCase().includes(searchTerm)) ||
          (product.origin && product.origin.toLowerCase().includes(searchTerm)) ||
          (product.specifications && product.specifications.toLowerCase().includes(searchTerm))
        );
      }).slice(0, 5); // Limit to 5 results for dropdown
      
      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error performing live search:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      performLiveSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSearchResultClick = (product: any) => {
    // Navigate to product detail page
    window.location.href = `/dashboard/buyer/products/${product.id}`;
    setShowSearchResults(false);
    setSearch("");
  };

  const filterAndSortProducts = () => {
    console.log('Filtering products:', { products: products.length, search, selectedCategory, selectedProducer, priceRange }); // Debug log
    let filtered = products.filter(product => {
      const matchesSearch = search === "" || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(search.toLowerCase())) ||
        (product.producer_company && product.producer_company.toLowerCase().includes(search.toLowerCase())) ||
        (product.producer_username && product.producer_username.toLowerCase().includes(search.toLowerCase())) ||
        (product.origin && product.origin.toLowerCase().includes(search.toLowerCase())) ||
        (product.specifications && product.specifications.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || (product.category && product.category === selectedCategory);
      const matchesProducer = selectedProducer === "All" || 
                             (product.producer?.company_name && product.producer.company_name === selectedProducer) ||
                             (product.producer_company && product.producer_company === selectedProducer);
      const matchesPrice = (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1];
      
      const matches = matchesSearch && matchesCategory && matchesProducer && matchesPrice;
      if (!matches) {
        console.log('Product filtered out:', product.name, { matchesSearch, matchesCategory, matchesProducer, matchesPrice }); // Debug log
      }
      return matches;
    });

    console.log('Filtered products count:', filtered.length); // Debug log

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "popularity":
          return (b.orders_count || 0) - (a.orders_count || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
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
      
      // Show success message (you can add a toast notification here)
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error message (you can add a toast notification here)
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

  if (loading) return <Spinner />;
  if (error) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <FaTimes style={{ fontSize: 48, color: '#ef4444' }} />
      <h3 style={{ color: '#ef4444', fontSize: '18px', margin: 0 }}>Error Loading Products</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{error}</p>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Discover Amazing Products
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Connect with trusted Nigerian sellers and find unique products from around the world
          </p>
          
          {/* Enhanced Search Bar with Cart & Wishlist */}
          <div style={{ 
            maxWidth: '1000px', 
            margin: '0 auto',
            position: 'relative'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Bis-Connect Logo */}
              <Link href="/" style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                textDecoration: 'none'
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 800, 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Bis-Connect
                </h1>
              </Link>

              {/* Search Bar */}
              <div style={{ 
                display: 'flex', 
                background: 'white', 
                borderRadius: '50px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                flex: 1,
                maxWidth: '600px'
              }}>
                <div style={{ 
                  position: 'relative', 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: '20px', 
                    color: '#9ca3af',
                    fontSize: '18px'
                  }} />
            <input
              type="text"
                    placeholder="Search for products, sellers, or categories..."
              value={search}
                    onChange={handleSearchInputChange}
                    onFocus={() => search.trim().length >= 2 && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              style={{
                width: '100%',
                      padding: '16px 20px 16px 50px',
                      border: 'none',
                      fontSize: '16px',
                      outline: 'none',
                      background: 'transparent',
                      color: '#374151'
              }}
            />
          </div>
                <button
                  onClick={() => filterAndSortProducts()}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0070f3'}
                >
                  Search
                </button>
              </div>

              {/* Profile, Cart & Wishlist Icons */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }} data-profile-dropdown>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    <FaUser style={{ fontSize: '20px' }} />
                    <FaCaretDown style={{ fontSize: '12px', marginLeft: '4px' }} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <Link href="/dashboard/buyer/account" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaUser style={{ fontSize: '16px', color: '#3b82f6' }} />
                        My Account
                      </Link>
                      
                      <Link href="/dashboard/buyer/orders" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaClipboardList style={{ fontSize: '16px', color: '#f59e0b' }} />
                        Orders
                      </Link>
                      
                      <Link href="/dashboard/buyer/messages" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaEnvelope style={{ fontSize: '16px', color: '#8b5cf6' }} />
                        Message Center
                      </Link>
                      
                      <Link href="/dashboard/buyer/wishlist" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaHeart style={{ fontSize: '16px', color: '#ef4444' }} />
                        Wishlist
                      </Link>
                      
                      <div style={{
                        height: '1px',
                        background: '#e5e7eb',
                        margin: '4px 0'
                      }} />
                      
                      <Link href="/auth/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaSignInAlt style={{ fontSize: '16px', color: '#10b981' }} />
                        Switch Account
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link href="/dashboard/buyer/cart" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaShoppingCart style={{ fontSize: '20px' }} />
                  {cartItems > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      border: '2px solid white'
                    }}>
                      {cartItems > 9 ? '9+' : cartItems}
                    </span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link href="/dashboard/buyer/wishlist" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaHeart style={{ fontSize: '20px' }} />
                  {wishlistItems > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      border: '2px solid white'
                    }}>
                      {wishlistItems > 9 ? '9+' : wishlistItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            
            {/* Live Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                zIndex: 1000,
                marginTop: '8px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSearchResultClick(product)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {(product.images && product.images[0]) || product.main_image_url ? (
                        <img
                          src={`http://localhost:5000${product.images?.[0] || product.main_image_url}`}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaIndustry style={{ fontSize: '20px', color: '#9ca3af' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#374151', fontSize: '16px', marginBottom: '4px' }}>
                        {product.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        {product.category} • ₦{product.price?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
      
        {/* Advanced Toolbar */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Left Side - Results & View Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  {filteredProducts.length} of {products.length} products
                </span>
                {filteredProducts.length !== products.length && (
                  <span style={{ 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 500 
                  }}>
                    Filtered
                  </span>
                )}
              </div>
              
              {/* View Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? '#0070f3' : '#f3f4f6',
                    color: viewMode === 'grid' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaTh style={{ fontSize: '14px' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? '#0070f3' : '#f3f4f6',
                    color: viewMode === 'list' ? 'white' : '#6b7280',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaList style={{ fontSize: '14px' }} />
                </button>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Compare Products */}
              {compareList.length > 0 && (
                <button
                  onClick={() => setShowCompare(true)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaEye style={{ fontSize: '12px' }} />
                  Compare ({compareList.length})
                </button>
              )}

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: showFilters ? '#0070f3' : '#f3f4f6',
                  color: showFilters ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <FaFilter style={{ fontSize: '14px' }} />
                Filters
              </button>

              {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
                  padding: '10px 16px',
              border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  minWidth: '140px'
            }}
          >
            <option value="name">Sort by Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
            </div>
        </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {/* Category Filter */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Category
                  </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                      padding: '10px 12px',
                border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
              ))}
            </select>
          </div>

                {/* Producer Filter */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Seller
                  </label>
            <select
              value={selectedProducer}
              onChange={(e) => setSelectedProducer(e.target.value)}
              style={{
                width: '100%',
                      padding: '10px 12px',
                border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    {producers.map(producer => (
                      <option key={producer} value={producer}>
                        {producer}
                      </option>
              ))}
            </select>
          </div>

                {/* Price Range Filter */}
          <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Price Range (₦)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                style={{
                  flex: 1,
                        padding: '10px 12px',
                  border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                }}
              />
                    <span style={{ color: '#6b7280' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                style={{
                  flex: 1,
                        padding: '10px 12px',
                  border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                }}
              />
            </div>
          </div>

                {/* Clear Filters */}
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedProducer("All");
                      setPriceRange([0, maxPrice]);
                      setSearch("");
                    }}
                    style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Clear All Filters
                  </button>
        </div>
      </div>
            </div>
          )}
      </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          >
            {/* Product Image */}
            <div style={{ height: '200px', background: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
              {(product.images && product.images[0]) || product.main_image_url ? (
                <img
                  src={`http://localhost:5000${product.images?.[0] || product.main_image_url}`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to main_image_url if images[0] fails
                    if (product.images?.[0] && product.main_image_url && product.images[0] !== product.main_image_url) {
                      e.currentTarget.src = `http://localhost:5000${product.main_image_url}`;
                    } else {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div style={{ 
                display: (product.images && product.images[0]) || product.main_image_url ? 'none' : 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: '#9ca3af' 
              }}>
                <FaIndustry style={{ fontSize: 48 }} />
              </div>
              
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id.toString())}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: wishlist.includes(product.id.toString()) ? '#ec4899' : '#6b7280'
                }}
              >
                <FaHeart style={{ fontSize: 12 }} />
              </button>
            </div>

            {/* Product Info */}
            <div style={{ padding: '20px' }}>
              {/* Product Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  margin: 0, 
                  color: '#1f2937',
                  lineHeight: 1.3,
                  flex: 1,
                  marginRight: '12px'
                }}>
                {product.name}
              </h3>
              
                {/* Compare Checkbox */}
                <input
                  type="checkbox"
                  checked={compareList.includes(product.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCompareList([...compareList, product.id.toString()]);
                    } else {
                      setCompareList(compareList.filter(id => id !== product.id.toString()));
                    }
                  }}
                  style={{ margin: 0 }}
                />
              </div>
              
              {/* Seller Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaMapMarkerAlt style={{ color: '#6b7280', fontSize: '10px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  {product.producer_id ? (
                    <button
                      onClick={() => window.location.href = `/dashboard/buyer/producer/${product.producer_id}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0070f3',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        padding: 0,
                        fontFamily: 'inherit',
                        fontWeight: 600
                      }}
                      title="Click to view seller's store"
                    >
                      {product.producer_company || product.producer_username || `${product.producer_first_name || ''} ${product.producer_last_name || ''}`.trim() || 'Unknown Seller'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                      {product.producer_company || product.producer_username || `${product.producer_first_name || ''} ${product.producer_last_name || ''}`.trim() || 'Unknown Seller'}
                    </span>
                  )}
                </div>
                </div>

              {/* Category & Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  background: '#dbeafe', 
                  color: '#2563eb', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 600 
                }}>
                  {product.category}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStar style={{ color: '#fbbf24', fontSize: '12px' }} />
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    {product.rating || '4.5'}
                </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ 
                color: '#6b7280', 
                fontSize: '13px', 
                marginBottom: '16px', 
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.description?.substring(0, 80) || 'No description available'}...
              </p>

              {/* Price & Features */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937' }}>
                    ₦{product.price?.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    / {product.price_unit || 'unit'}
                  </span>
                </div>
                
                {/* Product Features */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaTruck style={{ fontSize: '10px' }} />
                    <span>Free Shipping</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaShieldAlt style={{ fontSize: '10px' }} />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => getCartQuantity(product.id.toString()) > 0 
                    ? removeFromCart(product.id.toString()) 
                    : addToCart(product.id.toString())
                  }
                  style={{
                    flex: 1,
                    background: getCartQuantity(product.id.toString()) > 0 ? '#dc2626' : '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (getCartQuantity(product.id.toString()) === 0) {
                      e.currentTarget.style.background = '#0056b3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getCartQuantity(product.id.toString()) === 0) {
                      e.currentTarget.style.background = '#0070f3';
                    }
                  }}
                >
                  <FaShoppingCart style={{ fontSize: '12px' }} />
                  {getCartQuantity(product.id.toString()) > 0 ? `Remove (${getCartQuantity(product.id.toString())})` : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => {
                    setQuickViewProduct(product);
                    setShowQuickView(true);
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  <FaEye style={{ fontSize: '12px' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
          </div>
        ) : (
          /* List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                {/* Product Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '8px',
                  background: '#f3f4f6',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {(product.images && product.images[0]) || product.main_image_url ? (
                    <img
                      src={`http://localhost:5000${product.images?.[0] || product.main_image_url}`}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#9ca3af'
                    }}>
                      <FaIndustry style={{ fontSize: '32px' }} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1f2937' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                    {product.description?.substring(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#2563eb', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: 600 
                    }}>
                      {product.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaStar style={{ color: '#fbbf24', fontSize: '12px' }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {product.rating || '4.5'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', color: '#6b7280' }}>
                      Seller: {product.producer_company || product.producer_username || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>
                      ₦{product.price?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '4px' }}>
                      / {product.price_unit || 'unit'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => getCartQuantity(product.id.toString()) > 0 
                        ? removeFromCart(product.id.toString()) 
                        : addToCart(product.id.toString())
                      }
                      style={{
                        background: getCartQuantity(product.id.toString()) > 0 ? '#dc2626' : '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {getCartQuantity(product.id.toString()) > 0 ? `Remove (${getCartQuantity(product.id.toString())})` : 'Add to Cart'}
                    </button>
                <button
                  onClick={() => window.location.href = `/dashboard/buyer/products/${product.id}`}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '10px 16px',
                    fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '14px'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        )}

        {/* Empty State */}
      {filteredProducts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            color: '#6b7280',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#374151' }}>
              No products found
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '24px' }}>
              Try adjusting your search criteria or filters to find what you're looking for
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedProducer("All");
                setPriceRange([0, maxPrice]);
                setSearch("");
              }}
              style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQuickView(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <FaClose />
            </button>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '12px',
                background: '#f3f4f6',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {(quickViewProduct.images && quickViewProduct.images[0]) || quickViewProduct.main_image_url ? (
                  <img
                    src={`http://localhost:5000${quickViewProduct.images?.[0] || quickViewProduct.main_image_url}`}
                    alt={quickViewProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#9ca3af'
                  }}>
                    <FaIndustry style={{ fontSize: '48px' }} />
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#1f2937' }}>
                  {quickViewProduct.name}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px', lineHeight: 1.5 }}>
                  {quickViewProduct.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: 600 
                  }}>
                    {quickViewProduct.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaStar style={{ color: '#fbbf24', fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>
                      {quickViewProduct.rating || '4.5'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '24px' }}>
                  ₦{quickViewProduct.price?.toLocaleString()} / {quickViewProduct.price_unit || 'unit'}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct.id.toString());
                      setShowQuickView(false);
                    }}
                    style={{
                      background: '#0070f3',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => window.location.href = `/dashboard/buyer/products/${quickViewProduct.id}`}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 