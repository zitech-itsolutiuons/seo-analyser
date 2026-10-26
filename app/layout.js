import './globals.css';

export const metadata = {
  title: 'AI SEO Domain Analyzer',
  description: 'Predict whether a domain can rank for your target keyword.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
