import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { RiTeamLine } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import {
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  TagIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { ShoppingCartIcon, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function SideBar({ children }) {
  const { user, logout } = useContext(UserContext);
  // Store selection removed — show basic user info and logout
  
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // ...existing code...

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: ["admin"],
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    
    {
      name: "New Sale",
      path: "/dashboard/new-sale",
      roles: ["admin", "cashier"],
      icon: <ShoppingCartIcon className="h-5 w-5" />,
    },
    {
      name: "Sales",
      path: "/dashboard/sale",
      roles: ["admin", "cashier"],
      icon: <RectangleStackIcon className="h-5 w-5" />,
    },
    {
      name: "Products",
      path: "/dashboard/product",
      roles: ["admin", "cashier"],
      icon: <ShoppingBagIcon className="h-5 w-5" />,
    },
    {
      name: "Categories",
      roles: ["admin", "cashier"],
      path: "/dashboard/category",
      icon: <TagIcon className="h-5 w-5" />,
    },
    {
      name: "Members",
      path: "/dashboard/member",
      roles: ["admin"],
      icon: <RiTeamLine className="h-5 w-5" />,
    },
    {
      name: "Ledger",
      path: "/dashboard/ledger",
      roles: ["admin", "cashier"],
      icon: <BookOpen className="h-5 w-5" />,
    },
    
  ];

  // ...existing code...

  // ...existing code...

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Store functions removed

  return (
    <div className="flex min-h-screen bg-[#F4F9F9]">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#1C3333] text-[#F4F9F9] border-r border-[#F4F9F9]/20 shadow-lg transition-[width] duration-300 z-40 
        flex flex-col
        ${isOpen ? "w-72" : "w-20"}`}
      >
        {/* Sidebar Header */}
        <div className="flex mt-6 items-center justify-between px-4 py-4 border-b border-[#F4F9F9]/20">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F4F9F9] text-[#1C3333] flex items-center justify-center font-bold shadow-md cursor-pointer">
                {user?.fullname?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.fullname}</p>
                <p className="text-xs text-[#F4F9F9]/70">
                  {user?.role.toUpperCase()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md cursor-pointer hover:bg-[#F4F9F9]/20 transition-all duration-200"
          >
            {isOpen ? (
              <XMarkIcon className="h-5 w-5 text-[#F4F9F9]" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-[#F4F9F9]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-1 overflow-y-auto flex-1">
          <p
            className={`px-3 text-xs uppercase text-[#F4F9F9]/50 mb-2 ${
              !isOpen && "hidden"
            }`}
          >
            Main
          </p>

          {navItems
            .filter(item => item.roles.includes(user?.role))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={!isOpen ? item.name : ""}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-[#F4F9F9] text-[#1C3333] shadow-md border-l-4"
                        : "text-[#F4F9F9] hover:bg-[#F4F9F9]/20"
                    }`}
                >
                  <span className={`${isActive ? "text-[#1C3333]" : "text-[#F4F9F9]"}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer with Logout */}
        <div className="border-t border-[#F4F9F9]/20 px-3 py-4 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              {isOpen && (
                <div>
                  <p className="font-medium truncate text-sm">{user?.fullname}</p>
                  <p className="text-xs text-[#F4F9F9]/60">{user?.role?.toUpperCase()}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <BiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-72" : "ml-20"
        }`}
      >
        <div className="p-6">
          {/* If children are passed, render them, otherwise render Outlet for nested routes */}
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}