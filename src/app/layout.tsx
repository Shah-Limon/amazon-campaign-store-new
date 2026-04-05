import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon Campaign Store Data System",
  description: "Manage your Amazon campaigns efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <aside className="sidebar">
            <h1 className="logo">CampaignPro</h1>
            <nav className="nav-menu">
              <a href="/" className="nav-item">Dashboard</a>
              <a href="/upload" className="nav-item">CSV Upload</a>
              <a href="/campaigns" className="nav-item">All Campaigns</a>
              <a href="/download" className="nav-item">Download IDs</a>
              <a href="/settings" className="nav-item">Settings</a>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
