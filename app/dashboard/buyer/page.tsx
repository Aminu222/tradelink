"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyerDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page
    router.replace('/dashboard/buyer/products');
  }, [router]);

  return (
      <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      fontSize: '16px',
      color: '#6b7280'
    }}>
      Redirecting to products...
    </div>
  );
} 