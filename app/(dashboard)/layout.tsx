"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  LineChart, 
  Moon, 
  Smile, 
  Calendar, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NavItem = ({ href, label, icon }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/workouts", label: "Treinos", icon: <Dumbbell size={20} /> },
    { href: "/nutrition", label: "Nutrição", icon: <Apple size={20} /> },
    { href: "/metrics", label: "Métricas", icon: <LineChart size={20} /> },
    { href: "/sleep", label: "Sono", icon: <Moon size={20} /> },
    { href: "/wellbeing", label: "Bem-estar", icon: <Smile size={20} /> },
    { href: "/planner", label: "Planos", icon: <Calendar size={20} /> },
    { href: "/settings", label: "Configurações", icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background h-16 fixed top-0 left-0 right-0 z-10">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-primary">MetaMorfose</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:static inset-y-16 left-0 z-10 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:transform-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </nav>
        </aside>
        
        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}