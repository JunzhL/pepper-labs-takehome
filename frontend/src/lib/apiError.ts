/**
 * Normalize API error extraction from fetch responses.
 * Reads `{ error: string }` if present and falls back safely.
 * Keeps UI components simple and prevents repetitive response parsing.
 */
export async function getApiErrorMessage(
    response: Response,
    fallback = "Request failed"
): Promise<string> {
    try {
        const data: unknown = await response.json();
        if (data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string") {
            return (data as { error: string }).error;
        }
    } catch {}
    return fallback;
}