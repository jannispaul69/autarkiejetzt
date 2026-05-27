/**
 * Minimal portal root layout — login page lives here without a sidebar.
 * Protected pages use the (portal) route group which adds the shell.
 */
export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
