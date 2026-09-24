import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  BedDouble,
  Monitor,
  Lamp,
  Coffee,
  UtensilsCrossed,
  Bath,
  Gift,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCategories, Category } from "@/lib/api";
import { logger } from "@/lib/logger";

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    logger.emoji.loading("🔄 Products: Loading categories...");
    try {
      const result = await getCategories();
      if (result.success) {
        logger.emoji.loading(
          "✅ Products: Categories loaded successfully:",
          result.categories,
        );
        setCategories(result.categories);
      } else {
        logger.emoji.error(
          "❌ Products: Failed to load categories:",
          result.error,
        );
      }
    } catch (error) {
      logger.emoji.error("❌ Products: Error loading categories:", error);
    }
    setLoading(false);
  };

  const normalizeCategoryName = (name: string) => name.trim().toUpperCase();

  const categoryDisplayNameMap: { [key: string]: string } = {
    "IN-ROOM ACCESSORIES": "Room Amenities",
    "ROOM AMENITIES": "Room Amenities",
    "BATHROOM ACCESSORIES": "Bathroom Amenities",
    "BATHROOM AMENITIES": "Bathroom Amenities",
    GIFTING: "Gifting",
    "FOOD PACKAGING": "Food Packaging",
    "RESTAURANT & BAR ACCESSORIES": "Restaurant and Bar Menu",
    "RESTAURANT AND BAR AMENITIES": "Restaurant and Bar Menu",
    "RESTAURANT AND BAR MENU": "Restaurant and Bar Menu",
    "DESK ACCESSORIES": "Desk Accessories",
    "NIGHTSTAND ACCESSORIES": "Nightstand Accessories",
    "MINI BAR TABLETOP ACCESSORIES": "Mini Bar Tabletop Accessories",
  };

  // Icon mapping for categories
  const categoryIconMap: Record<string, LucideIcon> = {
    "IN-ROOM ACCESSORIES": BedDouble,
    "ROOM AMENITIES": BedDouble,
    "BATHROOM ACCESSORIES": Bath,
    "BATHROOM AMENITIES": Bath,
    GIFTING: Gift,
    "FOOD PACKAGING": Package,
    "RESTAURANT & BAR ACCESSORIES": UtensilsCrossed,
    "RESTAURANT AND BAR AMENITIES": UtensilsCrossed,
    "RESTAURANT AND BAR MENU": UtensilsCrossed,
    "DESK ACCESSORIES": Monitor,
    "NIGHTSTAND ACCESSORIES": Lamp,
    "MINI BAR TABLETOP ACCESSORIES": Coffee,
  };

  // Category images mapping - Using actual product images from Home page
  const categoryImageMap: { [key: string]: string } = {
    "IN-ROOM ACCESSORIES":
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    "ROOM AMENITIES":
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    "BATHROOM ACCESSORIES": "/bathroom-equipment.webp",
    "BATHROOM AMENITIES": "/bathroom-equipment.webp",
    GIFTING: "/gifting-solutions.webp",
    "FOOD PACKAGING": "/food-packaging.webp",
    "RESTAURANT & BAR ACCESSORIES": "/restaurant.webp",
    "RESTAURANT AND BAR AMENITIES": "/restaurant.webp",
    "RESTAURANT AND BAR MENU": "/restaurant.webp",
    "DESK ACCESSORIES":
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    "NIGHTSTAND ACCESSORIES":
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    "MINI BAR TABLETOP ACCESSORIES":
      "https://images.unsplash.com/photo-1608270861620-7c80b239cc3d?w=800&q=80",
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
            Our Products
          </h1>
          <p className="text-xl text-white/90 font-body max-w-2xl mx-auto animate-slide-up">
            Explore our comprehensive range of premium hospitality and packaging
            solutions
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
              <p className="text-foreground text-lg font-body">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Package
                className="mx-auto mb-4 text-muted-foreground"
                size={48}
              />
              <p className="text-foreground text-lg font-body">
                No categories available
              </p>
              <p className="text-sm text-muted-foreground font-body mt-2">
                Categories will be added by the admin
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 max-w-3xl mx-auto">
              {categories.map((category, index) => {
                const normalizedName = normalizeCategoryName(category.name);
                const displayName =
                  categoryDisplayNameMap[normalizedName] || category.name;
                const Icon = categoryIconMap[normalizedName] || Package;
                const imageUrl =
                  categoryImageMap[normalizedName] ||
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";
                const isLastOdd =
                  index === categories.length - 1 &&
                  categories.length % 2 === 1;

                return (
                  <div
                    key={category.id}
                    className={
                      isLastOdd
                        ? "w-full md:col-start-1 md:col-end-3 md:w-1/2 md:mx-auto"
                        : "w-full"
                    }
                  >
                    <Link
                      to={`/products/${encodeURIComponent(category.name)}`}
                      className="group animate-scale-in w-full block"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <Card className="h-full overflow-hidden hover-lift border-2 hover:border-primary transition-all duration-300">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            loading="lazy"
                            decoding="async"
                            width={600}
                            height={224}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <Icon className="text-primary mb-2" size={32} />
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-heading font-semibold text-base group-hover:text-primary transition-colors text-foreground line-clamp-2">
                            {displayName}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
