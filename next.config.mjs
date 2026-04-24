import createMDX from "@next/mdx";

const withMDX = createMDX();
const isDev = process.env.NODE_ENV !== "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;
const supabaseWsOrigin = supabaseUrl ? `wss://${new URL(supabaseUrl).host}` : null;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : null;

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "img-src 'self' data: blob:",
    "https://images.unsplash.com",
    "https://api.dicebear.com",
    "https://lh3.googleusercontent.com",
    supabaseOrigin,
  ]
    .filter(Boolean)
    .join(" "),
  [
    "connect-src 'self'",
    isDev ? "ws: http:" : null,
    supabaseOrigin,
    supabaseWsOrigin,
    "https://checkout.razorpay.com",
    "https://api.razorpay.com",
    "https://*.razorpay.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' blob: data:",
].join("; ");

const nextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/7.x/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https",
              hostname: supabaseHost,
              port: "",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default withMDX({
  ...nextConfig,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
});
