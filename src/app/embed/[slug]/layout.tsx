import { Inter } from "next/font/google";
import "../../globals.css"; // Ensure this path points to your main css

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ding! Booking Widget",
  description: "Powered by Ding!",
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-transparent`}>
        {/* We use bg-transparent so it blends into the host website */}
        {children}
      </body>
    </html>
  );
}