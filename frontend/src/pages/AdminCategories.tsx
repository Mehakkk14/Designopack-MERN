import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, auth } from "@/lib/authService";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { PdfUpload } from "@/components/ui/pdf-upload";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category
} from "@/lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  X,
  FileText,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminCategories = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    catalogueUrl: "",
    displayOrder: 1,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
      loadCategories();
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadCategories = async () => {
    logger.emoji.loading('AdminCategories: Loading categories...');
    const result = await getCategories();
    if (result.success) {
      logger.emoji.success('AdminCategories: Categories loaded successfully:', result.categories);
      setCategories(result.categories);
    } else {
      logger.emoji.error('AdminCategories: Failed to load categories:', result.error);
      toast({
        title: "Error",
        description: "Failed to load categories. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate names
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    
    if (existingCategory) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const result = await addCategory(newCategory);
    if (result.success) {
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setIsAddModalOpen(false);
      setNewCategory({ name: "", description: "", catalogueUrl: "", displayOrder: 1 });
      loadCategories();
    } else {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate names (excluding current category)
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === editingCategory.name.toLowerCase() && cat.id !== editingCategory.id
    );
    
    if (existingCategory) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const result = await updateCategory(editingCategory.id!, {
      name: editingCategory.name,
      description: editingCategory.description,
      catalogueUrl: editingCategory.catalogueUrl,
      displayOrder: editingCategory.displayOrder,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      loadCategories();
    } else {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      toast({
        title: "Success",
        description: `Category "${categoryName}" deleted successfully`,
      });
      loadCategories();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Manage product categories and upload catalogue PDFs for your website</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., DESK ACCESSORIES"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of this category"
                  />
                </div>
                
                {/* PDF Catalogue File Upload */}
                <PdfUpload
                  value={newCategory.catalogueUrl}
                  onChange={(url) => setNewCategory({ ...newCategory, catalogueUrl: url })}
                  categoryName={newCategory.name || "catalogue"}
                  label="Category Catalogue PDF (Optional)"
                />

                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={newCategory.displayOrder}
                    onChange={(e) => setNewCategory({ ...newCategory, displayOrder: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories with Catalogue</p>
                  <p className="text-3xl font-bold text-green-600">
                    {categories.filter(c => !!c.catalogueUrl?.trim()).length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 text-lg">No categories yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add your first category to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.sort((a, b) => a.displayOrder - b.displayOrder).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {category.catalogueUrl?.trim() ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <FileText className="w-3 h-3" />
                            Catalogue PDF Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            No Catalogue
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Order: {category.displayOrder}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone.
                              Products using this category will need to be updated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id!, category.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="editName">Category Name *</Label>
                  <Input
                    id="editName"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description (Optional)</Label>
                  <Input
                    id="editDescription"
                    value={editingCategory.description || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Brief description of this category"
                  />
                </div>
                
                {/* PDF Catalogue File Upload */}
                <PdfUpload
                  value={editingCategory.catalogueUrl || ""}
                  onChange={(url) => setEditingCategory({ ...editingCategory, catalogueUrl: url })}
                  categoryName={editingCategory.name}
                  label="Category Catalogue PDF (Optional)"
                />

                <div>
                  <Label htmlFor="editDisplayOrder">Display Order</Label>
                  <Input
                    id="editDisplayOrder"
                    type="number"
                    value={editingCategory.displayOrder}
                    onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCategory}>
                    Update Category
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;