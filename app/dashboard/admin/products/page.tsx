"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaFilter, FaBox, FaEye, FaEdit, FaTrash, FaDownload } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.producer_company && product.producer_company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.producer_username && product.producer_username.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Producer,Category,Price,Price Unit,Description,Created At\n" +
      filteredProducts.map(p => `${p.id},${p.name},${p.producer_company || p.producer_username},${p.category},${p.price},${p.price_unit},${p.description || ''},${p.created_at}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategories = () => {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  };

  const formatPriceDisplay = (price: string) => {
    return parseFloat(price).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { background: '#d1fae5', color: '#065f46' };
      case 'inactive':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ 
      padding: isMobile ? "1rem" : "2rem", 
      maxWidth: 1200, 
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: isMobile ? "1.5rem" : "2rem", 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "1rem" : "0",
        justifyContent: isMobile ? "flex-start" : "space-between",
        alignItems: isMobile ? "stretch" : "center"
      }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? "1.5rem" : "2rem", 
            fontWeight: 700, 
            color: "#1f2937", 
            marginBottom: "0.5rem"
          }}>
            Product Management
          </h1>
          <p style={{ 
            color: "#6b7280", 
            fontSize: isMobile ? "0.875rem" : "1rem"
          }}>
            Manage all products across the platform
          </p>
        </div>
        <button
          onClick={handleProductExport}
          style={{
            padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: isMobile ? "0.875rem" : "1rem",
            minHeight: "44px"
          }}
        >
          <FaDownload style={{ fontSize: "0.875rem" }} />
          {isMobile ? "Export" : "Export CSV"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: isMobile ? "0.75rem" : "1rem", 
        marginBottom: isMobile ? "1.5rem" : "2rem" 
      }}>
        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaBox style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {products.length}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Total Products</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaBox style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#10b981" }} />
            <div>
              <div style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {products.filter(p => p.product_status === 'active').length}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Active Products</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaBox style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#f59e0b" }} />
            <div>
              <div style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {new Set(products.map(p => p.producer_id)).size}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Active Sellers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        background: "#fff", 
        padding: isMobile ? "1rem" : "1.5rem", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        marginBottom: isMobile ? "1.5rem" : "2rem",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "0.75rem" : "1rem", 
          flexWrap: "wrap", 
          alignItems: isMobile ? "stretch" : "center" 
        }}>
          {/* Search */}
          <div style={{ 
            position: "relative", 
            flex: isMobile ? "none" : 1, 
            minWidth: isMobile ? "auto" : "250px" 
          }}>
            <FaSearch style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#9ca3af",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem 0.875rem 0.875rem 2.25rem" : "0.75rem 0.75rem 0.75rem 2.5rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: isMobile ? "0.875rem" : "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: isMobile ? "1rem" : "0.875rem",
              background: "#fff",
              minHeight: isMobile ? "44px" : "auto"
            }}
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", 
        gap: isMobile ? "0.75rem" : "1rem" 
      }}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={{ 
            background: "#fff", 
            borderRadius: 6, 
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            overflow: "hidden"
          }}>
            {/* Product Image */}
            <div style={{ 
              height: isMobile ? "140px" : "160px", 
              background: "#f3f4f6", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative"
            }}>
              {(product.images && product.images.length > 0 && product.images[0]) || product.main_image_url ? (
                <>
                  <img
                    src={(() => {
                      const imageUrl = product.images?.[0] || product.main_image_url;
                      // If it's already a full URL, use it as is
                      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                        return imageUrl;
                      }
                      // If it's a relative path, construct the full URL
                      if (imageUrl.startsWith('/')) {
                        return `http://localhost:5000${imageUrl}`;
                      }
                      // If it's just a filename, construct the full URL
                      return `http://localhost:5000/uploads/${imageUrl}`;
                    })()}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 0.875rem;">Image not available</div>';
                        parent.appendChild(placeholder.firstChild!);
                      }
                    }}
                  />
                  {product.images && product.images.length > 1 && (
                    <div style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }}>
                      +{product.images.length - 1}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem"
                }}>
                  <FaBox style={{ fontSize: "3rem", marginBottom: "0.5rem" }} />
                  <span>No Image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div style={{ padding: isMobile ? "0.75rem" : "1rem" }}>
              <div style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                <div style={{ 
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: isMobile ? "flex-start" : "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-start",
                  marginBottom: "0.25rem",
                  gap: isMobile ? "0.25rem" : "0"
                }}>
                  <h3 style={{ 
                    fontSize: isMobile ? "0.9rem" : "1rem", 
                    fontWeight: 600, 
                    color: "#1f2937",
                    lineHeight: 1.3,
                    margin: 0
                  }}>
                    {product.name}
                  </h3>
                  <div style={{ 
                    padding: "0.2rem 0.5rem", 
                    borderRadius: 12, 
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    display: "inline-block",
                    alignSelf: isMobile ? "flex-start" : "flex-start",
                    ...getStatusColor(product.product_status || 'active')
                  }}>
                    {product.product_status ? (product.product_status.charAt(0).toUpperCase() + product.product_status.slice(1)) : 'Active'}
                  </div>
                </div>
                <p style={{ 
                  fontSize: isMobile ? "0.7rem" : "0.8rem", 
                  color: "#6b7280", 
                  marginBottom: "0.25rem",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {product.description}
                </p>
                <div style={{ 
                  display: "inline-block",
                  padding: "0.2rem 0.5rem",
                  background: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: 12,
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  marginBottom: "0.25rem"
                }}>
                  {product.category}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "0.65rem" : "0.7rem", 
                  color: "#6b7280",
                  marginBottom: "0.25rem"
                }}>
                  Seller: {product.producer_company || product.producer_username || 'Unknown'}
                </div>
              </div>

              {/* Price and Stock */}
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "flex-start" : "space-between", 
                alignItems: isMobile ? "flex-start" : "center",
                marginBottom: isMobile ? "0.5rem" : "0.75rem",
                gap: isMobile ? "0.25rem" : "0"
              }}>
                <div style={{ 
                  fontSize: isMobile ? "1rem" : "1.125rem", 
                  fontWeight: 700, 
                  color: "#10b981" 
                }}>
                  ₦ {formatPriceDisplay(product.price.toString())} {product.price_unit ? `/ ${product.price_unit}` : ''}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "0.7rem" : "0.8rem", 
                  color: "#6b7280" 
                }}>
                  Stock: {product.quantity || 0} units
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "0.25rem" : "0.25rem" 
              }}>
                <button
                  onClick={() => router.push(`/dashboard/admin/products/${product.id}`)}
                  style={{
                    flex: isMobile ? "none" : 1,
                    padding: isMobile ? "0.5rem" : "0.4rem",
                    background: "#dbeafe",
                    color: "#1e40af",
                    border: "none",
                    borderRadius: 4,
                    fontSize: isMobile ? "0.75rem" : "0.75rem",
                    cursor: "pointer",
                    minHeight: isMobile ? "36px" : "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isMobile ? "0.25rem" : "0"
                  }}
                  title="View Product Details"
                >
                  <FaEye style={{ fontSize: isMobile ? "0.75rem" : "0.65rem" }} />
                  {isMobile && "View"}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/admin/products/${product.id}/edit`)}
                  style={{
                    flex: isMobile ? "none" : 1,
                    padding: isMobile ? "0.5rem" : "0.4rem",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 4,
                    fontSize: isMobile ? "0.75rem" : "0.75rem",
                    cursor: "pointer",
                    minHeight: isMobile ? "36px" : "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isMobile ? "0.25rem" : "0"
                  }}
                  title="Edit Product"
                >
                  <FaEdit style={{ fontSize: isMobile ? "0.75rem" : "0.65rem" }} />
                  {isMobile && "Edit"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: isMobile ? "2rem 1rem" : "4rem 2rem",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <FaBox style={{ fontSize: "3rem", color: "#9ca3af", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: isMobile ? "1.125rem" : "1.25rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
            No products found
          </h3>
          <p style={{ color: "#6b7280", fontSize: isMobile ? "0.875rem" : "1rem" }}>
            {searchTerm || categoryFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No products have been added to the platform yet"}
          </p>
        </div>
      )}
    </div>
  );
} 