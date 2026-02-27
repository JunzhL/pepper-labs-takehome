/**
 * Client-side validation and payload normalization for create-product form.
 * Validates required fields and converts form strings to API-safe numbers.
 * Improves UX with immediate feedback and keeps form component lean.
 */
export type ProductStatus = "active" | "draft" | "archived";

export interface VariantDraft {
    sku: string;
    name: string;
    price_cents: string;
    inventory_count: string;
}

export interface CreateProductFormValues {
    name: string;
    description: string;
    category_id: string;
    status: ProductStatus;
    variants: VariantDraft[];
}

export interface VariantFieldErrors {
    sku?: string;
    name?: string;
    price_cents?: string;
    inventory_count?: string;
}

export interface CreateProductFormErrors {
    name?: string;
    variants?: string;
    variantErrors: VariantFieldErrors[];
}

export interface CreateProductPayload {
    name: string;
    description: string | null;
    category_id: number | null;
    status: ProductStatus;
    variants: {
        sku: string;
        name: string;
        price_cents: number;
        inventory_count: number;
    }[];
}

function isValidInt(value: string): boolean {
    return /^\d+$/.test(value.trim());
}

export function validateCreateProductForm(values: CreateProductFormValues): CreateProductFormErrors {
    const errors: CreateProductFormErrors = {
        variantErrors: values.variants.map(() => ({})),
    };

    if (!values.name.trim()) {
        errors.name = "Product name is required";
    }

    if (values.variants.length === 0) {
        errors.variants = "At least one variant is required";
        return errors;
    }

    const seenSkus = new Set<string>();

    values.variants.forEach((variant, index) => {
        const variantErrors: VariantFieldErrors = {};
        const sku = variant.sku.trim();
        // Validation Checks:
        if (!sku) {
            variantErrors.sku = "SKU is required";
        } else if (seenSkus.has(sku)) {
            variantErrors.sku = "SKU must be unique";
        } else {
            seenSkus.add(sku);
        }

        if (!variant.name.trim()) {
            variantErrors.name = "Variant name is required";
        }

        if (!isValidInt(variant.price_cents)) {
            variantErrors.price_cents = "Price must be a non-negative integer";
        }

        if (!isValidInt(variant.inventory_count)) {
            variantErrors.inventory_count = "Inventory must be a non-negative integer";
        }

        errors.variantErrors[index] = variantErrors;
    });

    return errors;
}

export function hasCreateProductErrors(errors: CreateProductFormErrors): boolean {
  if (errors.name || errors.variants) {
        return true;
  }
  return errors.variantErrors.some((entry) =>
        Boolean(
            entry.sku || entry.name || entry.price_cents || entry.inventory_count
        )
  );
}

export function toCreateProductPayload(values: CreateProductFormValues): CreateProductPayload {
  return {
        name: values.name.trim(),
        description: values.description.trim() || null,
        category_id: values.category_id ? Number(values.category_id) : null,
        status: values.status,
        variants: values.variants.map((variant) => ({
            sku: variant.sku.trim(),
            name: variant.name.trim(),
            price_cents: Number(variant.price_cents),
            inventory_count: Number(variant.inventory_count),
        })),
  };
}