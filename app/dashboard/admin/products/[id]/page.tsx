"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaUser, FaCalendar, FaTag, FaMoneyBillWave, FaWarehouse, FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function AdminProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch product details');
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/products/${productId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }
      
      router.push('/dashboard/admin/products');
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const formatPriceDisplay = (price: string) => {
    return parseFloat(price).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
  if (!product) return <div style={{ padding: 32 }}>Product not found</div>;

  const images = product.images || [];
  const hasImages = images.length > 0 || product.main_image_url;

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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "0.5rem",
              background: "#f3f4f6",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FaArrowLeft style={{ fontSize: "1rem", color: "#374151" }} />
          </button>
          <div>
            <h1 style={{ 
              fontSize: isMobile ? "1.5rem" : "2rem", 
              fontWeight: 700, 
              color: "#1f2937", 
              marginBottom: "0.25rem"
            }}>
              Product Details
            </h1>
            <p style={{ 
              color: "#6b7280", 
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              {product.name}
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "0.5rem",
          flexDirection: isMobile ? "column" : "row"
        }}>
          <button
            onClick={handleEdit}
            style={{
              padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}
          >
            <FaEdit style={{ fontSize: "0.875rem" }} />
            {isMobile ? "Edit" : "Edit Product"}
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}
          >
            <FaTrash style={{ fontSize: "0.875rem" }} />
            {isMobile ? "Delete" : "Delete Product"}
          </button>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
        gap: isMobile ? "1.5rem" : "2rem" 
      }}>
        {/* Product Images */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden"
        }}>
          <div style={{ 
            height: isMobile ? "300px" : "400px", 
            background: "#f3f4f6", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative"
          }}>
            {hasImages ? (
              <>
                <img
                  src={(() => {
                    const imageUrl = images[currentImageIndex] || product.main_image_url;
                    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                      return imageUrl;
                    }
                    if (imageUrl.startsWith('/')) {
                      return `http://localhost:5000${imageUrl}`;
                    }
                    return `http://localhost:5000/uploads/${imageUrl}`;
                  })()}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                {images.length > 1 && (
                  <div style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "0.5rem"
                  }}>
                    {images.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          border: "none",
                          background: currentImageIndex === index ? "#3b82f6" : "#d1d5db",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                color: "#9ca3af"
              }}>
                <FaBox style={{ fontSize: "4rem", marginBottom: "1rem" }} />
                <span style={{ fontSize: "1.125rem" }}>No Images Available</span>
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div style={{ 
              padding: "1rem", 
              display: "flex", 
              gap: "0.5rem", 
              overflowX: "auto" 
            }}>
              {images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    minWidth: "60px",
                    height: "60px",
                    border: currentImageIndex === index ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#f3f4f6"
                  }}
                >
                  <img
                    src={(() => {
                      if (image.startsWith('http://') || image.startsWith('https://')) {
                        return image;
                      }
                      if (image.startsWith('/')) {
                        return `http://localhost:5000${image}`;
                      }
                      return `http://localhost:5000/uploads/${image}`;
                    })()}
                    alt={`${product.name} - Image ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.5rem" 
        }}>
          {/* Basic Info */}
          <div style={{ 
            background: "#fff", 
            padding: isMobile ? "1rem" : "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <h2 style={{ 
              fontSize: isMobile ? "1.25rem" : "1.5rem", 
              fontWeight: 700, 
              color: "#1f2937", 
              marginBottom: "1rem"
            }}>
              {product.name}
            </h2>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              marginBottom: "0.75rem" 
            }}>
              <div style={{ 
                padding: "0.25rem 0.75rem", 
                borderRadius: 12, 
                fontSize: "0.75rem",
                fontWeight: 500,
                ...getStatusColor(product.product_status || 'active')
              }}>
                {product.product_status ? (product.product_status.charAt(0).toUpperCase() + product.product_status.slice(1)) : 'Active'}
              </div>
            </div>

            <p style={{ 
              color: "#6b7280", 
              lineHeight: 1.6, 
              marginBottom: "1rem",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              {product.description || "No description available"}
            </p>

            <div style={{ 
              fontSize: isMobile ? "1.25rem" : "1.5rem", 
              fontWeight: 700, 
              color: "#10b981",
              marginBottom: "1rem"
            }}>
              ₦ {formatPriceDisplay(product.price.toString())} {product.price_unit ? `/ ${product.price_unit}` : ''}
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
              gap: "1rem" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaTag style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                <span style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#374151" }}>
                  {product.category}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaWarehouse style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                <span style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#374151" }}>
                  {product.quantity || 0} units in stock
                </span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div style={{ 
            background: "#fff", 
            padding: isMobile ? "1rem" : "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "1rem"
            }}>
              <h3 style={{ 
                fontSize: isMobile ? "1.125rem" : "1.25rem", 
                fontWeight: 600, 
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <FaUser style={{ color: "#6b7280" }} />
                Seller Information
              </h3>
              {product.producer_id && (
                <button
                  onClick={() => router.push(`/dashboard/admin/users?user_id=${product.producer_id}`)}
                  style={{
                    padding: isMobile ? "0.5rem 0.75rem" : "0.5rem 1rem",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <FaUser style={{ fontSize: "0.75rem" }} />
                  {isMobile ? "View" : "View Profile"}
                </button>
              )}
            </div>
            
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.75rem" 
            }}>
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Company Name:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151",
                  fontWeight: 500
                }}>
                  {product.producer_company || product.producer_username || 'Not specified'}
                </div>
              </div>
              
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Username:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151"
                }}>
                  {product.producer_username || 'Not specified'}
                </div>
              </div>

              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Email:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151"
                }}>
                  {product.producer_email || 'Not specified'}
                </div>
              </div>

              {product.producer_id && (
                <div>
                  <span style={{ 
                    fontSize: isMobile ? "0.75rem" : "0.875rem", 
                    color: "#6b7280", 
                    fontWeight: 500 
                  }}>
                    Seller ID:
                  </span>
                  <div style={{ 
                    fontSize: isMobile ? "0.875rem" : "1rem", 
                    color: "#374151",
                    fontFamily: "monospace"
                  }}>
                    {product.producer_id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Metadata */}
          <div style={{ 
            background: "#fff", 
            padding: isMobile ? "1rem" : "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{ 
              fontSize: isMobile ? "1.125rem" : "1.25rem", 
              fontWeight: 600, 
              color: "#1f2937", 
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FaBox style={{ color: "#6b7280" }} />
              Product Details
            </h3>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
              gap: "1rem" 
            }}>
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Product ID:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151",
                  fontFamily: "monospace"
                }}>
                  {product.id}
                </div>
              </div>
              
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Created:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151"
                }}>
                  {formatDate(product.created_at)}
                </div>
              </div>
              
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Last Updated:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151"
                }}>
                  {product.updated_at ? formatDate(product.updated_at) : 'Not updated'}
                </div>
              </div>
              
              <div>
                <span style={{ 
                  fontSize: isMobile ? "0.75rem" : "0.875rem", 
                  color: "#6b7280", 
                  fontWeight: 500 
                }}>
                  Images:
                </span>
                <div style={{ 
                  fontSize: isMobile ? "0.875rem" : "1rem", 
                  color: "#374151"
                }}>
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
