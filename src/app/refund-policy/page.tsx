import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Skillyug",
  description: "Read Skillyug refund policy for AI bootcamps and services.",
  alternates: {
    canonical: "https://skillyugedu.com/refund-policy",
  },
};

export default function RefundPolicy() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      <div className="max-w-[800px] mx-auto pt-32 pb-24 px-6 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Cancellation & Refund Policy</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated on 02-04-2026 22:26:13</p>

        <div className="text-slate-300 text-base space-y-6 leading-relaxed">
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
      <footer className="relative z-10 w-full bg-[#020617] border-t border-slate-900/80 py-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-70 mb-4 cyber-glow">
          <span className="text-white font-black text-xs">SY</span>
        </div>

        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
            <li><Link href="/#ask-ai" className="hover:text-blue-400 transition-colors">Interactive Demo</Link></li>
            <li><Link href="/#curriculum" className="hover:text-blue-400 transition-colors">Curriculum</Link></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-500">
          <Link href="/refund-policy" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
        </div>

        <p className="text-sm font-mono text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG NEURAL SYSTEMS<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
