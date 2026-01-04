import { Layout } from "@/components/layout/Layout";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { ProductForm } from "@/components/products/ProductForm";
import { MovementModal } from "@/components/products/MovementModal";
import { 
  Search, 
  Trash2, 
  Edit, 
  Filter, 
  MoreHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categories, type Product } from "@shared/schema";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { parseISO, isPast, differenceInDays } from "date-fns";

export default function Inventory() {
  const { data: products, isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter Logic
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const getProductStatus = (p: Product) => {
    if (p.quantity === 0) return { label: "Out of Stock", color: "destructive" as const, icon: XCircle };
    if (p.quantity < 10) return { label: "Low Stock", color: "warning" as const, icon: AlertTriangle };
    if (p.expirationDate && isPast(parseISO(String(p.expirationDate)))) 
      return { label: "Expired", color: "destructive" as const, icon: XCircle };
    if (p.expirationDate && differenceInDays(parseISO(String(p.expirationDate)), new Date()) <= 30)
      return { label: "Expiring", color: "warning" as const, icon: Clock };
    
    return { label: "In Stock", color: "success" as const, icon: null };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Inventory</h2>
          <p className="text-slate-500">Manage your medical supplies and equipment.</p>
        </div>
        <ProductForm />
      </div>

      <div className="glass-card rounded-2xl p-4 md:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">Batch: {product.batch || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium">
                        {product.quantity} <span className="text-slate-400 text-xs font-sans">{product.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={status.color} className="gap-1">
                          {StatusIcon && <StatusIcon className="h-3 w-3" />}
                          {status.label}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {product.expirationDate ? new Date(product.expirationDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(product.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="p-2 flex gap-2">
                              <MovementModal type="IN" preSelectedProduct={product} trigger={
                                <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">IN</Button>
                              } />
                              <MovementModal type="OUT" preSelectedProduct={product} trigger={
                                <Button size="sm" variant="outline" className="w-full text-xs h-8 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 border-amber-200">OUT</Button>
                              } />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal - Conditionally rendered to ensure form resets */}
      {editingProduct && (
        <ProductForm 
          product={editingProduct} 
          open={!!editingProduct} 
          onOpenChange={(open) => !open && setEditingProduct(null)} 
        />
      )}
    </Layout>
  );
}
