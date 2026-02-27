
// Standardize API error responses across route handlers. Keeps route logic concise and gives frontend a stable error contract.

import type { Response } from "express";

export function sendError(
    res: Response,
    status: number,
    message: string,
    field?: string
) {
    if (field) {
        return res.status(status).json({ error: message, field });
    }
    return res.status(status).json({ error: message });
}