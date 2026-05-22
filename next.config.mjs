const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
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

export default nextConfig;
