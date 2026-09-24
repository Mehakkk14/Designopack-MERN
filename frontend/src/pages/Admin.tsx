import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, auth } from "@/lib/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts, getQuoteRequests, getBanners, Product, QuoteRequest, Banner } from "@/lib/api";
import { Package, MessageSquare, Image } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
      loadData();
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    const productsResult = await getProducts();
    if (productsResult.success) {
      setProducts(productsResult.products);
    }

    const quotesResult = await getQuoteRequests();
    if (quotesResult.success) {
      setQuotes(quotesResult.quotes);
    }

    const bannersResult = await getBanners();
    if (bannersResult.success) {
      setBanners(bannersResult.banners);
    }
  };

  const newQuotes = quotes.filter(q => q.status === 'new').length;
  const totalBanners = banners.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Quote Requests",
      value: quotes.length,
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      badge: newQuotes > 0 ? `${newQuotes} new` : null
    },
    {
      title: "Home Banners",
      value: totalBanners,
      icon: Image,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 text-white shadow-xl">
          <h2 className="text-3xl font-bold">Welcome back, Admin! 👋</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 border-gray-200 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`} size={24} />
                    </div>
                    {stat.badge && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full animate-pulse">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Products</span>
                <span className="text-sm font-normal text-gray-500">
                  {products.length} total
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500">No products yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Add your first product to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                    >
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {(product.categories || []).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quotes */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Quote Requests</span>
                <span className="text-sm font-normal text-gray-500">
                  {quotes.length} total
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500">No quote requests yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Quote requests will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.slice(0, 5).map((quote) => (
                    <div
                      key={quote.id}
                      className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {quote.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {quote.email}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          quote.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : quote.status === "contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {quote.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {quote.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
