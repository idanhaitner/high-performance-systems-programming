import type { Metadata, Viewport } from "next";
import { Heebo, Source_Code_Pro } from "next/font/google";
import { Rail } from "@/components/Rail";
import { ReadingProgress } from "@/components/ReadingProgress";
import { loadCourse } from "@/lib/course";
import "katex/dist/katex.min.css";
import "./globals.css";

const sans = Heebo({ subsets: ["latin", "hebrew"], variable: "--font-sans", display: "swap" });
const mono = Source_Code_Pro({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const course = loadCourse();
  return {
    title: course.title,
    description: course.summary,
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const course = loadCourse();
  return (
    <html lang={course.lang} dir={course.dir} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <ReadingProgress />
        <a className="skip" href="#content">Skip to content</a>
        <div className="shell">
          <Rail
            courseId={course.id}
            title={course.title}
            lectures={course.lectures}
            hits={course.search}
          />
          <main id="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
