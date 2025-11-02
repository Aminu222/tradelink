"use client";
import { useState, useEffect } from "react";
import { FaUniversity, FaCopy, FaCheck, FaShieldAlt, FaInfoCircle } from "react-icons/fa";
import { apiService } from "@/services/api";

interface BankTransferPaymentProps {
  amount: number;
  currency: string;
  producerId?: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function BankTransferPayment({ 
  amount, 
  currency, 
  producerId,
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}: BankTransferPaymentProps) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loadingBankDetails, setLoadingBankDetails] = useState(true);

  useEffect(() => {
    loadBankDetails();
  }, [producerId]);

  const loadBankDetails = async () => {
    try {
      setLoadingBankDetails(true);
      if (producerId) {
        // Load producer's bank details
        console.log('Loading bank details for producer:', producerId);
        const response = await apiService.getProducerPublicBankDetails(producerId);
        console.log('Producer bank details response:', response);
        
        if (response.success && response.bankDetails && response.bankDetails.length > 0) {
          // The backend returns the first active bank account, so just use the first one
          const bankDetails = response.bankDetails[0];
          console.log('Using producer bank details:', bankDetails);
          setBankDetails(bankDetails);
        } else {
          console.log('No producer bank details found, using platform fallback');
          // Fallback to platform bank details
          const platformDetails = await apiService.getBankDetails();
          setBankDetails(platformDetails);
        }
      } else {
        console.log('No producer ID, using platform bank details');
        // Load platform bank details
        const platformDetails = await apiService.getBankDetails();
        setBankDetails(platformDetails);
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
      // Fallback to default values
      setBankDetails({
        bank_name: "First Bank of Nigeria",
        account_name: "Bis-Connect International Ltd",
        account_number: "1234567890",
        swift_code: "FBNINGL",
        routing_number: "001"
      });
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateReferenceNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  const handleConfirmTransfer = async () => {
    if (!referenceNumber.trim()) {
      alert('Please enter your bank transfer reference number');
      return;
    }

    setLoading(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentResult = {
        transactionId: referenceNumber,
        amount: amount,
        currency: currency,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        timestamp: new Date().toISOString(),
        referenceNumber: referenceNumber
      };

      onPaymentSuccess(paymentResult);
    } catch (error) {
      onPaymentError('Failed to confirm bank transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReference = () => {
    setReferenceNumber(generateReferenceNumber());
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e5e7eb',
      maxWidth: 600,
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
            Bank Transfer Payment
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          Transfer funds to our bank account and confirm your payment
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
            <span style={{ color: '#6b7280', fontSize: 14 }}>Amount to transfer:</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
              {currency} {amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>
          {producerId ? 'Seller Bank Account Details' : 'Bank Account Details'}
        </h3>
        
        {loadingBankDetails ? (
          <div style={{ 
            background: '#f9fafb', 
            padding: 20, 
            borderRadius: 8, 
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ color: '#6b7280' }}>Loading bank details...</div>
          </div>
        ) : bankDetails ? (
          <div style={{ 
            background: '#f0f9ff', 
            padding: 20, 
            borderRadius: 8, 
            border: '1px solid #bae6fd'
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Bank Name:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1f2937' }}>{bankDetails.bank_name}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bank_name, 'bankName')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedField === 'bankName' ? '#10b981' : '#6b7280',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {copiedField === 'bankName' ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Account Name:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1f2937' }}>{bankDetails.account_name}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.account_name, 'accountName')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedField === 'accountName' ? '#10b981' : '#6b7280',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {copiedField === 'accountName' ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Account Number:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '1.1em' }}>{bankDetails.account_number}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.account_number, 'accountNumber')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedField === 'accountNumber' ? '#10b981' : '#6b7280',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {copiedField === 'accountNumber' ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  </button>
                </div>
              </div>

              {bankDetails.swift_code && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>Swift Code:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace' }}>{bankDetails.swift_code}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.swift_code, 'swiftCode')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedField === 'swiftCode' ? '#10b981' : '#6b7280',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      {copiedField === 'swiftCode' ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {bankDetails.iban && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>IBAN:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '0.9em' }}>{bankDetails.iban}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedField === 'iban' ? '#10b981' : '#6b7280',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      {copiedField === 'iban' ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ 
            background: '#fef3c7', 
            padding: 20, 
            borderRadius: 8, 
            border: '1px solid #f59e0b',
            textAlign: 'center'
          }}>
            <div style={{ color: '#92400e' }}>
              {producerId ? 'Seller has not added bank details yet.' : 'Bank details not available.'}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Instructions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>
          Transfer Instructions
        </h3>
        
        <div style={{ 
          background: '#fef3c7', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
            <FaInfoCircle style={{ color: '#f59e0b', marginTop: 2 }} />
            <div style={{ fontSize: 14, color: '#92400e' }}>
              <strong>Important:</strong> Please include your reference number in the transfer description to help us identify your payment.
            </div>
          </div>
          
          <ol style={{ fontSize: 14, color: '#92400e', margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 4 }}>Use the bank account details above for your transfer</li>
            <li style={{ marginBottom: 4 }}>Transfer exactly {currency} {amount.toLocaleString()}</li>
            <li style={{ marginBottom: 4 }}>Include your reference number in the transfer description</li>
            <li style={{ marginBottom: 4 }}>Keep your transfer receipt for verification</li>
            <li>Click "Confirm Transfer" after completing the transfer</li>
          </ol>
        </div>
      </div>

      {/* Reference Number */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>
          Reference Number
        </h3>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Enter your bank transfer reference number"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={handleGenerateReference}
            style={{
              padding: '12px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Generate
          </button>
        </div>
        
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          This reference number helps us identify your payment. You can generate one automatically or use your own.
        </p>
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
          onClick={handleConfirmTransfer}
          disabled={loading || !referenceNumber.trim()}
          style={{
            flex: 1,
            padding: '12px',
            background: loading || !referenceNumber.trim() ? '#e5e7eb' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading || !referenceNumber.trim() ? 'not-allowed' : 'pointer',
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
              Confirming...
            </>
          ) : (
            <>
              <FaUniversity />
              Confirm Transfer
            </>
          )}
        </button>
      </div>

      {/* Additional Info */}
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        background: '#f0f9ff', 
        borderRadius: 8, 
        border: '1px solid #bae6fd' 
      }}>
        <div style={{ fontSize: 12, color: '#0369a1', textAlign: 'center' }}>
          <strong>Processing Time:</strong> Bank transfers typically take 1-3 business days to process. 
          Your order will be confirmed once the payment is verified.
        </div>
      </div>
    </div>
  );
} 