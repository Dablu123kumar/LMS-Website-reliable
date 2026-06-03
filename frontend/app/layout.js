import Chatbot from '@/components/Chatbot';
import './globals.css';

export const metadata = {
  title: 'LearnHub LMS — Expert-Led Online Courses',
  description:
    'Unlock your potential with premium, expert-led courses in Web Development, Data Science, AI, Cloud, Mobile, and Design. Join 1000+ students learning on LearnHub.',
  keywords: ['LMS', 'online courses', 'web development', 'data science', 'AI', 'LearnHub'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#f8fafc" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) {
                    meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0e27');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
