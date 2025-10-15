// lib/getBaseUrl.js
export function getBaseUrl(req) {
  const host = req?.headers?.host || 'localhost:3000';
  const isProd = process.env.NODE_ENV === 'production';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
