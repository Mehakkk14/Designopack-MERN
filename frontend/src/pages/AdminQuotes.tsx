import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, auth } from "@/lib/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getQuoteRequests,
  updateQuoteStatus,
  deleteQuoteRequest,
  subscribeToQuoteRequests,
  QuoteRequest
} from "@/lib/api";
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  Package,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Building
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminQuotes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteRequest[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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
      
      // Set up real-time listener for quotes
      const unsubscribeQuotes = subscribeToQuoteRequests((quotes) => {
        setQuotes(quotes);
      });

      // Cleanup function for quotes listener
      return () => {
        if (unsubscribeQuotes) {
          unsubscribeQuotes();
        }
      };
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let filtered = quotes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        quote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.companyName && quote.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (quote.product && quote.product.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(quote => quote.status === filterStatus);
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchQuery, filterStatus]);

  const handleStatusUpdate = async (id: string, newStatus: QuoteRequest['status']) => {
    const result = await updateQuoteStatus(id, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: "Quote status updated successfully",
      });
      // No need to reload since we have real-time updates
    } else {
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuote = async (id: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete the quote request from ${customerName}? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteQuoteRequest(id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Quote request deleted successfully",
      });
      // No need to reload since we have real-time updates
    } else {
      toast({
        title: "Error", 
        description: "Failed to delete quote request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'quoted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'closed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />;
      case 'contacted':
        return <Clock className="w-4 h-4" />;
      case 'quoted':
        return <Eye className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const openQuoteDetail = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setIsDetailModalOpen(true);
    // If the quote is new, mark it as contacted (so it is removed from New Requests count)
    if (quote.status === 'new' && quote.id) {
      handleStatusUpdate(quote.id, 'contacted');
    }
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

  const statsData = [
    {
      title: "Total Requests",
      value: quotes.length,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "New Requests",
      value: quotes.filter(q => q.status === 'new').length,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quote Requests</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage customer quote requests and inquiries</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        <Card>
          <CardHeader>
            <CardTitle>All Quote Requests ({filteredQuotes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 text-lg">
                  {quotes.length === 0 ? "No quote requests yet" : "No quotes match your filters"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {quotes.length === 0 
                    ? "Quote requests will appear here when customers submit them" 
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openQuoteDetail(quote)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg truncate">{quote.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{quote.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span>{quote.phone}</span>
                            </div>
                            {quote.companyName && (
                              <div className="flex items-center gap-1 truncate">
                                <Building className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                <span className="truncate">{quote.companyName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuoteDetail(quote);
                            }}
                            className="flex items-center gap-2 text-xs md:text-sm px-2 md:px-3"
                          >
                            Read
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuote(quote.id!, quote.name);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 md:px-3"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                      </div>
                    </div>

                    {quote.product && (
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-600 truncate">Product: {quote.product}</span>
                      </div>
                    )}

                    <p className="text-gray-700 text-xs md:text-sm line-clamp-2 mb-3">
                      {quote.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {quote.createdAt?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quote Request Details</DialogTitle>
            </DialogHeader>
            {selectedQuote && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedQuote.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedQuote.status)} mt-1`}>
                      {getStatusIcon(selectedQuote.status)}
                      {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-gray-900">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-gray-900">{selectedQuote.phone}</p>
                  </div>
                  {selectedQuote.companyName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company</Label>
                      <p className="text-gray-900">{selectedQuote.companyName}</p>
                    </div>
                  )}
                  {selectedQuote.product && (
                    <div className={selectedQuote.companyName ? "col-span-1" : "col-span-2"}>
                      <Label className="text-sm font-medium text-gray-500">Product Interest</Label>
                      <p className="text-gray-900">{selectedQuote.product}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Request Date</Label>
                    <p className="text-gray-900">
                      {selectedQuote.createdAt?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Message</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedQuote.message}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      if (selectedQuote?.id) {
                        // Confirm from modal as well
                        if (confirm(`Are you sure you want to delete the quote request from ${selectedQuote.name}? This action cannot be undone.`)) {
                          handleDeleteQuote(selectedQuote.id, selectedQuote.name);
                          setIsDetailModalOpen(false);
                        }
                      }
                    }}
                  >
                    Delete
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

export default AdminQuotes;
