"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { FaArrowLeft, FaEdit, FaTrash, FaBox } from "react-icons/fa";

export default function ProducerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const products = await apiService.getProducerProducts();
      const foundProduct = products.find((p: any) => p.id.toString() === params.id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.deleteProduct(product.id);
      router.push("/dashboard/producer/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const toggleProductStatus = async () => {
    try {
      const newStatus = product.product_status === 'active' ? 'inactive' : 'active';
      await apiService.updateProduct(product.id, { product_status: newStatus });
      setProduct((prev: any) => ({ ...prev, product_status: newStatus }));
    } catch (error) {
      console.error("Error updating product status:", error);
      alert('Failed to update product status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { background: '#d1fae5', color: '#065f46' };
      case 'inactive':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const formatPriceDisplay = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    const parts = numericValue.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1] || '';
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${formattedWhole}.${decimalPart}` : formattedWhole;
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "#dc2626", marginBottom: "1rem" }}>
          {error || "Product not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/producer/products")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.push("/dashboard/producer/products")}
            style={{
              padding: "0.5rem",
              background: "#f3f4f6",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            <FaArrowLeft style={{ fontSize: "1rem", color: "#374151" }} />
          </button>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
              {product.name}
            </h1>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>Product Details</p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={toggleProductStatus}
            style={{
              padding: "0.75rem 1.5rem",
              background: product.product_status === 'active' ? "#fee2e2" : "#d1fae5",
              color: product.product_status === 'active' ? "#dc2626" : "#065f46",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {product.product_status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => router.push(`/dashboard/producer/products/${product.id}/edit`)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            <FaEdit style={{ fontSize: "0.875rem", marginRight: "0.5rem" }} />
            Edit
          </button>
          <button
            onClick={deleteProduct}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            <FaTrash style={{ fontSize: "0.875rem", marginRight: "0.5rem" }} />
            Delete
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left Column - Basic Info */}
        <div>
          {/* Product Image */}
          <div style={{ 
            height: "400px", 
            background: "#f3f4f6", 
            borderRadius: 8,
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            {product.images && product.images.length > 0 && product.images[0] ? (
              <img
                src={(() => {
                  const imageUrl = product.images[0];
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: "1rem"
              }}>
                <FaBox style={{ fontSize: "4rem", marginBottom: "1rem" }} />
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1.5rem" }}>
              Basic Information
            </h2>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                  Product Name
                </label>
                <div style={{ fontSize: "1.125rem", color: "#1f2937", fontWeight: 500 }}>
                  {product.name}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                  Category
                </label>
                <div style={{ 
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: 20,
                  fontSize: "0.875rem",
                  fontWeight: 500
                }}>
                  {product.category}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                  Status
                </label>
                <div style={{ 
                  padding: "0.5rem 1rem", 
                  borderRadius: 20, 
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  display: "inline-block",
                  ...getStatusColor(product.product_status)
                }}>
                  {product.product_status.charAt(0).toUpperCase() + product.product_status.slice(1)}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                  Price
                </label>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>
                  {product.currency || 'NGN'} {formatPriceDisplay(product.price?.toString() || '0')} {product.price_unit ? `/ ${product.price_unit}` : ''}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                  Quantity in Stock
                </label>
                <div style={{ fontSize: "1.125rem", color: "#1f2937", fontWeight: 500 }}>
                  {product.quantity || 0} units
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Details */}
        <div>
          {/* Description */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
              Description
            </h2>
            <p style={{ color: "#374151", lineHeight: 1.6, fontSize: "1rem" }}>
              {product.description || "No description available"}
            </p>
          </div>

          {/* Additional Details */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
              Additional Details
            </h2>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              {product.origin && (
                <div>
                  <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                    Origin
                  </label>
                  <div style={{ color: "#374151" }}>{product.origin}</div>
                </div>
              )}

              {product.lead_time && (
                <div>
                  <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                    Lead Time
                  </label>
                  <div style={{ color: "#374151" }}>{product.lead_time}</div>
                </div>
              )}

              {product.shelf_life && (
                <div>
                  <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                    Shelf Life
                  </label>
                  <div style={{ color: "#374151" }}>{product.shelf_life}</div>
                </div>
              )}

              {product.packaging && (
                <div>
                  <label style={{ display: "block", fontWeight: 500, color: "#6b7280", marginBottom: "0.5rem" }}>
                    Packaging
                  </label>
                  <div style={{ color: "#374151" }}>{product.packaging}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
