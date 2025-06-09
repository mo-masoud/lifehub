# Frontend Architecture Guidelines

This project follows a **feature-based modular architecture** for both components and application logic:

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

## 🔹 /hooks

- **Feature-based organization**: Each domain has its own subfolder
- **Examples**: `hooks/passwords/`, `hooks/folders/`, `hooks/audit-logs/`
- **Shared hooks**: Common utilities in `hooks/shared/`
- **Purpose**: State management, data fetching, UI interactions

## 🔹 /contexts

- **Feature-based providers**: Domain-specific React contexts
- **Examples**: `contexts/passwords/`, `contexts/folders/`
- **Shared contexts**: Global providers in `contexts/shared/`
- **Pattern**: Each feature has create, edit, delete, and view contexts

## 🔹 /lib

- **Feature utilities**: Domain-specific helper functions
- **Examples**: `lib/passwords/`, `lib/shared/`
- **Purpose**: Business logic, data processing, API utilities

## ❗ Rules

- **No Circular Dependencies**: Avoid importing between same-level features
- **Feature Isolation**: Don't import from `features/passwords/` inside `features/folders/`
- **Use Shared**: Prefer `shared/` for cross-cutting functionality
- **Absolute Imports**: Use `@/components`, `@/hooks`, `@/contexts` for cleaner imports
- **Consistent Structure**: All features follow the same organizational pattern
