import "./globals.css"

export const metadata = {
  title: "Skillyug | AI Creator Bootcamp",
  description: "Equip your child with the AI skills they need to shape the world tomorrow.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

