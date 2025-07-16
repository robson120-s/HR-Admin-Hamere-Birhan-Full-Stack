import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

// Initialize Inter font with Latin subset
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Ensure text remains visible during webfont load
  variable: '--font-inter', // Optional: if you want to use CSS variables
});

// Metadata for SEO and social sharing
export const metadata = {
  title: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | የክረምት ትምህርት መርሐግብር ፳፻፲፯ | St. John Chrysostom Education Program | Summer Camp 2025",
  description: "እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ። ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር ዕድሜያቸው ከ7 እስከ 14 ዓመት ለሆኑ ሕጻናት በአዳር እንዲሁም በተመላላሽ የት/ት ማዕቀፍ ለ6 ሳምንታት የሚሰጥ ስልጠና ነው። | Join us for an enriching summer experience at St. John Chrysostom's Education Program Summer Camp 2025.",
  keywords: [
    "St. John Chrysostom",
    "Summer Camp",
    "Education Program",
    "2025",
    "Hamere Berhan",
    "SJC2025",
    "SJC Summer Camp",
    "orthodox Education",
    "Orthodox Church",
    "Community learning",
    "Youth activities",
    "Summer activities",
    "Educational programs",
    "Cultural enrichment",
    "orthodox camp 2025",
    "St. John Chrysostom Parish",
    "St. John Chrysostom Education",
    "Summer learning",
    "Faith-based learning",
    "Children activities",
    "St. John Chrysostom",
    "Summer Camp",
    "Education Program",
    "2025",
    "Faith-based learning",
    "Children activities",
    "Christian summer camp",
    "Orthodox Christian education",
    "Faith-based summer program",
    "Kids summer activities",
    "Youth faith development",
    "Religious education camp",
    "Church summer program",
    "Bible study for kids",
    "Spiritual growth for children",
    "Orthodox Church activities",
    "Summer camp for elementary kids",
    "Teen faith retreat",
    "Preschool Christian program",
    "High school Bible camp",
    "Family faith camp",
    "Arts and crafts Christian camp",
    "Sports and faith summer program",
    "Music and worship camp",
    "Orthodox saints for kids",
    "Liturgical education for children",
    "Prayer and spirituality camp",
    "Summer Bible adventure",
    "Church history for youth",
    "St. John Chrysostom camp registration",
    "Summer 2025 Christian programs",
    "Early bird camp discounts",
    "Orthodox day camp",
    "Vacation Church School",
    "VCS",
    "Safe Christian environment for kids",
    "Affordable faith-based summer camp",
    "Character-building summer program",
    "Values-centered education",
    "Drop-off summer activities",
    "Best Orthodox Christian summer camp for kids 2025",
    "How to enroll in St. John Chrysostom summer program",
    "Faith-based activities for children near me",
    "What to expect at a Christian summer camp",
    "Summer camp with Bible lessons and fun games",
     // Ethiopian Orthodox & Amharic Keywords
    "Ethiopian Orthodox summer camp",
    "Tewahedo Sunday school program",
    "የቅዱስ ዮሐንስ አፈወርቅ የክረምት ትምህርት መርሐግብር",
    "ኦርቶዶክስ ልጆች ፕሮግራም",
    "አማርኛ የክርስትና ትምህርት",
    "የኢትዮጵያ ኦርቶዶክስ ቤተክርስቲያን ትምህርት መርሐግብር",
    "ክረምት የሕይወት ትምህርት",
    "የልጆች መንፈሳዊ እድገት",
    "ኦርቶዶክስ የበጋ አገልግሎት",
    "የመጽሐፍ ቅዱስ ትምህርት መርሐግብር",
    "የአማርኛ የክርስትና ትምህርት መርሐግብር",
    "የቤተክርስቲያን የክረምት ፕሮግራም",
    "ኦርቶዶክስ ልጆች ትምህርት መርሐግብር",
    "የኢትዮጵያ ክርስቲያን ልጆች",
    "የጌታችን ኢየሱስ ክርስቶስ ትምህርት",
    "የቅዱሳን ታሪክ ትምህርት",
    "የኦርቶዶክስ ልጆች የክረምት አከባበር",
    "አማርኛ የክርስትና ትምህርት መርሐግብር 2025",
    "የልጆች መንፈሳዊ እምነት",
    "የክርስትና የክረምት ትምህርት",
    "የኦርቶዶክስ ቤተክርስቲያን የልጆች ፕሮግራም",
    "የኢትዮጵያ ኦርቶዶክስ የክረምት ትምህርት መርሐግብር",
    "የልጆች የእምነት እድገት",
    "የክርስትና የክረምት አገልግሎት",
    "አማርኛ የክርስትና ትምህርት ፕሮግራም",
    "ሐመረ ብርሃን የብራና መጽሐፍት ሥራ",
    "ሐመረ ብርሃን"

  ],
  authors: [{ name: "ሐመረ ብርሃን የብራና መጽሐፍት ሥራ | Hamere Berhan Parchment Books Work" }],
  openGraph: {
    title: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | የክረምት ትምህርት መርሐግብር ፳፻፲፯ | St. John Chrysostom Education Program | Summer Camp 2025",
    description: "እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ። ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር ዕድሜያቸው ከ7 እስከ 14 ዓመት ለሆኑ ሕጻናት በአዳር እንዲሁም በተመላላሽ የት/ት ማዕቀፍ ለ6 ሳምንታት የሚሰጥ ስልጠና ነው። | Join us for an enriching summer experience at St. John Chrysostom's Education Program Summer Camp 2025.",
    url: "https://sjc.hamereberhan.org",
    siteName: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | St. John Chrysostom Education Program",
    images: [
      {
        url: "https://hamereberhan.org/SJC2025/metadata/SJCSummerCamp2025-OG.webp", // Replace with your OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ቅዱስ ዮሐንስ አፈወርቅ የትምህርት ፕሮግራም | የክረምት ትምህርት መርሐግብር ፳፻፲፯ | St. John Chrysostom Education Program | Summer Camp 2025",
    description: "እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ። ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር ዕድሜያቸው ከ7 እስከ 14 ዓመት ለሆኑ ሕጻናት በአዳር እንዲሁም በተመላላሽ የት/ት ማዕቀፍ ለ6 ሳምንታት የሚሰጥ ስልጠና ነው። | Join us for an enriching summer experience at St. John Chrysostom's Education Program Summer Camp 2025.",
    images: ["https://hamereberhan.org/SJC2025/metadata/SJCSummerCamp2025-OG.webp"], // Replace with your Twitter image
  },
  icons: {
    icon: "https://hamereberhan.org/SJC2025/metadata/favicon.ico",
    shortcut: "https://hamereberhan.org/SJC2025/metadata/favicon-16x16.png",
    apple: "https://hamereberhan.org/SJC2025/metadata/apple-touch-icon.png",
  },
  themeColor: "#ffffff", // Light theme color
  colorScheme: "light dark", // Supports both light and dark modes
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-RXQG3993GB"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RXQG3993GB', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        
        {/* Favicon links */}
        <link rel="icon" href="https://hamereberhan.org/SJC2025/metadata/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Viewport settings */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <NextThemesProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
