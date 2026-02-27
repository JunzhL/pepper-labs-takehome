/**
 * Own create-product form state, validation, and submit orchestration.
 * Renders product fields + dynamic variant rows and emits sanitized payload.
 * Separates form complexity from page-level data fetching/navigation logic.
 */
import { useState } from "react";
import type { Category } from "@/types";
import VariantFields from "./VariantFields";
import {
    type CreateProductPayload,
    type CreateProductFormValues,
    type VariantDraft,
    validateCreateProductForm,
    hasCreateProductErrors,
    toCreateProductPayload,
} from "@/lib/validation";

interface Props {
    categories: Category[];
    onSubmit: (payload: CreateProductPayload) => Promise<void>;
}

function defaultVariant(): VariantDraft {
    return {
        sku: "",
        name: "",
        price_cents: "0",
        inventory_count: "0",
    };
}

export default function ProductForm({ categories, onSubmit }: Props) {
    const [values, setValues] = useState<CreateProductFormValues>({
        name: "",
        description: "",
        category_id: "",
        status: "active",
        variants: [defaultVariant()],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState(() =>
        validateCreateProductForm(values)
    );

    const handleVariantChange = (
        index: number,
        field: keyof VariantDraft,
        value: string
    ) => {
        setValues((prev) => ({
        ...prev,
        variants: prev.variants.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        ),
        }));
    };

    const addVariant = () => {
        setValues((prev) => ({
            ...prev,
            variants: [...prev.variants, defaultVariant()],
        }));
    };

    const removeVariant = (index: number) => {
        setValues((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const nextErrors = validateCreateProductForm(values);
        setErrors(nextErrors);

        if (hasCreateProductErrors(nextErrors)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = toCreateProductPayload(values);
            await onSubmit(payload);
        } catch (error: unknown) {
            setSubmitError(
                error instanceof Error ? error.message : "Failed to create product"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6 rounded-lg border bg-card p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
                <span className="mb-1 block font-medium">Product Name</span>
                <input
                    value={values.name}
                    onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-10 w-full rounded-md border px-3"
                />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </label>

                <label className="text-sm">
                <span className="mb-1 block font-medium">Category</span>
                <select
                    value={values.category_id}
                    onChange={(e) =>
                        setValues((prev) => ({ ...prev, category_id: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border px-3"
                >
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
                value={values.description}
                onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className="w-full rounded-md border px-3 py-2"
            />
            </label>

            <label className="text-sm md:w-56">
                <span className="mb-1 block font-medium">Status</span>
                <select
                    value={values.status}
                    onChange={(e) =>
                    setValues((prev) => ({
                        ...prev,
                        status: e.target.value as CreateProductFormValues["status"],
                    }))
                    }
                    className="h-10 w-full rounded-md border px-3"
                >
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                </select>
            </label>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Variants</h2>
            <button
                type="button"
                onClick={addVariant}
                className="rounded-md border px-3 py-1.5 text-sm font-medium"
            >
                Add Variant
            </button>
            </div>

            {errors.variants && (
            <p className="text-sm text-destructive">{errors.variants}</p>
            )}

            {values.variants.map((variant, index) => (
            <VariantFields
                key={index}
                index={index}
                value={variant}
                errors={errors.variantErrors[index] ?? {}}
                canRemove={values.variants.length > 1}
                onChange={handleVariantChange}
                onRemove={removeVariant}
            />
            ))}
        </div>

        {submitError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
            </p>
        )}

        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center rounded-md bg-[#2E3330] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Creating..." : "Create Product"}
            </button>
        </div>
        </form>
    );
}