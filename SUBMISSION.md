# Submission

**Candidate name:** Junzhang Luo
**Date:** 2026-02-28
**Time spent:** 3

---

## Completed Tasks

Check off what you finished:

- [ ] Task 1 — Create Product
- [ ] Task 2 — Update Variant
- [ ] Task 3 — Fix soft-delete bug
- [ ] Task 4 — Loading & error states
- [ ] Task 5 — Input validation

---

## Approach & Decisions

### Task 1
For product creation, the backend validates the shape and business rules in `validation.ts` in the backend folder. Specifically, verifies `category_id` exists when provided, and inserts in a single SQLite transaction to ensure atomicity. 

For the frontend, added `ProductForm.tsx` component for form controle, and `validation.ts` handles validation.

Alternative approach can be keep the create product component in one file and used external library to handle validation.

### Task 2
For variant updates. The backend checks ID validity and variant existence, SKU uniqueness and if SKU is changed.

The frontend updates local product state with the returned variant, validation against non-negative integers.

The alternative approach for updating the variants is to use modal editing. Inline editing reduces context switching therefore reduces complexity.

### Task 3
Fixed the soft-delete in the product GET API. The issue is soft-deleted products are not excluded.

In the backend, added `deleted_at IS NULL` in the `WHERE` conditions array before applying optional `search` and `category_id` filters.

### Task 4
Added explicit status (error, loading) handling for the products list to add user feedback in the UI. Added `isLoadingProducts`, `productsError`, and `reloadToken` state in `ProductsPage.tsx`.

### Task 5
Enforced the same validation rules on both backend and frontend, so frontend is for UX, provide feedback, while the backend is the source of truth.

### Bonus Tasks
I also implemented both bonuses:
1. Bonus A: Added disabled button (`isDeleting` flag), controlled by status change, error feedback.
2. Bonus B: Standardized backend error responses with `sendError(...)`  function across the routes and added a JSON error fallback middleware in `app.ts`.

---

## What I'd improve with more time

- Add more shared contracts between frontend and backend, refactor route handlers into service/repository layers to separate business logic from query.
- Add CRUD operation on variants.

---

## Anything else?
I had two commits since I first read through all the tasks, then approached the tasks as implementing CRUD and UI for products, the tasks are all the requirements. I ended up with 2 commits, first one being task 1 and 3, the second one is for the rest of the tasks.
