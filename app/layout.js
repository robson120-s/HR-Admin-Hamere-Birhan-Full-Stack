import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// app/layout.js





export const metadata = {
  title: "Attendance Management System",
  description: "Manage and track attendance efficiently.",
  icons: {
    icon: "/favicon-32.ico", // Update this if needed
  },
  authors: [
    { name: "ሐመረ ብርሃን የብራና መጽሐፍት ሥራ | Hamere Berhan Parchment Books Work" }
  ],
  openGraph: {
    title: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | የክረምት ትምህርት መርሐግብር ፳፻፲፯ | St. John Chrysostom Education Program | Summer Camp 2025",
    description: "እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ። ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር ዕድሜያቸው ከ7 እስከ 14 ዓመት ለሆኑ ሕጻናት በአዳር እንዲሁም በተመላላሽ የት/ት ማዕቀፍ ለ6 ሳምንታት የሚሰጥ ስልጠና ነው። | Join us for an enriching summer experience at St. John Chrysostom's Education Program Summer Camp 2025.",
    url: "https://sjc.hamereberhan.org",
    siteName: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | St. John Chrysostom Education Program",
    images: [
      {
        url: "https://hamereberhan.org/SJC2025/metadata/SJCSummerCamp2025-OG.webp",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* put inside <head> area or head.js */}
        <link rel="icon" href="/favicon-32.ico" sizes="32x32" />

      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
