import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createProduct, fetchCategories } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Category } from "@/types";
import ProductForm from "@/components/product-form/ProductForm";
import type { CreateProductPayload } from "@/lib/validation";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, "Failed to load categories"));
        }
        return response.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load categories");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (payload: CreateProductPayload) => {
    const response = await createProduct(payload);
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to create product"));
    }
    const created = (await response.json()) as { id: number };
    navigate(`/products/${created.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }
  
  return (
    <div>
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Create New Product
      </h1>

      <ProductForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}
