"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiService, Product } from "@/services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    priceUnit: '',
    certification: '',
    country: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 12
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await apiService.getProducts(params);
      setProducts(Array.isArray(response.products) ? response.products : []);
      setTotalPages(response.pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await apiService.getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setCategories([]);
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  // Extract unique filter options from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const priceUnits = Array.from(new Set(products.map(p => p.price_unit).filter(Boolean)));
  const certifications = Array.from(new Set(products.flatMap(p => p.certifications).filter(Boolean)));
  const countries = Array.from(new Set(products.map(p => p.producer?.country).filter(Boolean)));

  // Filtering logic
  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.priceUnit && product.price_unit !== filters.priceUnit) return false;
    if (filters.certification && !product.certifications.includes(filters.certification)) return false;
    if (filters.country && product.producer?.country !== filters.country) return false;
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
    return true;
  });

  if (loading && products.length === 0) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      {/* Filter Sidebar */}
      <aside style={{
        minWidth: 260,
        maxWidth: 320,
        background: '#f8fafbff',
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        display: showFilters ? 'block' : 'none',
        position: 'sticky',
        top: 24,
        height: 'fit-content',
        zIndex: 10
      }}>
        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 18 }}>Filter Products</h4>
        <div style={{ marginBottom: 18 }}>
          <label>Category</label>
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
            <option value=''>All</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Price Range</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input type='number' placeholder='Min' value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} style={{ width: '50%' }} />
            <input type='number' placeholder='Max' value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} style={{ width: '50%' }} />
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Price Unit</label>
          <select value={filters.priceUnit} onChange={e => setFilters(f => ({ ...f, priceUnit: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
            <option value=''>All</option>
            {priceUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Certification</label>
          <select value={filters.certification} onChange={e => setFilters(f => ({ ...f, certification: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
            <option value=''>All</option>
            {certifications.map(cert => <option key={cert} value={cert}>{cert}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>Country</label>
          <select value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
            <option value=''>All</option>
            {countries.map(country => <option key={country} value={country}>{country}</option>)}
          </select>
        </div>
        <button onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', priceUnit: '', certification: '', country: '' })} style={{ width: '100%', marginTop: 8, background: '#e5e7eb', border: 'none', borderRadius: 8, padding: '0.5rem 0', fontWeight: 600 }}>Clear Filters</button>
      </aside>
      {/* Toggle filter button for mobile */}
      <button onClick={() => setShowFilters(f => !f)} style={{ display: 'block', margin: '1rem 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, position: 'fixed', top: 80, left: 12, zIndex: 20 }}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      {/* Products Grid */}
      <div style={{ flex: 1 }}>
        {filteredProducts.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
              No products found
            </h3>
            <p style={{ color: '#6b7280' }}>
              Try adjusting your search terms or browse all categories
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ 
                background: '#fff', 
                borderRadius: 14, 
                overflow: 'hidden', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 420
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
              }}
              >
                <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div style={{ position: 'relative', width: '100%', height: 200, background: '#f3f4f6' }}>
                    <img 
                      src={product.main_image_url || product.images[0] || '/placeholder-product.jpg'} 
                      alt={product.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderTopLeftRadius: 14,
                        borderTopRightRadius: 14
                      }}
                    />
                    {/* Certifications badge */}
                    {product.certifications.length > 0 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '0.75rem', 
                        left: '0.75rem', 
                        background: '#10b981', 
                        color: '#fff', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 12, 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        {product.certifications[0]}
                      </div>
                    )}
                    {/* Country badge */}
                    {product.producer?.country && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '0.75rem', 
                        right: '0.75rem', 
                        background: '#2563eb', 
                        color: '#fff', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 12, 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}>
                        {product.producer.country}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      marginBottom: '0.5rem', 
                      color: '#1f2937',
                      lineHeight: 1.3
                    }}>
                      {product.name}
                    </h3>
                    
                    <p style={{ 
                      color: '#6b7280', 
                      marginBottom: '1rem', 
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0070f3', display: 'flex', alignItems: 'center', gap: 4 }}>
                        ₦{product.price.toLocaleString()} <span style={{ fontSize: '1rem', color: '#374151', fontWeight: 500 }}>/ {product.price_unit || 'unit'}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                        Qty: {product.quantity}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                        {product.producer?.company_name || 'Seller'}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
                        {product.tags && product.tags.length > 0 && (
                          <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.85rem', fontWeight: 500 }}>
                            {product.tags.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 