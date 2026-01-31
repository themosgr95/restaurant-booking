"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react"; // Make sure you have lucide-react installed

const tabs = [
  { name: "Profile", href: "/staff/dashboard/settings/profile" },
  { name: "Restaurant", href: "/staff/dashboard/settings/restaurant" },
  { name: "Hours", href: "/staff/dashboard/settings/hours" },
  { name: "Tables", href: "/staff/dashboard/settings/tables" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 relative min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your restaurant configuration.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {children}
      </div>

      {/* Blinking Support Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="relative group">
            {/* Blinking Ring */}
            <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
            
            {/* Button Content */}
            <div className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                <MessageCircle size={24} />
                <span className="font-bold hidden group-hover:block whitespace-nowrap">
                    Need Help?
                </span>
            </div>
        </button>
      </div>
    </div>
  );
}