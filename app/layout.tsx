import type { Metadata } from "next";
import "./globals.css";
import ClientNavbarWrapper from "../components/ClientNavbarWrapper";
import { MessagingProvider } from "../contexts/MessagingContext";
// import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Bis-Connect - B2B Trading Platform",
  description: "Connect local sellers and buyers in a seamless B2B trading experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <MessagingProvider>
          <ClientNavbarWrapper />
          {children}
        </MessagingProvider>
      </body>
    </html>
  );
}
