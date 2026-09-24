import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut, auth } from "@/lib/authService";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  Image, 
  Package, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/designopack-logo-black.webp";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Image, label: "Banners", path: "/admin/banners" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Tags, label: "Categories", path: "/admin/categories" },
    { icon: MessageSquare, label: "Quote Requests", path: "/admin/quotes" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out Successfully",
        description: "See you soon!",
      });
      // Clear browser history and redirect to home page
      window.history.replaceState(null, '', '/');
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-xl">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <img 
              src={logo} 
              alt="DesignOPack Admin" 
              className="h-12 w-auto mb-2"
            />
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-left">
              {/* Mobile Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <img 
                    src={logo} 
                    alt="DesignOPack Admin" 
                    className="h-10 w-auto mb-1"
                  />
                  <p className="text-xs text-gray-500 font-medium">
                    Admin Dashboard
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Bottom Actions */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex-1 lg:flex-none">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {menuItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
                </h1>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <div className="text-right mr-3">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{auth.currentUser?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {auth.currentUser?.email?.charAt(0).toUpperCase() || "A"}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
