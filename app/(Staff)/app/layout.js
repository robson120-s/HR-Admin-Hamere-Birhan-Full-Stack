// app/layout.js
'use client';
import './globals.css'; // make sure this exists
import ClientLayout from './ClientLayout';

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
