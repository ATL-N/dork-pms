/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/socket",
        // destination: "http://localhost:8080", // Proxy to the WebSocket server
        destination: "https://pf.dorkordi.site/:8080", // Proxy to the WebSocket server
      },
    ];
  },
};

export default nextConfig;
