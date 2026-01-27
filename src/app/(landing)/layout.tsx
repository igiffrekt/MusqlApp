import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Musql - Edzésmenedzsment rendszer",
  description: "Tagkezelés, órarend, fizetések egy helyen. Jógastúdióknak, harcművészeti egyesületeknek, személyi edzőknek.",
  keywords: ["edzéstermi szoftver", "fitness app", "jógastúdió kezelés", "harcművészeti klub szoftver", "személyi edző app"],
  openGraph: {
    title: "Musql - Edzésmenedzsment rendszer",
    description: "Tagkezelés, órarend, fizetések egy helyen. 15 napos ingyenes próba.",
    type: "website",
    locale: "hu_HU",
    url: "https://musql.app",
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
