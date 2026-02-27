/**
 * Validate and normalize create-product payloads.
 * Parses unknown request input into strongly typed, safe values.
 * Prevents duplicated validation logic and keeps routes focused on orchestration.
 */
export type ProductStatus = "active" | "draft" | "archived";

export interface CreateVariantInput {
    sku: string;
    name: string;
    price_cents: number;
    inventory_count: number;
}

export interface UpdateVariantInput {
    sku?: string;
    name?: string;
    price_cents?: number;
    inventory_count?: number;
}

export interface CreateProductInput {
    name: string;
    description: string | null;
    category_id: number | null;
    status: ProductStatus;
    variants: CreateVariantInput[];
}

export type ValidationResult<T> = | { ok: true; value: T } | { ok: false; error: string; field?: string };

const VALID_STATUSES: ProductStatus[] = ["active", "draft", "archived"];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function asOptionalString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveInt(
    value: unknown,
    field: string
): ValidationResult<number> {
    if (typeof value !== "number" || !Number.isInteger(value)) {
        return { ok: false, error: `${field} must be an integer`, field };
    }
    if (value < 0) {
        return { ok: false, error: `${field} must be >= 0`, field };
    }
    return { ok: true, value };
}

export function validateCreateProductPayload(
    payload: unknown
): ValidationResult<CreateProductInput> {
    if (!isRecord(payload)) {
        return { ok: false, error: "Request body must be a JSON object" };
    }

    const name = asOptionalString(payload.name);
    if (!name) {
        return { ok: false, error: "Product name is required", field: "name" };
    }

    const description = asOptionalString(payload.description);

    let category_id: number | null = null;
    if (payload.category_id !== undefined && payload.category_id !== null) {
        if (
            typeof payload.category_id !== "number" ||
            !Number.isInteger(payload.category_id) ||
            payload.category_id <= 0
        ) {
            return {
                ok: false,
                error: "category_id must be a positive integer",
                field: "category_id",
            };
        }
        category_id = payload.category_id;
    }

    let status: ProductStatus = "active";
    if (payload.status !== undefined && payload.status !== null) {
        if (typeof payload.status !== "string" || !VALID_STATUSES.includes(payload.status as ProductStatus)) {
            return {
                ok: false,
                error: "status must be one of: active, draft, archived",
                field: "status",
            };
        }
        status = payload.status as ProductStatus;
    }

    if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
        return {
            ok: false,
            error: "At least one variant is required",
            field: "variants",
        };
    }

    const seenSkus = new Set<string>();
    const variants: CreateVariantInput[] = [];

    for (let i = 0; i < payload.variants.length; i += 1) {
        const rawVariant = payload.variants[i];
        if (!isRecord(rawVariant)) {
            return {
                ok: false,
                error: `variants[${i}] must be an object`,
                field: `variants.${i}`,
            };
        }

        const sku = asOptionalString(rawVariant.sku);
        if (!sku) {
            return {
                ok: false,
                error: `Variant ${i + 1}: SKU is required`,
                field: `variants.${i}.sku`,
            };
        }

        if (seenSkus.has(sku)) {
            return {
                ok: false,
                error: `Variant ${i + 1}: SKU must be unique in request`,
                field: `variants.${i}.sku`,
            };
        }
        seenSkus.add(sku);

        const variantName = asOptionalString(rawVariant.name);
        if (!variantName) {
            return {
                ok: false,
                error: `Variant ${i + 1}: name is required`,
                field: `variants.${i}.name`,
            };
        }

        const parsedPrice = parsePositiveInt(
            rawVariant.price_cents,
            `variants.${i}.price_cents`
        );
        
        if (!parsedPrice.ok) {
            return parsedPrice;
        }

        const parsedInventory = parsePositiveInt(
            rawVariant.inventory_count,
            `variants.${i}.inventory_count`
        );
        if (!parsedInventory.ok) {
            return parsedInventory;
        }

        variants.push({
            sku,
            name: variantName,
            price_cents: parsedPrice.value,
            inventory_count: parsedInventory.value,
        });
    }

    return {
        ok: true,
        value: {
            name,
            description,
            category_id,
            status,
            variants,
        },
    };
}

function asRequiredString(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalPositiveInt(
    value: unknown,
    field: string
): ValidationResult<number | undefined> {
    if (value === undefined) {
        return { ok: true, value: undefined };
    }

    if (typeof value !== "number" || !Number.isInteger(value)) {
        return { ok: false, error: `${field} must be an integer`, field };
    }

    if (value < 0) {
        return { ok: false, error: `${field} must be >= 0`, field };
    }

    return { ok: true, value };
}

export function validateUpdateVariantPayload(payload: unknown): ValidationResult<UpdateVariantInput> {
    if (!isRecord(payload)) {
        return { ok: false, error: "Request body must be a JSON object" };
    }

    const next: UpdateVariantInput = {};

    if (payload.sku !== undefined) {
        const sku = asRequiredString(payload.sku);
        if (!sku) {
            return { ok: false, error: "sku is required", field: "sku" };
        }
        next.sku = sku;
    }

    if (payload.name !== undefined) {
        const name = asRequiredString(payload.name);
        if (!name) {
            return { ok: false, error: "name is required", field: "name" };
        }
        next.name = name;
    }

    const parsedPrice = parseOptionalPositiveInt(
        payload.price_cents,
        "price_cents"
    );
    if (!parsedPrice.ok) {
        return parsedPrice;
    }
    if (parsedPrice.value !== undefined) {
        next.price_cents = parsedPrice.value;
    }

    const parsedInventory = parseOptionalPositiveInt(
        payload.inventory_count,
        "inventory_count"
    );
    if (!parsedInventory.ok) {
        return parsedInventory;
    }
    if (parsedInventory.value !== undefined) {
        next.inventory_count = parsedInventory.value;
    }

    if (Object.keys(next).length === 0) {
        return {
            ok: false,
            error: "At least one updatable field is required",
        };
    }

    return { ok: true, value: next };
}