/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://172.16.10.245:3001"
  ],
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const headers = []
    if (!isProd) {
      headers.push(
        {
          source: "/__nextjs_font/:path*",
          headers: [
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          ],
        },
        {
          source: "/_next/:path*",
          headers: [
            { key: "Access-Control-Allow-Origin", value: "*" },
          ],
        },
      )
    }
    // Security headers (prod)
    headers.push({
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: http: https:; font-src 'self' data:; frame-ancestors 'self';" },
        ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    })
    return headers
  },
  webpack: (config, { _isServer }) => {
    // dtrace-provider — опциональная зависимость ldapjs; отключаем её, чтобы не падала сборка
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'dtrace-provider': false,
    }
    return config
  },
}

export default nextConfig
