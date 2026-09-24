import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, auth } from "@/lib/authService";
import { logger } from "@/lib/logger";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getPrimaryProductImage,
  getProductMedia,
  Product,
  Category,
  ProductImage,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/image-upload";

type ProductFormData = {
  name: string;
  categories: string[];
  description: string;
  media: ProductImage[];
  price?: number;
  displayOrder?: number;
};

const createEmptyMediaSlots = (): ProductImage[] =>
  Array.from({ length: 3 }, () => ({ imageUrl: "", description: "" }));

const createBlankFormData = (): ProductFormData => ({
  name: "",
  categories: [],
  description: "",
  media: createEmptyMediaSlots(),
  price: undefined,
  displayOrder: undefined,
});

const MAX_SAVE_IMAGE_DIMENSION = 960;
const SAVE_WEBP_QUALITY = 0.7;

const compressDataUrlImage = (imageUrl: string) => {
  if (!imageUrl.startsWith("data:image/")) {
    return Promise.resolve(imageUrl);
  }

  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(
        1,
        MAX_SAVE_IMAGE_DIMENSION / Math.max(image.width, image.height),
      );

      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Unable to process image"));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", SAVE_WEBP_QUALITY));
    };

    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = imageUrl;
  });
};

const AdminProducts = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newlyAddedProductId, setNewlyAddedProductId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>(
    createBlankFormData(),
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
      await loadProducts();
      await loadCategories();
    });

    return () => unsubscribe();
  }, [navigate]);

  const legacyCategoryNameMap: Record<string, string> = {
    "Restaurant and Bar Amenities": "Restaurant and Bar Menu",
    "Bathroom Equipments": "Bathroom Amenities",
  };

  const normalizeCategories = (categoryList: string[]) => {
    return categoryList
      .map((category) => legacyCategoryNameMap[category] || category)
      .filter((category, index, list) => list.indexOf(category) === index);
  };

  const getNextDisplayOrder = (categoryName: string) => {
    const categoryProducts = products.filter((product) =>
      product.categories?.includes(categoryName),
    );

    if (categoryProducts.length === 0) {
      return 1;
    }

    const displayOrders = categoryProducts
      .map((product) => Number(product.displayOrder || 0))
      .filter((displayOrder) => displayOrder > 0);

    if (displayOrders.length === 0) {
      return categoryProducts.length + 1;
    }

    return Math.max(...displayOrders) + 1;
  };

  const buildEditableMedia = (product: Product) => {
    const slots = createEmptyMediaSlots();
    getProductMedia(product)
      .slice(0, 3)
      .forEach((media, index) => {
        slots[index] = {
          imageUrl: media.imageUrl,
          description: media.description || "",
        };
      });

    return slots;
  };

  const loadProducts = async () => {
    logger.emoji.loading("AdminProducts: Loading products...");
    try {
      const result = await getProducts();
      if (!result.success) {
        logger.emoji.error(
          "AdminProducts: Failed to load products:",
          result.error,
        );
        return;
      }

      const normalizedProducts = result.products.map((product) => ({
        ...product,
        categories: normalizeCategories(product.categories || []),
      }));

      logger.emoji.success(
        "AdminProducts: Products loaded successfully:",
        normalizedProducts,
      );
      setProducts(normalizedProducts);

      const productsNeedingCleanup = result.products.filter(
        (product, index) => {
          const originalCategories = product.categories || [];
          const cleanedCategories = normalizedProducts[index].categories || [];

          return (
            cleanedCategories.length !== originalCategories.length ||
            cleanedCategories.some(
              (category, itemIndex) =>
                category !== originalCategories[itemIndex],
            )
          );
        },
      );

      if (productsNeedingCleanup.length > 0) {
        await Promise.all(
          productsNeedingCleanup.map((product, index) =>
            updateProduct(product.id!, {
              categories: normalizedProducts[index].categories,
            }),
          ),
        );
        logger.emoji.success(
          "AdminProducts: Cleaned legacy category tags:",
          productsNeedingCleanup.length,
        );
      }
    } catch (error) {
      logger.emoji.error("AdminProducts: Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const loadCategories = async () => {
    logger.emoji.loading("AdminProducts: Loading categories...");
    try {
      const result = await getCategories();
      if (result.success) {
        logger.emoji.success(
          "AdminProducts: Categories loaded successfully:",
          result.categories,
        );
        setCategories(result.categories);
      } else {
        logger.emoji.error(
          "AdminProducts: Failed to load categories:",
          result.error,
        );
      }
    } catch (error) {
      logger.emoji.error("AdminProducts: Error loading categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.categories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    try {
      logger.emoji.loading("AdminProducts: Submitting product data:", formData);

      const media = (
        await Promise.all(
          formData.media.map(async (item) => {
            const imageUrl = item.imageUrl.trim();
            if (!imageUrl) {
              return null;
            }

            return {
              imageUrl: await compressDataUrlImage(imageUrl),
              description: item.description?.trim() || "",
            };
          }),
        )
      ).filter(
        (item): item is { imageUrl: string; description: string } => !!item,
      );

      if (!formData.name || media.length === 0) {
        throw new Error("Missing required fields");
      }

      const cleanedCategories = normalizeCategories(formData.categories);

      const productData: Partial<Product> = {
        name: formData.name,
        categories: cleanedCategories,
        description: formData.description.trim() || undefined,
        imageUrl: media[0].imageUrl,
        media: media.map((item) => ({
          imageUrl: item.imageUrl,
          ...(item.description ? { description: item.description } : {}),
        })),
        inStock: true,
      };

      if (formData.price && formData.price > 0) {
        productData.price = formData.price;
      }

      if (
        formData.displayOrder !== undefined &&
        formData.displayOrder !== null
      ) {
        productData.displayOrder = formData.displayOrder;
      }

      logger.emoji.loading("AdminProducts: Final product data:", productData);

      if (editingProduct?.id) {
        logger.emoji.loading(
          "AdminProducts: Updating existing product:",
          editingProduct.id,
        );
        const result = await updateProduct(editingProduct.id, productData);
        logger.emoji.success("AdminProducts: Product update result:", result);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        setNewlyAddedProductId(editingProduct.id);
      } else {
        logger.emoji.loading("AdminProducts: Adding new product");
        const result = await addProduct(productData as Product);
        logger.emoji.success("AdminProducts: Product add result:", result);
        if (!result.success) {
          throw new Error(result.error || "Failed to add product");
        }

        if (result.id) {
          setNewlyAddedProductId(result.id);
        }

        toast({ title: "Success", description: "Product added successfully" });
      }

      resetForm();
      setIsDialogOpen(false);

      logger.emoji.loading("AdminProducts: Reloading products after save...");
      await loadProducts();
      setTimeout(() => setNewlyAddedProductId(null), 1200);
    } catch (error) {
      logger.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    const primaryCategory = product.categories?.[0] || "all";
    setEditingProduct(product);
    setSelectedCategory(primaryCategory);
    setFormData({
      name: product.name,
      categories: product.categories || [],
      description: product.description || "",
      media: buildEditableMedia(product),
      price: product.price && product.price > 0 ? product.price : undefined,
      displayOrder: product.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      toast({ title: "Success", description: "Product deleted successfully" });
      await loadProducts();
    } catch (error) {
      logger.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData(createBlankFormData());
    setEditingProduct(null);
  };

  const handleAddProductClick = () => {
    if (selectedCategory === "all") {
      toast({
        title: "Select a category",
        description: "Choose a category first before adding a product.",
      });
      return;
    }

    setFormData({
      ...createBlankFormData(),
      categories: normalizeCategories([selectedCategory]),
      displayOrder: getNextDisplayOrder(selectedCategory),
    });
    setIsDialogOpen(true);
  };

  const visibleProducts = products
    .filter((product) => {
      if (selectedCategory === "all") {
        return false;
      }

      return product.categories?.includes(selectedCategory);
    })
    .filter((product) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query) ||
        getProductMedia(product).some((media) =>
          (media.description || "").toLowerCase().includes(query),
        );

      return matchesSearch;
    })
    .sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name);
    });

  logger.debug("AdminProducts filter state:", {
    selectedCategory,
    searchQuery,
    totalProducts: products.length,
    filteredProducts: visibleProducts.length,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                logger.emoji.loading("Manual refresh triggered");
                loadProducts();
              }}
            >
              Refresh
            </Button>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600"
                  onClick={handleAddProductClick}
                  disabled={selectedCategory === "all"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedCategory === "all"
                      ? "Pick a category first"
                      : editingProduct
                        ? "Update product information"
                        : `Add a new product inside ${selectedCategory}`}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Categories *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-md bg-gray-50">
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={cat.id}
                              checked={formData.categories.includes(cat.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    categories: normalizeCategories([
                                      ...formData.categories,
                                      cat.name,
                                    ]),
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    categories: formData.categories.filter(
                                      (category) => category !== cat.name,
                                    ),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={cat.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {cat.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.categories.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          Please select at least one category
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="price">Price (Optional)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="Leave empty if no price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="Lower numbers appear first"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Order is applied within the selected category.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">
                        Product Images *
                      </Label>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {formData.media.map((mediaItem, index) => (
                          <div
                            key={index}
                            className="space-y-3 rounded-lg border p-4"
                          >
                            <ImageUpload
                              label={`Image ${index + 1}`}
                              value={mediaItem.imageUrl}
                              onChange={(url) => {
                                const nextMedia = [...formData.media];
                                nextMedia[index] = {
                                  ...nextMedia[index],
                                  imageUrl: url,
                                };
                                setFormData({ ...formData, media: nextMedia });
                              }}
                              required={index === 0}
                            />
                            <div>
                              <Label htmlFor={`media-description-${index}`}>
                                Description (Optional)
                              </Label>
                              <Textarea
                                id={`media-description-${index}`}
                                value={mediaItem.description || ""}
                                onChange={(e) => {
                                  const nextMedia = [...formData.media];
                                  nextMedia[index] = {
                                    ...nextMedia[index],
                                    description: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    media: nextMedia,
                                  });
                                }}
                                placeholder="Add a short description for this image"
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">
                        Product Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Optional overall product description"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600"
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className={`text-left rounded-xl border p-4 transition-all ${
              selectedCategory === "all"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white hover:border-gray-400"
            }`}
          >
            <p className="text-sm opacity-80">Overview</p>
            <p className="text-lg font-semibold mt-1">All Categories</p>
            <p className="text-sm mt-2 opacity-80">
              {products.length} products
            </p>
          </button>

          {categories.map((cat) => {
            const productCount = products.filter((product) =>
              product.categories?.includes(cat.name),
            ).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  selectedCategory === cat.name
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg font-semibold mt-1">{cat.name}</p>
                <p className="text-sm mt-2 text-gray-500">
                  {productCount} products
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={
                selectedCategory === "all"
                  ? "Select a category to search products"
                  : "Search products in this category..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={selectedCategory === "all"}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            disabled={selectedCategory === "all" || !searchQuery}
          >
            Clear
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <span className="font-medium">ℹ️ Products are sorted by:</span>{" "}
            display order within the selected category
          </div>

          {selectedCategory === "all" ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a category
              </h3>
              <p className="text-gray-500">
                Choose a category above to manage its products and display
                order.
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by adding your first product"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={
                      newlyAddedProductId === product.id
                        ? "animate-new-product"
                        : ""
                    }
                  >
                    <TableCell>
                      <img
                        src={getPrimaryProductImage(product)}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(product.categories || []).map((cat, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.price && product.price > 0
                        ? `₹${product.price}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-purple-600">
              {products.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
            <p className="text-sm text-gray-600">Categories Used</p>
            <p className="text-2xl font-bold text-orange-600">
              {
                new Set(products.flatMap((product) => product.categories || []))
                  .size
              }
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
