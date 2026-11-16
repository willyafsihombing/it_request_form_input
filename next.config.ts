import path from 'path';
import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
    output: 'standalone',
    allowedDevOrigins: ['127.0.0.1', 'host.docker.internal'],
    turbopack: {
        root: path.resolve(__dirname),
    },
};

export default nextConfig;