import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/apiError";
import { fetchProducts, fetchCategories } from "@/lib/api";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";
import { LoadingState, ErrorState } from "@/components/feedback/AsyncState";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const hasFilters = Boolean(search || categoryId);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(response, "Failed to load categories")
          );
        }
        return response.json();
      })
      .then((data: Category[]) => setCategories(data))
      .catch(() => {
        // Categories are optional for rendering product results.
        // Keep page usable even if category fetch fails.
      });
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    let active = true;
    setIsLoadingProducts(true);
    setProductsError(null);

    fetchProducts({ search: search || undefined, category_id: categoryId })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(response, "Failed to load products")
          );
        }
        return response.json();
      })
      .then((data: Product[]) => {
        if (!active) return;
        setProducts(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setProductsError(
          error instanceof Error ? error.message : "Failed to load products"
        );
        setProducts([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [search, categoryId, reloadToken]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
  };

  const retryProducts = () => {
    setReloadToken((prev) => prev + 1);
  };

  return (
    <div>
      {/* Filters bar — matches CatalogFilters layout */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <label className="mb-1.5 block text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="sm:min-w-[180px]">
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear + New Product */}
        <div className="flex items-end gap-2">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}

          <Link
            to="/products/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#2E3330] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3a3f3c]"
          >
            <Plus className="h-4 w-4" />
            New Product
          </Link>
        </div>
      </div>

      {/* Result count */}
      {isLoadingProducts ? (
        <LoadingState />
      ) : productsError ? (
        <ErrorState message={productsError} onRetry={retryProducts} />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {products.length} result{products.length !== 1 ? "s" : ""} found
          </p>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm">
                Try adjusting the search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
