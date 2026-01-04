import { Layout } from "@/components/layout/Layout";
import { useMovements } from "@/hooks/use-movements";
import { useProducts } from "@/hooks/use-products";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function History() {
  const { data: movements, isLoading } = useMovements();
  const { data: products } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const getProductName = (id: number) => {
    return products?.find(p => p.id === id)?.name || "Unknown Product";
  };

  const filteredMovements = movements?.filter(m => {
    const productName = getProductName(m.productId).toLowerCase();
    return productName.includes(searchTerm.toLowerCase());
  })?.reverse() || []; // Show newest first

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Movement History</h2>
          <p className="text-slate-500">Track all stock entries and exits.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by product name..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredMovements.length === 0 ? (
             <div className="text-center py-12 text-slate-500">
               No movements found.
             </div>
          ) : (
            filteredMovements.map((movement) => (
              <div 
                key={movement.id} 
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${movement.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {movement.type === 'IN' ? (
                      <ArrowUpCircle className="h-6 w-6" />
                    ) : (
                      <ArrowDownCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{getProductName(movement.productId)}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(movement.date || ""), "PPP p")}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <StatusBadge status={movement.type === 'IN' ? 'success' : 'warning'}>
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity} Units
                  </StatusBadge>
                  <p className="text-xs text-slate-400 mt-1">
                    {movement.type === 'IN' ? 'Stock Entry' : 'Stock Exit'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
