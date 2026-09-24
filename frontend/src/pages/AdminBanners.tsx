import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, auth } from "@/lib/authService";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  Banner
} from "@/lib/api";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  X
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
import { ImageUpload } from "@/components/ui/image-upload";

const AdminBanners = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    imageUrl: "",
    isActive: true,
    order: 1,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
      await loadBanners();
      
      // Initialize default banners if none exist
      import("@/lib/api").then(({ initializeDefaultBanners }) => {
        initializeDefaultBanners().then(() => {
          loadBanners(); // Reload banners after initialization
        });
      });
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadBanners = async () => {
    logger.emoji.loading('AdminBanners: Loading banners...');
    const result = await getBanners();
    if (result.success) {
      logger.emoji.success('AdminBanners: Banners loaded successfully:', result.banners);
      setBanners(result.banners);
    } else {
      logger.emoji.error('AdminBanners: Failed to load banners:', result.error);
      toast({
        title: "Error",
        description: "Failed to load banners. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check banner limit
    if (banners.length >= 8) {
      toast({
        title: "Maximum Limit Reached",
        description: "You can only have up to 8 banners. Please delete a banner before adding a new one.",
        variant: "destructive",
      });
      return;
    }

    const result = await addBanner(newBanner);
    if (result.success) {
      toast({
        title: "Success",
        description: "Banner added successfully",
      });
      setIsAddModalOpen(false);
      setNewBanner({ title: "", imageUrl: "", isActive: true, order: 1 });
      loadBanners();
    } else {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : "Failed to add banner. Please check console for details.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      logger.error('Banner add error:', result.error);
    }
  };

  const handleUpdateBanner = async (id: string, updates: Partial<Banner>) => {
    const result = await updateBanner(id, updates);
    if (result.success) {
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      loadBanners();
    } else {
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const result = await deleteBanner(id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      loadBanners();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsEditModalOpen(true);
  };

  const handleUpdateBannerSubmit = async () => {
    if (!editingBanner || !editingBanner.title || !editingBanner.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await updateBanner(editingBanner.id!, {
      title: editingBanner.title,
      imageUrl: editingBanner.imageUrl,
      isActive: editingBanner.isActive,
      order: editingBanner.order,
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      setIsEditModalOpen(false);
      setEditingBanner(null);
      loadBanners();
    } else {
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    await handleUpdateBanner(banner.id!, { isActive: !banner.isActive });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage home page banners (Max 8)</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 w-full sm:w-auto"
                disabled={banners.length >= 8}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Banner {banners.length >= 8 && "(Max)"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Banner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Banner Image"
                    value={newBanner.imageUrl}
                    onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={newBanner.order}
                    onChange={(e) => setNewBanner({ ...newBanner, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="8"
                    placeholder="1-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newBanner.isActive}
                    onCheckedChange={(checked) => setNewBanner({ ...newBanner, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBanner}>
                    Add Banner
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{banners.length}/8</p>
                </div>
                <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Active</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    {banners.filter(b => b.isActive).length}
                  </p>
                </div>
                <Eye className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-500">
                    {banners.filter(b => !b.isActive).length}
                  </p>
                </div>
                <EyeOff className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Slots</p>
                  <p className={`text-2xl md:text-3xl font-bold ${8 - banners.length > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {8 - banners.length}
                  </p>
                </div>
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banners List */}
        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 text-lg">No banners yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add your first banner to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move hidden sm:block flex-shrink-0" />
                    
                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE5VjVDMjEgMy45IDIwLjEgMyAxOSAzSDVDMy45IDMgMyAzLjkgMyA1VjE5QzMgMjAuMSAzLjkgMjEgNSAyMUgxOUMyMC4xIDIxIDIxIDIwLjEgMjEgMTlaIiBzdHJva2U9IiM5Q0E5QjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41IiBzdHJva2U9IiM5Q0E5QjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMSAxNUwxNiAxMEw1IDIxIiBzdHJva2U9IiM5Q0E5QjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{banner.title}</h3>
                      <p className="text-xs md:text-sm text-gray-500">Or {banner.order}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        banner.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(banner)}
                        className="p-2"
                      >
                        {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                        className="p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-2">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBanner(banner.id!)}
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

        {/* Edit Banner Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Banner</DialogTitle>
            </DialogHeader>
            {editingBanner && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Banner Image"
                    value={editingBanner.imageUrl}
                    onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editOrder">Display Order</Label>
                  <Input
                    id="editOrder"
                    type="number"
                    value={editingBanner.order}
                    onChange={(e) => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="8"
                    placeholder="1-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsActive"
                    checked={editingBanner.isActive}
                    onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, isActive: checked })}
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBannerSubmit}>
                    Update Banner
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

export default AdminBanners;