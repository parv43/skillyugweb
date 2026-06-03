import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Refund Policy",
    description: "Read the Skillyug refund and cancellation policy for services and bookings.",
    path: "/refund-policy",
  }),
};

export default function RefundPolicy() {
  return (
    <main className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-blue-500/10 selection:text-blue-900">
      <Navbar />

      <div className="max-w-[800px] mx-auto pt-32 pb-24 px-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group text-sm font-semibold">
          <span className="text-lg leading-none">←</span>
          <span>Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Cancellation & Refund Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated on 02-04-2026 22:26:13</p>

        <div className="text-slate-600 text-base space-y-6 leading-relaxed">
          <p>
            SKILLYUG LLP believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
          </p>
          <ul className="list-disc pl-5 space-y-4">
            <li>Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.</li>
            <li>SKILLYUG LLP does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.</li>
            <li>In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 30 Days of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 30 Days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.</li>
            <li>In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by the SKILLYUG LLP, it’ll take 9-15 Days for the refund to be processed to the end customer.</li>
          </ul>
        </div>
      </div>

      {/* Shared Footer */}
      <footer className="relative z-10 w-full bg-slate-50 border-t border-slate-200/80 pt-8 pb-20 flex flex-col items-center">
        <div className="bg-slate-100/50 p-6 md:p-16 px-10 md:px-48 rounded-[2rem] md:rounded-[2.5rem] mb-16 backdrop-blur-sm overflow-hidden group border border-slate-200/50">
          <Image src="/skillyug-optimized.svg" alt="Skillyug Logo" width={300} height={150} className="h-14 md:h-36 w-auto object-contain scale-[1.8] md:scale-[2.0] transition-transform group-hover:scale-[2.4] duration-500 transform-gpu" />
        </div>

        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
            <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-400">
          <Link href="/refund-policy" className="hover:text-slate-600 transition-colors">Refund Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-600 transition-colors">Terms & Conditions</Link>
        </div>

        <p className="text-xs font-mono text-slate-400 tracking-widest text-center">
          © 2026 SKILLYUG<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
