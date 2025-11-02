import '../../globals.css';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <main>
        {children}
      </main>
    </div>
  );
} 