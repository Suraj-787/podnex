import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

// Every page under /dashboard is auth-gated and user-specific — there's no
// static-generation benefit, and statically prerendering them was the actual
// cause of a live hydration error (React #418) on pages using Radix's
// AlertDialog: its internal useId()-based ARIA ids get baked into the
// build-time-frozen static HTML, then mismatch against a fresh client-side
// id sequence at hydration. Forcing dynamic rendering means every request
// gets a real, fresh render — no frozen shell to mismatch against.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.03]" />
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 md:gap-8 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
