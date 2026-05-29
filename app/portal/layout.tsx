import "leaflet/dist/leaflet.css";

/**
 * Portal root layout — login page lives here without a sidebar.
 * Protected pages use the (portal) route group which adds the shell.
 * Leaflet CSS is imported here so it's available for all portal map pages.
 */
export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
