# Component Structure Guidelines

This project follows a structured component layout:

## 🔹 /ui

- Contains all ShadCN UI primitives.
- Must not be modified or moved.
- Only low-level reusable UI pieces belong here (e.g., `Button`, `Input`, `DropdownMenu`).

## 🔹 /layout

- Components used in the app shell and layout system.
- Examples: `AppHeader`, `AppSidebar`, `Breadcrumbs`, `NavFooter`.

## 🔹 /shared

- Reusable components shared across features or pages.
- Must be generic enough to work in different modules.
- Examples: `TablePagination`, `InputError`, `Heading`.

## 🔹 /features

- Feature-specific components grouped by domain.
- Examples:
    - `features/passwords`
    - `features/folders`
    - `features/audit-logs`

Each subfolder contains its own logic: dialogs, headers, rows, sheets, etc.

## ❗ Rules

- Avoid circular dependencies.
- Do not import from `features/*` inside other `features/*`.
- Prefer `shared/` for cross-cutting components.
- Use relative imports inside feature folders, and `@/components` elsewhere.
