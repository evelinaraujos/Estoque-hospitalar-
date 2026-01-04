import { useProducts } from "@/hooks/use-products";
import { useMovements } from "@/hooks/use-movements";
import { Layout } from "@/components/layout/Layout";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  ArrowRight
} from "lucide-react";
import { differenceInDays, parseISO, isPast } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: movements, isLoading: loadingMovements } = useMovements();

  if (loadingProducts || loadingMovements) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mt-8" />
      </Layout>
    );
  }

  const allProducts = products || [];
  const allMovements = movements || [];

  // Metrics
  const totalProducts = allProducts.length;
  const lowStock = allProducts.filter(p => p.quantity < 10);
  const expired = allProducts.filter(p => p.expirationDate && isPast(parseISO(String(p.expirationDate))));
  const expiringSoon = allProducts.filter(p => {
    if (!p.expirationDate) return false;
    const days = differenceInDays(parseISO(String(p.expirationDate)), new Date());
    return days >= 0 && days <= 30;
  });

  // Recent Movements for Chart (last 7 entries)
  const recentMovements = allMovements.slice(0, 7).reverse().map(m => ({
    name: new Date(m.date || "").toLocaleDateString(),
    quantity: m.quantity,
    type: m.type
  }));

  const StatsCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="glass-card p-6 rounded-2xl flex items-start justify-between card-hover group">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-slate-900 group-hover:scale-105 transition-transform origin-left">
          {value}
        </h3>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
        <Icon className={`h-6 w-6 text-current`} />
      </div>
    </div>
  );

  return (
    <Layout>
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Overview</h2>
        <p className="text-slate-500">Welcome back, Dr. Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Products" 
          value={totalProducts} 
          icon={Package} 
          color="bg-blue-500 text-blue-600"
          subtext="Active inventory items"
        />
        <StatsCard 
          title="Low Stock" 
          value={lowStock.length} 
          icon={TrendingDown} 
          color="bg-amber-500 text-amber-600"
          subtext="Items below 10 units"
        />
        <StatsCard 
          title="Expiring Soon" 
          value={expiringSoon.length} 
          icon={Clock} 
          color="bg-purple-500 text-purple-600"
          subtext="Within 30 days"
        />
        <StatsCard 
          title="Expired" 
          value={expired.length} 
          icon={XCircle} 
          color="bg-red-500 text-red-600"
          subtext="Needs attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Movements</h3>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentMovements}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                  {recentMovements.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'IN' ? '#22c55e' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Attention Required</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {expired.length === 0 && lowStock.length === 0 && expiringSoon.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No alerts. Everything looks good!</p>
              </div>
            )}
            
            {expired.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{item.name}</p>
                  <p className="text-xs text-red-700">Expired on {new Date(item.expirationDate!).toLocaleDateString()}</p>
                </div>
              </div>
            ))}

            {expiringSoon.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                <Clock className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{item.name}</p>
                  <p className="text-xs text-purple-700">Expires in {differenceInDays(parseISO(String(item.expirationDate!)), new Date())} days</p>
                </div>
              </div>
            ))}

            {lowStock.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">{item.name}</p>
                  <p className="text-xs text-amber-700">Only {item.quantity} {item.unit} remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
