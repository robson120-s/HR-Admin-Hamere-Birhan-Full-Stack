// app/layout.js
'use client';

import ClientLayout from "./ClientLayout";
import '../../globals.css';



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
