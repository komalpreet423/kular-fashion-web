import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; // Using standard Google Fonts
import "@/css/global.css";
import Header from "@/components/global/header";
import Footer from "@/components/global/footer";
import { CartProvider } from "@/context/cart-context";

// Initialize fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kular Fashion",
  description: "Premium fashion for the modern lifestyle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}