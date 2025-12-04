import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const sidebarCollapsed =
    cookiesStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";

  return (
    <SidebarProvider defaultOpen={sidebarCollapsed}>
      <AppSidebar />
      <SidebarInset className="items-center">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
