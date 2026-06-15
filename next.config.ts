import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: 'utfs.io' },                        // uploadthing
      { hostname: 'uploadthing.com' },                // uploadthing alternative
      { hostname: '*.uploadthing.com' },              // uploadthing subdomains
      { hostname: '*.supabase.co' },                  // supabase storage
      { hostname: 'lh3.googleusercontent.com' },      // google profile images
      { hostname: 'avatars.githubusercontent.com' },  // github profile images
    ]
  }
};

export default nextConfig;
