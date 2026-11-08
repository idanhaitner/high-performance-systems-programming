import type { Metadata, Viewport } from "next";
import { Celebrate } from "@/components/Celebrate";
import { PageEnter } from "@/components/PageEnter";
import { Rail } from "@/components/Rail";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ViewTransitions } from "@/components/ViewTransitions";
import { loadCourse } from "@/lib/course";
import { themeScript } from "@/lib/theme";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/figtree/wght.css";
import "@fontsource-variable/heebo/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./landing.css";
import "./workspace.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function generateMetadata(): Promise<Metadata> {
  const course = loadCourse();
  return {
    title: course.title,
    description: course.summary,
    icons: {
      icon: [
        { url: `${basePath}/favicon.svg`, type: "image/svg+xml" },
        { url: `${basePath}/favicon.ico`, sizes: "any" },
      ],
      apple: `${basePath}/apple-icon.png`,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const course = loadCourse();
  return (
    // The theme script sets an attribute on <html> before React starts, so React should not treat it as a mismatch.
    <html lang={course.lang} dir={course.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ViewTransitions />
        <Celebrate />
        <ReadingProgress />
        <a className="skip" href="#content">Skip to content</a>
        <div className="shell">
          <Rail
            courseId={course.id}
            title={course.title}
            lectures={course.lectures}
            hits={course.search}
          />
          <main id="content">
            <PageEnter>{children}</PageEnter>
          </main>
        </div>
      </body>
    </html>
  );
}
