export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: StorefrontHeader */}
      <main className="flex-1">{children}</main>
      {/* TODO: StorefrontFooter */}
      {/* TODO: WhatsApp FAB */}
    </div>
  );
}
