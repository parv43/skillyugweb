import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | Skillyug",
  description: "Read Skillyug terms and conditions for using our services.",
  alternates: {
    canonical: "https://www.skillyugedu.com/terms-and-conditions",
  },
};

export default function TermsAndConditions() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      <div className="max-w-[800px] mx-auto pt-32 pb-24 px-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group text-sm font-semibold">
          <span className="text-lg leading-none">←</span>
          <span>Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated on 02-04-2026 22:24:07</p>

        <div className="text-slate-300 text-base space-y-6 leading-relaxed">
          <p>
            These Terms and Conditions, along with privacy policy or other terms (“Terms”) constitute a binding agreement by and between SKILLYUG LLP, ( “Website Owner” or “we” or “us” or “our”) and you (“you” or “your”) and relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, “Services”).
          </p>
          <p>
            By using our website and availing the Services, you agree that you have read and accepted these Terms (including the Privacy Policy). We reserve the right to modify these Terms at any time and without assigning any reason. It is your responsibility to periodically review these Terms to stay informed of updates.
          </p>
          <p>The use of this website or availing of our Services is subject to the following terms of use:</p>
          <ul className="list-disc pl-5 space-y-4">
            <li>To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account.</li>
            <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
            <li>Your use of our Services and the website is solely at your own risk and discretion. You are required to independently assess and ensure that the Services meet your requirements.</li>
            <li>The contents of the Website and the Services are proprietary to Us and you will not have any authority to claim any intellectual property rights, title, or interest in its contents.</li>
            <li>You acknowledge that unauthorized use of the Website or the Services may lead to action against you as per these Terms or applicable laws.</li>
            <li>You agree to pay us the charges associated with availing the Services.</li>
            <li>You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.</li>
            <li>You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites.</li>
            <li>You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the us for the Services.</li>
            <li>You shall be entitled to claim a refund of the payment made by you in case we are not able to provide the Service. The timelines for such return and refund will be according to the specific Service you have availed or within the time period provided in our policies (as applicable). In case you do not raise a refund claim within the stipulated time, then this would make you ineligible for a refund.</li>
            <li>Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event.</li>
            <li>These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India.</li>
            <li>All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Orai, UP.</li>
            <li>All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.</li>
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
