"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CarFront,
  ChevronRight,
  CircleHelp,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { getProfile, logoutApi } from "@/lib/api";
import { cn, isObjectId } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/passengers", label: "Passengers List", icon: Users },
  { href: "/drivers", label: "Driver List", icon: CarFront },
  { href: "/help-support", label: "Help & Support", icon: CircleHelp },
];

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  passengers: "Passengers List",
  drivers: "Driver List",
  "help-support": "Help & Support",
  profile: "Profile",
};

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: async () => {
      await signOut({ callbackUrl: "/sign-in" });
    },
  });

  return (
    <div className="flex h-full flex-col justify-between bg-[#244d97] px-[18px] py-9 text-white">
      <div className="space-y-12">
        <div className="flex items-center justify-center px-3">
          <Link href="/dashboard" className="block" onClick={onNavigate}>
            <Logo priority className="w-[72px]" />
          </Link>
        </div>

        <nav className="space-y-[10px]">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-[6px] px-3 py-3 text-[16px] leading-[1.2] font-medium text-white hover:bg-white/10",
                  isActive &&
                    "bg-[#5f91f3] text-white hover:bg-[#5f91f3]",
                )}
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        className="flex items-center gap-3 rounded-[6px] px-3 py-3 text-left text-[16px] leading-[1.2] font-medium text-white hover:bg-white/10"
      >
        <LogOut className="size-[18px] shrink-0" strokeWidth={1.9} />
        <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const currentUser = profileQuery.data ?? {
    _id: session?.user?.id ?? "",
    email: session?.user?.email ?? "",
    username: session?.user?.username ?? "Admin",
    first_name: session?.user?.first_name,
    last_name: session?.user?.last_name,
    profile_image_url: session?.user?.profile_image_url,
    status: session?.user?.status ?? "active",
    role: session?.role ?? session?.user?.role ?? "admin",
    createdAt: "",
  };

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items = [
      {
        label: "Home",
        href: "/dashboard",
      },
    ];

    if (!segments.length) {
      return items;
    }

    segments.forEach((segment, index) => {
      const previous = segments[index - 1];
      let label = labelMap[segment] ?? segment;

      if (isObjectId(segment)) {
        label =
          previous === "drivers"
            ? "Driver Details"
            : previous === "passengers"
              ? "Passengers Details"
              : "Details";
      }

      items.push({
        label,
        href: `/${segments.slice(0, index + 1).join("/")}`,
      });
    });

    return items;
  }, [pathname]);

  return (
    <div className="app-shell flex min-h-screen">
      <aside className="hidden w-[272px] shrink-0 lg:block">
        <div className="fixed inset-y-0 w-[272px]">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-[#091735]/45 lg:hidden">
          <div className="flex h-full max-w-[272px] flex-col">
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-10 items-center justify-center rounded-full bg-white text-[var(--secondary)] shadow-lg"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#ddd6cb] bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 lg:py-[18px]">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex size-11 items-center justify-center rounded-xl border border-[#ddd6cb] bg-white text-[#244d97] shadow-sm lg:hidden"
              >
                <Menu className="size-5" />
              </button>

              <div className="flex min-w-0 items-center gap-[10px] text-[16px] leading-[1.2]">
                <Home className="size-5 shrink-0 text-[#111827]" strokeWidth={2} />
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <div
                      key={item.href}
                      className="flex min-w-0 items-center gap-2"
                    >
                      {index > 0 ? (
                        <ChevronRight className="size-4 shrink-0 text-[#9ca3af]" />
                      ) : null}
                      {isLast ? (
                        <span className="truncate font-semibold text-[#111827]">
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="truncate text-[#7b8191]"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Link href="/profile" className="flex items-center" aria-label="View profile">
              <ProfileAvatar user={currentUser} size="sm" className="size-12 border-[#d6d8de]" />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
