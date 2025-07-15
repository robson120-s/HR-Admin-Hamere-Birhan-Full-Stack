import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, GoogleOneTap } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Streaming App",
  description: "Your awesome streaming platform",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
        <body className={inter.className}>

            {/* <GoogleOneTap /> this can be added latter cause it requires custom credentials from google it allows people to sign in with one tap*/}
            {/* <Toaster position="top-right" /> */}
            {children}
        </body>
      </html>

  );
}
