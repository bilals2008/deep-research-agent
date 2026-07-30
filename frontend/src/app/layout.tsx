import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Deep Research Agent",
  description: "AI-powered research assistant that autonomously researches any topic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (var i = 0; i < regs.length; i++) {
                    regs[i].unregister();
                  }
                });
                navigator.serviceWorker.register = function() {
                  return Promise.reject(new Error("Service worker registration blocked"));
                };
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
