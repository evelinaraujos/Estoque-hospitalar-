import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMovementSchema, type InsertMovement, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMovement } from "@/hooks/use-movements";
import { useState } from "react";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useProducts } from "@/hooks/use-products";

interface MovementModalProps {
  type: "IN" | "OUT";
  preSelectedProduct?: Product;
  trigger?: React.ReactNode;
}

export function MovementModal({ type, preSelectedProduct, trigger }: MovementModalProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateMovement();
  const { data: products } = useProducts();

  const form = useForm<InsertMovement>({
    resolver: zodResolver(insertMovementSchema),
    defaultValues: {
      type: type,
      productId: preSelectedProduct?.id || 0,
      quantity: 1,
    },
  });

  const onSubmit = async (data: InsertMovement) => {
    try {
      await createMutation.mutateAsync(data);
      setOpen(false);
      form.reset({
        type: type,
        productId: preSelectedProduct?.id || 0,
        quantity: 1,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const isPending = createMutation.isPending;
  const isEntry = type === "IN";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant={isEntry ? "default" : "secondary"}
            className={isEntry ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isEntry ? <ArrowUpCircle className="mr-2 h-4 w-4" /> : <ArrowDownCircle className="mr-2 h-4 w-4" />}
            {isEntry ? "Stock Entry" : "Stock Exit"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEntry 
              ? <ArrowUpCircle className="text-green-600 h-6 w-6" />
              : <ArrowDownCircle className="text-amber-600 h-6 w-6" />
            }
            {isEntry ? "Register Stock Entry" : "Register Stock Exit"}
          </DialogTitle>
          <DialogDescription>
            {isEntry 
              ? "Add items to your inventory."
              : "Remove items from your inventory."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Product Selection (if not pre-selected) */}
            {!preSelectedProduct && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} ({p.quantity} {p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {preSelectedProduct && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500">Product</p>
                <p className="font-medium text-slate-900">{preSelectedProduct.name}</p>
                <p className="text-xs text-slate-500 mt-1">Current Stock: {preSelectedProduct.quantity} {preSelectedProduct.unit}</p>
              </div>
            )}

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to {isEntry ? "Add" : "Remove"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className={isEntry ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700 text-white"}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm {isEntry ? "Entry" : "Exit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
