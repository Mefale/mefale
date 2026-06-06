import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
