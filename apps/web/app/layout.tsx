import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Admission Engine — বিশ্ববিদ্যালয় ভর্তির সেরা প্রস্তুতি",
  description:
    "বুয়েট, ঢাবি 'ক', মেডিকেল কিংবা গুচ্ছ — রিয়েল-টাইম র‍্যাংকিং, নির্ভুল ওএমআর টাইমার এবং স্মার্ট ভুল খাতা নিয়ে তোমার চূড়ান্ত প্রস্তুতি নিশ্চিত করো।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#fafafa] font-sans antialiased text-zinc-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
