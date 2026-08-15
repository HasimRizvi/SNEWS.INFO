import type { Metadata } from "next";
import "./globals.css";
import { Navbar, Footer } from "@snews/ui";

export const metadata: Metadata = {
  title: {
    default: "SNEWS.INFO — Student Opportunity & Innovation Network",
    template: "%s · SNEWS.INFO",
  },
  description:
    "One trusted platform where students discover verified hackathons, internships, research papers, startup ideas, communities and funding.",
  keywords: [
    "hackathon",
    "internship",
    "research papers",
    "startup ideas",
    "student community",
    "CrewIn",
    "free online sessions",
    "freelancing",
  ],
  openGraph: {
    title: "SNEWS.INFO — Student Opportunity & Innovation Network",
    description:
      "Discover, verify and participate in hackathons, internships, research and startup opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
