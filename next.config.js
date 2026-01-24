/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false,
    transpilePackages: ['@clerk/nextjs', '@clerk/shared', '@clerk/backend'],
    experimental: {
        forceSwcTransforms: false,
    },
}

module.exports = nextConfig
