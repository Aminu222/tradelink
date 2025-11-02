"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaBox } from "react-icons/fa";

export default function ProducerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "NGN",
    price_unit: "",
    quantity: "",
    category: "",
    main_image_url: "",
    min_order_quantity: "1",
    lead_time: "",
    origin: "",
    specifications: "",
    export_compliance: "",
    packaging: "",
    shelf_life: "",
    product_status: "active",
    images: [] as File[]
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);


  useEffect(() => {
    loadProducts();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await apiService.getProfile();
      setCurrentUser(user.user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getProducerProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.deleteProduct(productId);
      // Reload products to get updated list
      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const newStatus = product.product_status === 'active' ? 'inactive' : 'active';
      await apiService.updateProduct(productId, { product_status: newStatus });
      
      // Reload products to get updated list
      await loadProducts();
    } catch (error) {
      console.error("Error updating product status:", error);
      alert('Failed to update product status. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || (product.category && product.category.toLowerCase() === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = new Set(products.map(product => product.category).filter(Boolean));
    return Array.from(categories);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for price field
    if (name === 'price') {
      // Remove all non-numeric characters except decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        return; // Don't update if multiple decimal points
      }
      
      // Limit decimal places to 2
      if (parts.length === 2 && parts[1].length > 2) {
        return; // Don't update if more than 2 decimal places
      }
      
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatPriceDisplay = (value: string) => {
    if (!value) return '';
    
    // Remove any existing commas and get the numeric value
    const numericValue = value.replace(/,/g, '');
    
    // Split by decimal point
    const parts = numericValue.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Add commas to whole number part
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combine with decimal part
    return decimalPart ? `${formattedWhole}.${decimalPart}` : formattedWhole;
  };

  const getDisplayPrice = (value: string) => {
    return formatPriceDisplay(value);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Product description is required';
    }
    if (!formData.price || parseFloat(formData.price.replace(/,/g, '')) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.price_unit.trim()) {
      errors.price_unit = 'Price unit is required';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      errors.quantity = 'Valid quantity is required';
    }
    if (!formData.min_order_quantity || parseInt(formData.min_order_quantity) < 1) {
      errors.min_order_quantity = 'Minimum order quantity must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseSpecifications = (specString: string): { [key: string]: string } => {
    if (!specString) return {};
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(specString);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // If JSON parsing fails, try the old format (key:value)
      const obj: { [key: string]: string } = {};
      specString.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length > 0) {
          obj[key.trim()] = rest.join(':').trim();
        }
      });
      return obj;
    }
    
    return {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    
    // Client-side validation for required fields
    const requiredFields = ['name', 'price', 'quantity', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      const fieldErrors: { [key: string]: string } = {};
      missingFields.forEach(field => {
        fieldErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      });
      setFormErrors(fieldErrors);
      setSubmitting(false);
      return;
    }
    
    // Validate price and quantity are positive numbers
    if (parseFloat(formData.price) <= 0) {
      setFormErrors({ price: 'Price must be greater than 0' });
      setSubmitting(false);
      return;
    }
    
    if (parseInt(formData.quantity) <= 0) {
      setFormErrors({ quantity: 'Quantity must be greater than 0' });
      setSubmitting(false);
      return;
    }
    
    try {
      // Upload images first
      const uploadedImageUrls: string[] = [];
      
      if (formData.images.length > 0) {
        setUploadingImages(true);
        console.log('Starting image upload for', formData.images.length, 'images');
        
        for (const imageFile of formData.images) {
          console.log('Uploading image:', imageFile.name, 'Size:', imageFile.size);
          
          const formDataUpload = new FormData();
          formDataUpload.append('file', imageFile);
          
          try {
            const uploadResponse = await fetch('http://localhost:5000/upload', {
              method: 'POST',
              body: formDataUpload,
            });
            
            console.log('Upload response status:', uploadResponse.status);
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(`Failed to upload image ${imageFile.name}: ${errorData.error || uploadResponse.statusText}`);
            }
            
            const uploadResult = await uploadResponse.json();
            console.log('Upload successful:', uploadResult);
            uploadedImageUrls.push(uploadResult.url);
          } catch (error) {
            console.error('Upload error for', imageFile.name, ':', error);
            throw error;
          }
        }
        
        console.log('All images uploaded successfully:', uploadedImageUrls);
        setUploadingImages(false);
      }
      
      // Set the first image as main_image_url if available
      const mainImageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : '';
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price.replace(/,/g, '')),
        quantity: parseInt(formData.quantity),
        min_order_quantity: parseInt(formData.min_order_quantity),
        specifications: JSON.stringify(parseSpecifications(formData.specifications)),
        main_image_url: mainImageUrl,
        images: uploadedImageUrls, // Use the uploaded image URLs
      };
      
      console.log('Submitting product data:', productData); // Debug log
      
      await apiService.createProduct(productData);
      resetForm();
      setShowAddModal(false);
      await loadProducts();
    } catch (error: any) {
      console.error('Error creating product:', error); // Debug log
      setFormErrors({ general: error.message || 'Failed to add product.' });
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "NGN",
      price_unit: "",
      quantity: "",
      category: "",
      main_image_url: "",
      min_order_quantity: "1",
      lead_time: "",
      origin: "",
      specifications: "",
      export_compliance: "",
      packaging: "",
      shelf_life: "",
      product_status: "active",
      images: []
    });
    setFormErrors({});
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading products...</div>
      </div>
    );
  }

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
            My Products
          </h1>
          <p style={{ 
            color: "#6b7280", 
            fontSize: isMobile ? "0.875rem" : "1rem"
          }}>
            Manage your product catalog and inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
            fontSize: isMobile ? "0.875rem" : "1rem",
            minHeight: "44px"
          }}
        >
          <FaPlus style={{ fontSize: "0.875rem" }} />
          {isMobile ? "Add" : "Add Product"}
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
                {products.reduce((sum, p) => sum + p.quantity, 0)}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Total Stock</div>
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
                      console.error('Image failed to load:', product.images[0]); // Debug log
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
                    onLoad={() => {
                      console.log('Image loaded successfully:', product.images[0]); // Debug log
                    }}
                  />
                  {product.images.length > 1 && (
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
                    ...getStatusColor(product.product_status)
                  }}>
                    {product.product_status.charAt(0).toUpperCase() + product.product_status.slice(1)}
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
                  fontWeight: 500
                }}>
                  {product.category}
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
                  {product.currency || 'NGN'} {formatPriceDisplay(product.price.toString())} {product.price_unit ? `/ ${product.price_unit}` : ''}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "0.7rem" : "0.8rem", 
                  color: "#6b7280" 
                }}>
                  Stock: {product.quantity} units
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "0.25rem" : "0.25rem" 
              }}>
                <button
                  onClick={() => toggleProductStatus(product.id)}
                  style={{
                    flex: isMobile ? "none" : 1,
                    padding: isMobile ? "0.5rem" : "0.4rem",
                    background: product.product_status === 'active' ? "#fee2e2" : "#d1fae5",
                    color: product.product_status === 'active' ? "#dc2626" : "#065f46",
                    border: "none",
                    borderRadius: 4,
                    fontSize: isMobile ? "0.75rem" : "0.75rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    minHeight: isMobile ? "36px" : "auto"
                  }}
                >
                  {product.product_status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <div style={{ 
                  display: "flex", 
                  gap: "0.25rem",
                  justifyContent: isMobile ? "space-between" : "flex-start"
                }}>
                  <button
                    onClick={() => router.push(`/dashboard/producer/products/${product.id}`)}
                    style={{
                      flex: isMobile ? 1 : "none",
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
                    style={{
                      flex: isMobile ? 1 : "none",
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
                  >
                    <FaEdit style={{ fontSize: isMobile ? "0.75rem" : "0.65rem" }} />
                    {isMobile && "Edit"}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      flex: isMobile ? 1 : "none",
                      padding: isMobile ? "0.5rem" : "0.4rem",
                      background: "#fee2e2",
                      color: "#ef4444",
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
                  >
                    <FaTrash style={{ fontSize: isMobile ? "0.75rem" : "0.65rem" }} />
                    {isMobile && "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: isMobile ? "2rem 1rem" : "4rem 2rem", 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <FaBox style={{ 
            fontSize: isMobile ? "3rem" : "4rem", 
            color: "#d1d5db", 
            marginBottom: isMobile ? "1rem" : "1.5rem" 
          }} />
          <h2 style={{ 
            fontSize: isMobile ? "1.25rem" : "1.5rem", 
            fontWeight: 600, 
            color: "#1f2937", 
            marginBottom: "0.5rem" 
          }}>
            {searchTerm || categoryFilter !== "all" ? "No products found" : "No products yet"}
          </h2>
          <p style={{ 
            color: "#6b7280", 
            fontSize: isMobile ? "0.875rem" : "1rem", 
            marginBottom: isMobile ? "1.5rem" : "2rem" 
          }}>
            {searchTerm || categoryFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Start by adding your first product"
            }
          </p>
          {!searchTerm && categoryFilter === "all" && (
            <button
              onClick={() => setShowAddModal(true)}
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
                margin: "0 auto",
                fontSize: isMobile ? "0.875rem" : "1rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            >
              <FaPlus style={{ fontSize: "0.875rem" }} />
              {isMobile ? "Add Product" : "Add Your First Product"}
            </button>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: isMobile ? "0" : "1rem"
        }}>
          <div style={{
            background: "#fff",
            padding: isMobile ? "1rem" : "2rem",
            borderRadius: isMobile ? "0" : "8",
            maxWidth: "600px",
            width: "100%",
            maxHeight: isMobile ? "100vh" : "90vh",
            overflow: "auto",
            marginTop: isMobile ? "0" : "auto"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: isMobile ? "1rem" : "1.5rem" 
            }}>
              <h2 style={{ 
                fontSize: isMobile ? "1.25rem" : "1.5rem", 
                fontWeight: 600, 
                color: "#1f2937" 
              }}>
                Add New Product
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: isMobile ? "1.25rem" : "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: isMobile ? "0.5rem" : "0",
                  minHeight: isMobile ? "44px" : "auto",
                  minWidth: isMobile ? "44px" : "auto"
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: isMobile ? "1rem" : "1.5rem" 
            }}>
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
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                gap: isMobile ? "0.75rem" : "1rem" 
              }}>
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
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", 
                gap: isMobile ? "0.75rem" : "1rem" 
              }}>
                <div>
                  <label htmlFor="price" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Price *
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={getDisplayPrice(formData.price)}
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
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Enter amount (e.g., 1,250.50 for ₦1,250.50)
                  </div>
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
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                gap: isMobile ? "0.75rem" : "1rem" 
              }}>
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
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                gap: isMobile ? "0.75rem" : "1rem" 
              }}>
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
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                gap: isMobile ? "0.75rem" : "1rem" 
              }}>
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

              {/* Product Images */}
              <div>
                <label htmlFor="images" style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Product Images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                />
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  Upload high-quality images of your product (multiple images allowed)
                </div>
                
                {/* Display selected images */}
                {formData.images.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                      Selected Images ({formData.images.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.5rem" }}>
                      {formData.images.map((image, index) => (
                        <div key={index} style={{ position: "relative" }}>
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                            {/* Form Actions */}
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "0.75rem" : "1rem", 
                justifyContent: "flex-end", 
                marginTop: "1rem" 
              }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: isMobile ? "0.875rem 1rem" : "0.75rem 1.5rem",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    minHeight: isMobile ? "44px" : "auto"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  style={{
                    padding: isMobile ? "0.875rem 1rem" : "0.75rem 1.5rem",
                    background: (submitting || uploadingImages) ? "#9ca3af" : "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: (submitting || uploadingImages) ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: isMobile ? "1rem" : "0.875rem",
                    minHeight: isMobile ? "44px" : "auto"
                  }}
                >
                  {uploadingImages ? "Uploading Images..." : submitting ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}