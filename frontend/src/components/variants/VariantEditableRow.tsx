import { useState } from "react";
import { Pencil, Save, X, Package } from "lucide-react";
import type { Variant } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

interface VariantPatch {
    price_cents: number;
    inventory_count: number;
}

interface Props {
    variant: Variant;
    onSave: (variantId: number, patch: VariantPatch) => Promise<void>;
}

function isPositiveInt(value: string): boolean {
    return /^\d+$/.test(value.trim());
}

export default function VariantEditableRow({ variant, onSave }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [priceInput, setPriceInput] = useState(String(variant.price_cents));
    const [inventoryInput, setInventoryInput] = useState(
        String(variant.inventory_count)
    );
    const [error, setError] = useState<string | null>(null);
    const lowStock = variant.inventory_count > 0 && variant.inventory_count <= 10;
    const outOfStock = variant.inventory_count === 0;

    const resetForm = () => {
        setPriceInput(String(variant.price_cents));
        setInventoryInput(String(variant.inventory_count));
        setError(null);
    };

    const cancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const submit = async () => {
        setError(null);

        if (!isPositiveInt(priceInput)) {
            setError("Price must be a non-negative integer");
            return;
        }
        if (!isPositiveInt(inventoryInput)) {
            setError("Inventory must be a non-negative integer");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(variant.id, {
                price_cents: Number(priceInput),
                inventory_count: Number(inventoryInput),
            });
            setIsEditing(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update variant");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <tr className="border-b transition-colors hover:bg-muted/50">
            <td className="p-4 align-middle font-mono text-xs">{variant.sku}</td>
            <td className="p-4 align-middle font-medium">{variant.name}</td>

            <td className="p-4 text-right align-middle tabular-nums">
                {isEditing ? (
                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="h-8 w-28 rounded-md border px-2 text-right"
                    />
                ) : (
                    formatPrice(variant.price_cents)
                )}
            </td>

            <td className="p-4 text-right align-middle tabular-nums">
                {isEditing ? (
                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={inventoryInput}
                        onChange={(e) => setInventoryInput(e.target.value)}
                        className="h-8 w-28 rounded-md border px-2 text-right"
                    />
                ) : (
                    <span
                        className={cn(
                            outOfStock && "text-destructive",
                            lowStock && "text-amber-600"
                        )}
                    >
                        {variant.inventory_count}
                        {outOfStock && (
                            <Package className="ml-1 inline h-3.5 w-3.5 text-destructive/60" />
                        )}
                    </span>
                )}
            </td>

            <td className="p-4 text-right align-middle">
                {isEditing ? (
                    <div className="inline-flex items-center gap-2">
                        <button
                            onClick={submit}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-3 w-3" />
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={cancel}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium"
                        >
                            <X className="h-3 w-3" />
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsEditing(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Pencil className="h-3 w-3" />
                        Edit
                    </button>
                )}

                {error && (
                    <p className="mt-1 text-right text-xs text-destructive">{error}</p>
                )}
            </td>
        </tr>
    );
}