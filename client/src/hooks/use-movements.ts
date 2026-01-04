import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMovement } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMovements() {
  return useQuery({
    queryKey: [api.movements.list.path],
    queryFn: async () => {
      const res = await fetch(api.movements.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch movements");
      return api.movements.list.responses[200].parse(await res.json());
    },
  });
}

export function useProductMovements(productId: number) {
  return useQuery({
    queryKey: [api.movements.byProduct.path, productId],
    queryFn: async () => {
      const url = buildUrl(api.movements.byProduct.path, { id: productId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch product movements");
      return api.movements.byProduct.responses[200].parse(await res.json());
    },
    enabled: !!productId,
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMovement) => {
      const res = await fetch(api.movements.create.path, {
        method: api.movements.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to record movement");
      }
      return api.movements.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both products (stock levels changed) and movements history
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.movements.list.path] });
      toast({ title: "Success", description: "Stock movement recorded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
