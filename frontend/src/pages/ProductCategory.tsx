import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Download, FileText, Sparkles } from "lucide-react";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import {
  getProducts,
  getCategories,
  getProductMedia,
  getPrimaryProductImage,
  Product,
  Category,
} from "@/lib/api";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

const ProductCategory = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    description?: string;
    categories: string[];
    media: ReturnType<typeof getProductMedia>;
  } | null>(null);

  const decodedCategoryName = decodeURIComponent(categoryName || "");

  useEffect(() => {
    loadCategoryData();
  }, [categoryName]);

  const loadCategoryData = async () => {
    logger.emoji.loading(
      "🔄 ProductCategory: Loading products and category info for:",
      categoryName,
    );
    try {
      // Load products and categories in parallel
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (categoriesRes.success) {
        const foundCat = categoriesRes.categories.find(
          (c) => c.name.toLowerCase() === decodedCategoryName.toLowerCase(),
        );
        if (foundCat) {
          setCategoryInfo(foundCat);
        }
      }

      if (productsRes.success) {
        // Ensure displayOrder is a number
        const productsWithOrder = productsRes.products.map((product) => ({
          ...product,
          displayOrder:
            product.displayOrder !== undefined
              ? Number(product.displayOrder)
              : undefined,
        }));

        // Filter by category
        const filteredByCategory = productsWithOrder.filter(
          (p) => p.categories && p.categories.includes(decodedCategoryName),
        );

        // Sort by displayOrder
        const sorted = [...filteredByCategory].sort((a, b) => {
          if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
            return a.displayOrder - b.displayOrder;
          }
          if (a.displayOrder !== undefined) return -1;
          if (b.displayOrder !== undefined) return 1;
          return a.name.localeCompare(b.name);
        });

        setProducts(sorted);
      }
    } catch (error) {
      logger.emoji.error("❌ ProductCategory: Error loading data:", error);
    }
    setLoading(false);
  };

  const handleDownloadCatalogue = () => {
    const rawUrl = categoryInfo?.catalogueUrl?.trim();
    if (rawUrl) {
      if (rawUrl.startsWith("data:")) {
        // Trigger direct download for uploaded base64 PDF file
        const link = document.createElement("a");
        link.href = rawUrl;
        link.download = `${decodedCategoryName.replace(/[^a-zA-Z0-0]/g, "_")}_Catalogue.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(rawUrl, "_blank", "noopener,noreferrer");
      }
      toast({
        title: "Downloading Catalogue",
        description: `Downloading ${decodedCategoryName} catalogue PDF...`,
      });
    } else {
      toast({
        title: "Catalogue Coming Soon",
        description: `The detailed PDF catalogue for ${decodedCategoryName} will be available shortly. Please contact us for a direct quote!`,
      });
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct({
      name: product.name,
      description: product.description,
      categories: product.categories || [],
      media: getProductMedia(product),
    });
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary to-black">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          role="presentation"
          style={{
            backgroundImage: "url('/ourproducts.webp')",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 animate-fade-in">
            {decodedCategoryName}
          </h1>
          <p className="text-xl text-white/90 font-body max-w-2xl mx-auto mb-6 animate-slide-up">
            Discover our premium collection of{" "}
            {decodedCategoryName.toLowerCase()}
          </p>

          {/* Download Catalogue Button */}
          <div className="flex justify-center animate-slide-up">
            <Button
              onClick={handleDownloadCatalogue}
              size="lg"
              className="bg-primary hover:bg-red-900 text-white font-body font-medium shadow-md transition-all duration-300 gap-2 border-none"
            >
              <Download className="w-4 h-4" />
              Download Catalogue
            </Button>
          </div>
        </div>
      </section>

      {/* Back Button and Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <div className="mb-8 flex items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 hover:border-primary hover:text-primary transition-all"
            >
              <ArrowLeft size={18} />
              Back to Categories
            </Button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
              <p className="text-foreground text-lg font-body">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
              />
              <p className="text-foreground text-lg font-body">
                No products in this category
              </p>
              <p className="text-sm text-muted-foreground font-body mt-2">
                Products will be added by the admin
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Card
                  key={product.id || index}
                  className="group overflow-hidden hover-lift animate-scale-in relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image Container */}
                  <div className="relative h-60 overflow-hidden flex items-center justify-center bg-white">
                    <img
                      src={getPrimaryProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={240}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
                      }}
                    />
                    {/* Hover View Details Button */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(product)}
                        className="text-sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-heading font-semibold text-lg text-foreground line-clamp-2">
                      {product.name}
                    </h3>
                    {product.price && product.price > 0 ? (
                      <p className="text-primary font-semibold mt-1">
                        ₹{product.price}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProduct(null);
          }}
          productName={selectedProduct.name}
          productDescription={selectedProduct.description}
          productCategories={selectedProduct.categories}
          productMedia={selectedProduct.media}
        />
      )}
    </div>
  );
};

export default ProductCategory;
