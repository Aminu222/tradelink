"use client";
import { useState } from "react";
import { FaCreditCard, FaLock, FaShieldAlt } from "react-icons/fa";

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentGateway({ 
  amount, 
  currency, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}: PaymentGatewayProps) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Card number validation (basic Luhn algorithm)
    if (!cardData.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    // Expiry validation
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiry = "Please enter expiry date";
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(cardData.expiryYear);
      const expiryMonth = parseInt(cardData.expiryMonth);

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiry = "Card has expired";
      }
    }

    // CVV validation
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    // Cardholder name validation
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = "Please enter cardholder name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '');
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Send payment data to your backend
      // 2. Backend would integrate with payment processor (Stripe, Paystack, etc.)
      // 3. Return payment result

      // For demo purposes, we'll simulate a successful payment
      const paymentResult = {
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: currency,
        status: 'success',
        paymentMethod: 'credit_card',
        timestamp: new Date().toISOString()
      };

      onPaymentSuccess(paymentResult);
    } catch (error) {
      onPaymentError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e5e7eb',
      maxWidth: 500,
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 8, 
          marginBottom: 8 
        }}>
          <FaShieldAlt style={{ color: '#10b981', fontSize: 20 }} />
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1f2937' }}>
            Secure Payment
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Your payment information is encrypted and secure
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          background: '#f9fafb', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #e5e7eb',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>Amount to pay:</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
              {currency} {amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
        {/* Card Number */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>
            Card Number *
          </label>
          <div style={{ position: 'relative' }}>
            <FaCreditCard style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af' 
            }} />
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                borderRadius: 8,
                border: errors.cardNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
          </div>
          {errors.cardNumber && (
            <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>
            Cardholder Name *
          </label>
          <input
            type="text"
            value={cardData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: errors.cardholderName ? '1px solid #dc2626' : '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          />
          {errors.cardholderName && (
            <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.cardholderName}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>
              Expiry Date *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={cardData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                placeholder="MM"
                maxLength={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: errors.expiry ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              />
              <input
                type="text"
                value={cardData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                placeholder="YY"
                maxLength={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: errors.expiry ? '1px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              />
            </div>
            {errors.expiry && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.expiry}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>
              CVV *
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              maxLength={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: errors.cvv ? '1px solid #dc2626' : '1px solid #d1d5db',
                fontSize: '1rem'
              }}
            />
            {errors.cvv && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ 
          background: '#f0f9ff', 
          padding: 12, 
          borderRadius: 8, 
          border: '1px solid #bae6fd',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <FaLock style={{ color: '#0284c7', fontSize: 14 }} />
          <span style={{ color: '#0369a1', fontSize: 12 }}>
            Your payment information is encrypted and secure. We never store your card details.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#e5e7eb' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {loading ? (
              <>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid #fff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard />
                Pay {currency} {amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 