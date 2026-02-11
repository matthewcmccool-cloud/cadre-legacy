/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@clerk/nextjs', '@clerk/shared', '@clerk/backend'],
    swcMinify: true,
    async redirects() {
        return [
            // Legacy homepage tab params → /discover
            {
                source: '/',
                has: [{ type: 'query', key: 'tab', value: 'companies' }],
                destination: '/discover?view=companies',
                permanent: true,
            },
            {
                source: '/',
                has: [{ type: 'query', key: 'tab', value: 'investors' }],
                destination: '/discover?view=investors',
                permanent: true,
            },
        ];
    },
}

module.exports = nextConfig
