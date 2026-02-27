/**
 * Render one editable variant row in the create-product form.
 * Shows SKU/name/price/inventory fields with per-field validation feedback.
 * Keeps variant UI modular and reusable across create/edit workflows.
 */
import { Trash2 } from "lucide-react";
import type { VariantDraft, VariantFieldErrors } from "@/lib/validation";

interface Props {
    index: number;
    value: VariantDraft;
    errors: VariantFieldErrors;
    canRemove: boolean;
    onChange: (index: number, field: keyof VariantDraft, value: string) => void;
    onRemove: (index: number) => void;
}

export default function VariantFields({
    index,
    value,
    errors,
    canRemove,
    onChange,
    onRemove,
}: Props) {
    return (
        <div className="rounded-md border p-4">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Variant #{index + 1}</h3>
            <button
                type="button"
                disabled={!canRemove}
                onClick={() => onRemove(index)}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
            <Trash2 className="h-3.5 w-3.5" />
                Remove
            </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm">
            <span className="mb-1 block">SKU</span>
            <input
                value={value.sku}
                onChange={(e) => onChange(index, "sku", e.target.value)}
                className="h-10 w-full rounded-md border px-3"
            />
                {errors.sku && <p className="mt-1 text-xs text-destructive">{errors.sku}</p>}
            </label>

            <label className="text-sm">
            <span className="mb-1 block">Variant Name</span>
            <input
                value={value.name}
                onChange={(e) => onChange(index, "name", e.target.value)}
                className="h-10 w-full rounded-md border px-3"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </label>

            <label className="text-sm">
            <span className="mb-1 block">Price (cents)</span>
            <input
                type="number"
                min={0}
                step={1}
                value={value.price_cents}
                onChange={(e) => onChange(index, "price_cents", e.target.value)}
                className="h-10 w-full rounded-md border px-3"
            />
            {errors.price_cents && (
                <p className="mt-1 text-xs text-destructive">{errors.price_cents}</p>
            )}
            </label>

            <label className="text-sm">
            <span className="mb-1 block">Inventory Count</span>
            <input
                type="number"
                min={0}
                step={1}
                value={value.inventory_count}
                onChange={(e) => onChange(index, "inventory_count", e.target.value)}
                className="h-10 w-full rounded-md border px-3"
            />
            {errors.inventory_count && (
                <p className="mt-1 text-xs text-destructive">{errors.inventory_count}</p>
            )}
            </label>
        </div>
        </div>
    );
}