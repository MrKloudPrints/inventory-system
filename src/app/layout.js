import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "Inventory System",
  description: "Stock management with QR placards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
