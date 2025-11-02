import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, width: 260, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }}
      />
      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 6 }}>{product.name}</h3>
      <p style={{ fontSize: '0.97rem', color: '#444', marginBottom: 8, minHeight: 40 }}>
        {product.description}
      </p>
      <div style={{ fontWeight: 700, color: '#0070f3', marginBottom: 10 }}>₦{product.price.toLocaleString()}</div>
      <Link href={`/products/${product.id}`} style={{ color: '#fff', background: '#0070f3', padding: '0.5rem 1.2rem', borderRadius: 5, textDecoration: 'none', fontWeight: 500, fontSize: '0.98rem' }}>
        View Details
      </Link>
    </div>
  );
} 