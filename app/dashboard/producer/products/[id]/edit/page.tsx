"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { FaArrowLeft, FaSave } from "react-icons/fa";

export default function ProducerProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "NGN",
    price_unit: "",
    quantity: "",
    category: "",
    min_order_quantity: "1",
    lead_time: "",
    origin: "",
    specifications: "",
    export_compliance: "",
    packaging: "",
    shelf_life: "",
    product_status: "active"
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

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
        setFormData({
          name: foundProduct.name || "",
          description: foundProduct.description || "",
          price: foundProduct.price?.toString() || "",
          currency: foundProduct.currency || "NGN",
          price_unit: foundProduct.price_unit || "",
          quantity: foundProduct.quantity?.toString() || "",
          category: foundProduct.category || "",
          min_order_quantity: foundProduct.min_order_quantity?.toString() || "1",
          lead_time: foundProduct.lead_time || "",
          origin: foundProduct.origin || "",
          specifications: foundProduct.specifications || "",
          export_compliance: foundProduct.export_compliance || "",
          packaging: foundProduct.packaging || "",
          shelf_life: foundProduct.shelf_life || "",
          product_status: foundProduct.product_status || "active"
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const numericValue = value.replace(/[^\d.]/g, '');
      const parts = numericValue.split('.');
      if (parts.length > 2) return;
      if (parts.length === 2 && parts[1].length > 2) return;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Product description is required';
    if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) <= 0) errors.price = 'Valid price is required';
    if (!formData.price_unit.trim()) errors.price_unit = 'Price unit is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.quantity || parseInt(formData.quantity) < 0) errors.quantity = 'Valid quantity is required';
    if (!formData.min_order_quantity || parseInt(formData.min_order_quantity) < 1) errors.min_order_quantity = 'Minimum order quantity must be at least 1';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      const updateData = {
        ...formData,
        price: parseFloat(formData.price.replace(/,/g, '')),
        quantity: parseInt(formData.quantity),
        min_order_quantity: parseInt(formData.min_order_quantity)
      };

      await apiService.updateProduct(product.id, updateData);
      router.push(`/dashboard/producer/products/${product.id}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      setFormErrors({ general: error.message || 'Failed to update product.' });
    } finally {
      setSubmitting(false);
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
        <div>Loading product...</div>
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
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => router.push(`/dashboard/producer/products/${product.id}`)}
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
            Edit Product
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Update details for "{product.name}"
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div style={{ background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* General Error Display */}
          {formErrors.general && (
            <div style={{
              padding: "0.75rem",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              color: "#dc2626",
              fontSize: "0.875rem"
            }}>
              {formErrors.general}
            </div>
          )}
          
          {/* Basic Information */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="name" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.name ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.name}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="category" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.category ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  background: "#fff"
                }}
              >
                <option value="">Select a category</option>
                {/* Food & Agriculture */}
                <optgroup label="Food & Agriculture">
                  <option value="Coffee">Coffee</option>
                  <option value="Grains">Grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Spices">Spices</option>
                  <option value="Nuts">Nuts</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Dairy">Dairy Products</option>
                  <option value="Meat">Meat & Poultry</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Honey">Honey & Bee Products</option>
                  <option value="Organic">Organic Products</option>
                </optgroup>
                
                {/* Textiles & Fashion */}
                <optgroup label="Textiles & Fashion">
                  <option value="Cotton">Cotton</option>
                  <option value="Silk">Silk</option>
                  <option value="Wool">Wool</option>
                  <option value="Leather">Leather</option>
                  <option value="Fabric">Fabric & Textiles</option>
                  <option value="Clothing">Clothing & Apparel</option>
                  <option value="Accessories">Fashion Accessories</option>
                  <option value="Footwear">Footwear</option>
                </optgroup>
                
                {/* Handicrafts & Art */}
                <optgroup label="Handicrafts & Art">
                  <option value="Pottery">Pottery & Ceramics</option>
                  <option value="Woodwork">Woodwork & Carpentry</option>
                  <option value="Metalwork">Metalwork & Jewelry</option>
                  <option value="Basketry">Basketry & Weaving</option>
                  <option value="Painting">Paintings & Art</option>
                  <option value="Sculpture">Sculpture</option>
                  <option value="Handicrafts">Traditional Handicrafts</option>
                </optgroup>
                
                {/* Natural Resources */}
                <optgroup label="Natural Resources">
                  <option value="Minerals">Minerals & Gemstones</option>
                  <option value="Timber">Timber & Wood</option>
                  <option value="Essential Oils">Essential Oils</option>
                  <option value="Natural Dyes">Natural Dyes</option>
                  <option value="Clay">Clay & Soil Products</option>
                  <option value="Stone">Stone & Marble</option>
                </optgroup>
                
                {/* Health & Beauty */}
                <optgroup label="Health & Beauty">
                  <option value="Cosmetics">Natural Cosmetics</option>
                  <option value="Skincare">Skincare Products</option>
                  <option value="Haircare">Haircare Products</option>
                  <option value="Soaps">Natural Soaps</option>
                  <option value="Essential Oils Beauty">Essential Oils for Beauty</option>
                  <option value="Herbal Medicine">Herbal Medicine</option>
                </optgroup>
                
                {/* Home & Living */}
                <optgroup label="Home & Living">
                  <option value="Furniture">Furniture</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Kitchenware">Kitchenware</option>
                  <option value="Bedding">Bedding & Linens</option>
                  <option value="Candles">Candles & Lighting</option>
                  <option value="Bath Products">Bath & Body Products</option>
                </optgroup>
                
                {/* Beverages */}
                <optgroup label="Beverages">
                  <option value="Tea">Tea</option>
                  <option value="Juices">Natural Juices</option>
                  <option value="Wine">Wine & Spirits</option>
                  <option value="Traditional Drinks">Traditional Drinks</option>
                  <option value="Herbal Tea">Herbal Tea</option>
                </optgroup>
                
                {/* Electronics & Technology */}
                <optgroup label="Electronics & Technology">
                  <option value="Laptops">Laptops & Computers</option>
                  <option value="Smartphones">Smartphones & Mobile Devices</option>
                  <option value="Tablets">Tablets & iPads</option>
                  <option value="Accessories">Electronics Accessories</option>
                  <option value="Audio">Audio & Sound Equipment</option>
                  <option value="Cameras">Cameras & Photography</option>
                  <option value="Gaming">Gaming Consoles & Equipment</option>
                  <option value="Smart Home">Smart Home Devices</option>
                  <option value="Wearables">Wearable Technology</option>
                  <option value="Components">Electronic Components</option>
                  <option value="Software">Software & Digital Products</option>
                </optgroup>
                
                {/* Other */}
                <optgroup label="Other">
                  <option value="Other">Other</option>
                </optgroup>
              </select>
              {formErrors.category && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.category}
                </div>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: formErrors.description ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: "0.875rem",
                resize: "vertical"
              }}
              placeholder="Describe your product..."
            />
            {formErrors.description && (
              <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {formErrors.description}
              </div>
            )}
          </div>

          {/* Pricing and Quantity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="price" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Price *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formatPriceDisplay(formData.price)}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.price ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="0.00"
              />
              {formErrors.price && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.price}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="currency" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Currency *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  background: "#fff"
                }}
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div>
              <label htmlFor="price_unit" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Price Unit *
              </label>
              <select
                id="price_unit"
                name="price_unit"
                value={formData.price_unit}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.price_unit ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  background: "#fff"
                }}
              >
                <option value="">Select unit</option>
                <option value="per_unit">Per Unit</option>
                <option value="per_kg">Per Kilogram</option>
                <option value="per_gram">Per Gram</option>
                <option value="per_lb">Per Pound</option>
                <option value="per_ton">Per Ton</option>
                <option value="per_bag">Per Bag</option>
                <option value="per_box">Per Box</option>
                <option value="per_crate">Per Crate</option>
                <option value="per_bundle">Per Bundle</option>
                <option value="per_piece">Per Piece</option>
              </select>
              {formErrors.price_unit && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.price_unit}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="quantity" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.quantity ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="0"
              />
              {formErrors.quantity && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.quantity}
                </div>
              )}
            </div>
          </div>

          {/* Order and Lead Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="min_order_quantity" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Min Order Quantity *
              </label>
              <input
                type="number"
                id="min_order_quantity"
                name="min_order_quantity"
                value={formData.min_order_quantity}
                onChange={handleInputChange}
                min="1"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: formErrors.min_order_quantity ? "1px solid #dc2626" : "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="1"
              />
              {formErrors.min_order_quantity && (
                <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formErrors.min_order_quantity}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lead_time" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Lead Time
              </label>
              <input
                type="text"
                id="lead_time"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="e.g., 2-3 weeks"
              />
            </div>
          </div>

          {/* Origin and Shelf Life */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="origin" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="e.g., Nigeria, Kenya"
              />
            </div>

            <div>
              <label htmlFor="shelf_life" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Shelf Life
              </label>
              <input
                type="text"
                id="shelf_life"
                name="shelf_life"
                value={formData.shelf_life}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
                placeholder="e.g., 12 months"
              />
            </div>
          </div>

          {/* Specifications and Compliance */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="specifications" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Specifications
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  resize: "vertical"
                }}
                placeholder="Product specifications..."
              />
            </div>

            <div>
              <label htmlFor="export_compliance" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                Export Compliance
              </label>
              <textarea
                id="export_compliance"
                name="export_compliance"
                value={formData.export_compliance}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  resize: "vertical"
                }}
                placeholder="Export compliance details..."
              />
            </div>
          </div>

          {/* Packaging */}
          <div>
            <label htmlFor="packaging" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
              Packaging
            </label>
            <textarea
              id="packaging"
              name="packaging"
              value={formData.packaging}
              onChange={handleInputChange}
              rows={2}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: "0.875rem",
                resize: "vertical"
              }}
              placeholder="Packaging details..."
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/producer/products/${product.id}`)}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#6b7280",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.75rem 1.5rem",
                background: submitting ? "#9ca3af" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaSave style={{ fontSize: "0.875rem" }} />
              {submitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
