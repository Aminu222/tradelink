"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaSave, FaTrash, FaUpload, FaTimes } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    price_unit: "",
    quantity: "",
    category: "",
    product_status: "active"
  });

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
      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price || "",
        price_unit: data.price_unit || "",
        quantity: data.quantity || "",
        category: data.category || "",
        product_status: data.product_status || "active"
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');
      
      alert('Product updated successfully!');
      router.push(`/dashboard/admin/products/${productId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;
  if (!product) return <div style={{ padding: 32 }}>Product not found</div>;

  return (
    <div style={{ 
      padding: isMobile ? "1rem" : "2rem", 
      maxWidth: 800, 
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: isMobile ? "1.5rem" : "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem"
      }}>
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
            Edit Product
          </h1>
          <p style={{ 
            color: "#6b7280", 
            fontSize: isMobile ? "0.875rem" : "1rem"
          }}>
            Update product information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ 
        background: "#fff", 
        padding: isMobile ? "1rem" : "1.5rem", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
          gap: isMobile ? "1rem" : "1.5rem" 
        }}>
          {/* Product Name */}
          <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Price (₦) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Price Unit */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Price Unit
            </label>
            <input
              type="text"
              name="price_unit"
              value={formData.price_unit}
              onChange={handleInputChange}
              placeholder="e.g., per kg, per piece"
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Quantity */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Quantity in Stock *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="0"
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Product Status */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Product Status
            </label>
            <select
              name="product_status"
              value={formData.product_status}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                background: "#fff",
                minHeight: isMobile ? "44px" : "auto"
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 500, 
              color: "#374151",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem" : "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                resize: "vertical",
                minHeight: "100px"
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginTop: "2rem",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "flex-end"
        }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: isMobile ? "0.875rem 1.5rem" : "0.75rem 1.5rem",
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer",
              fontSize: isMobile ? "1rem" : "0.875rem",
              minHeight: isMobile ? "44px" : "auto"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: isMobile ? "0.875rem 1.5rem" : "0.75rem 1.5rem",
              background: saving ? "#9ca3af" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: isMobile ? "1rem" : "0.875rem",
              minHeight: isMobile ? "44px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <FaSave style={{ fontSize: "0.875rem" }} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}


