import ProducerNavbar from "@/components/ProducerNavbar";

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <ProducerNavbar />
      <main style={{ paddingTop: "1rem" }}>{children}</main>
    </div>
  );
} 