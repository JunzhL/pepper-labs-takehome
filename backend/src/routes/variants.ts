import { Router } from "express";
import db from "../db.js";
import { sendError } from "../lib/http.js";
import { validateUpdateVariantPayload } from "../lib/validation.js";

const router = Router();

/**
 * GET /api/variants/:id
 * Get a single variant.
 */
router.get("/:id", (req, res) => {
  try {
    const variant = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(Number(req.params.id));

    if (!variant) {
      return sendError(res, 404, "Variant not found");
    }

    res.json(variant);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return sendError(res, 500, message);
  }
});

/**
 * PUT /api/variants/:id
 * Update a variant's price and/or inventory.
 *
 * Expected body (all fields optional):
 * {
 *   "name": "Updated Name",
 *   "sku": "NEW-SKU",
 *   "price_cents": 1999,
 *   "inventory_count": 50
 * }
 */
router.put("/:id", (_req, res) => {
  try {
    const id = Number(_req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return sendError(res, 400, "Invalid variant id");
    }

    const existing = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(id) as
      | {
          id: number;
          product_id: number;
          sku: string;
          name: string;
          price_cents: number;
          inventory_count: number;
        }
      | undefined;

    if (!existing) {
      return sendError(res, 404, "Variant not found");
    }

    const parsed = validateUpdateVariantPayload(_req.body);
    if (!parsed.ok) {
      return sendError(res, 400, parsed.error, parsed.field);
    }

    const patch = parsed.value;

    if (patch.sku && patch.sku !== existing.sku) {
      const conflict = db
        .prepare("SELECT id FROM variants WHERE sku = ? AND id != ?")
        .get(patch.sku, id);
      if (conflict) {
        return sendError(res, 400, "SKU must be unique", "sku");
      }
    }

    db.prepare(
      `UPDATE variants
       SET sku = ?,
           name = ?,
           price_cents = ?,
           inventory_count = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      patch.sku ?? existing.sku,
      patch.name ?? existing.name,
      patch.price_cents ?? existing.price_cents,
      patch.inventory_count ?? existing.inventory_count,
      id
    );

    const updated = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(id);

    return res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("UNIQUE constraint failed: variants.sku")) {
      return sendError(res, 400, "SKU must be unique", "sku");
    }
    if (message.includes("CHECK constraint failed")) {
      return sendError(res, 400, "price_cents and inventory_count must be >= 0");
    }

    return sendError(res, 500, message);
  }
});

/**
 * DELETE /api/variants/:id
 * Delete a variant permanently.
 */
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    const variant = db
      .prepare("SELECT * FROM variants WHERE id = ?")
      .get(id) as Record<string, unknown> | undefined;

    if (!variant) {
      return sendError(res, 404, "Variant not found");
    }

    // Prevent deleting the last variant of a product
    const siblingCount = db
      .prepare(
        "SELECT COUNT(*) AS count FROM variants WHERE product_id = ?"
      )
      .get(variant.product_id as number) as { count: number };

    if (siblingCount.count <= 1) {
      return sendError(res, 400, "Cannot delete the last variant of a product");
    }

    db.prepare("DELETE FROM variants WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return sendError(res, 500, message);
  }
});

export default router;
