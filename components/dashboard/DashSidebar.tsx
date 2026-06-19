"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, FolderGit2, Heart, BookOpen, GraduationCap, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "My Projects", icon: FolderGit2 },
  { href: "/dashboard/upvoted", label: "Upvoted", icon: Heart },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/university", label: "My University", icon: GraduationCap },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.07] h-screen sticky top-0 px-4 py-6 flex-shrink-0 bg-[#0d0f14]">
        <Link href="/" className="px-2 mb-8">
          <Image src="/logo-with-logotype.svg" alt="Superhack" height={28} width={120} />
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <SidebarLink key={link.href} {...link} active={pathname === link.href} />
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-white/[0.04] hover:text-text cursor-pointer transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-[#0d0f14] w-full fixed top-0 left-0 z-40">
        <Link href="/">
          <Image src="/logo-with-logotype.svg" alt="Superhack" height={24} width={104} />
        </Link>
        <button onClick={() => setIsOpen(true)} className="text-text cursor-pointer">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-[99]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[75vw] max-w-[320px] bg-surface border-l border-white/[0.07] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
                <Image src="/logo-with-logotype.svg" alt="Superhack" height={24} width={104} />
                <button onClick={() => setIsOpen(false)} className="cursor-pointer">
                  <X size={22} className="text-text" />
                </button>
              </div>

              <nav className="flex flex-col py-2">
                {links.map((link) => (
                  <SidebarLink key={link.href} {...link} active={pathname === link.href} mobile />
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-5 py-4 border-t border-white/[0.07] text-sm text-muted hover:bg-white/[0.04] hover:text-text cursor-pointer transition-colors"
              >
                <LogOut size={18} />
                Log out
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarLink({ href, label, icon: Icon, active, mobile }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
        active ? "text-accent bg-accent/10 font-semibold" : "text-muted hover:text-text hover:bg-white/[0.04]"
      } ${mobile ? "mx-0 px-5 py-3.5 rounded-none" : ""}`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
