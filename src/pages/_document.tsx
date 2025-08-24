import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="description" content="Discover, follow, and copy successful crypto traders on Hyperliquid" />
        <meta property="og:title" content="SocialPulse - Social Trading Platform" />
        <meta property="og:description" content="Discover, follow, and copy successful crypto traders on Hyperliquid" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}