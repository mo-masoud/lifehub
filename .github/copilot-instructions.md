## LifeHub - GitHub Copilot Instructions

### Project Overview

LifeHub is a personal finance and life management application built with Laravel (backend) and React (frontend) using Inertia.js. The application includes features for savings tracking, password and SSH management, transaction recording, and personal financial analytics.

---

### Architecture & Stack

- **Backend**: Laravel 12 with PHP 8.2+
- **Frontend**: React with TypeScript, using Inertia.js for full-stack routing
- **Database**: SQLite (development), supports PostgreSQL/MySQL for production
- **UI & Design System**: Tailwind CSS with component primitives from **shadcn/ui**

    - We use [shadcn/ui](https://ui.shadcn.dev/) to install only needed UI components.
    - To add a component, use:

        ```bash
        npx shadcn@latest add {component-name}
        ```

- **Build Tool**: Vite
- **Authentication**: Laravel Sanctum
- **Internationalization**: Laravel localization (Arabic/English) with full RTL/LTR support

---

### Core Features

1. **Savings Management**: Track savings goals, storage locations, initial savings
2. **Transaction System**: Income, expenses, and transfer tracking
3. **Password Manager**: Secure password storage with encryption
4. **SSH Manager**: SSH connection details manager
5. **Snapshots**: Capture full financial state
6. **Folders**: Group passwords and SSHs under folders like "personal", "work", etc.
7. **Multi-language**: Arabic and English support
8. **Currency Exchange**: Support USD/EGP conversions using exchange rates

---

### Naming Conventions

- **Controllers/Models/Requests/Services**: PascalCase
- **Database Tables**: snake_case (plural)
- **Columns**: snake_case
- **React Components**: CamelCase

    - Page Components: `export default function PageName()`
    - Non-page Components: `export const ComponentName`

- **Frontend Folders**: kebab-case
- **UI Components**: All shadcn components go under `ui/`
- **Domain Components**: Pages and components are grouped under domain folders
- **Shared Components**: Used across domains, go into `components/`
- **Page-Specific Components**: Go under `partials/` inside page folder

---

### Backend Standards

1. All models must have a corresponding **Policy** defined.
2. All routes implementing CRUD must use `Route::resource()` with named routes.
3. Always import PHP classes instead of using full namespace references.
4. Validation logic should be inside **FormRequest** classes, not inside controllers.
5. Authorization logic should also be handled inside the `authorize()` method of the FormRequest, not in the controller.
6. Any model hooks must be placed inside **Observers**.
7. Prefer Laravel helper functions like `auth()->id()` over facade calls like `Auth::id()`.
8. Use `$request->user()` if possible instead of calling `auth()->user()` manually.

    - Add a comment above to hint the editor about the type: `/** @var \App\Models\User $user */`
    - Ensure `use App\Models\User;` is imported at the top.

9. Controllers must be grouped by **domain** using folders.
10. Controllers must never mix JSON API responses with Inertia view returns — separate them into different controllers.
11. Controllers must not contain any business logic — they should act purely as routing layers that delegate to services or directly to models.
12. Repository pattern is not used. Instead, Eloquent models should encapsulate all query and data access logic in clearly named methods.
13. If an API is defined, it must use a **Response class**, unless it's only for dashboard.
14. API responses must follow a unified structure across the app.
15. APIs used only in the dashboard must use a `dashboard` prefix and may return data directly without a response class.
16. Every API must have a corresponding **Feature Test**.
17. Feature tests for APIs must live under `tests/Feature/APIs`, grouped by domain (e.g., `Dashboard/UsersAPIsTest.php`).
18. Use **Pest** for all backend testing.
19. Follow **Laravel Pest Best Practices** (naming, structure, etc.).
20. Localization strings related to dashboard features should go in `lang/{locale}/dashboard.php`, grouped by domain and in snake_case.
21. Always **write and run the test before making changes** (TDD is preferred).
22. Ensure the project has complete **unit tests and E2E tests** for both backend and frontend.
23. To run backend tests:

    ```bash
    php artisan test
    php artisan test --filter=ClassNameOrMethod
    php artisan test --filter=TestOne|TestTwo
    ```

24. `php artisan test --verbose` is deprecated and should not be used.
25. To run both backend and frontend dev servers at once:

    ```bash
    composer run dev
    ```

    > Ensure neither `php artisan serve` nor `npm run dev` is already running.

---

### Frontend Standards

1. Each React file should export **one component only**.
2. All components must use **props interfaces**.
3. Forms must use **Inertia's `useForm`** — do not use `react-hook-form`.
4. All validation should be handled from **the backend only**.
5. React pages/components must be organized under the domain folder.
6. Design must be **modern, responsive, compact**, and use **icons or emojis** where appropriate.

---

### Localization Standards

- Use `__('key')` for all user-facing text.
- Group all dashboard-related strings in `dashboard.php`.
- Use domain-based keys (e.g., `transactions.income_added`) in `snake_case`.
- Handle directionality with proper Tailwind RTL classes.

---

### API Integration

- All API controllers live under appropriate domain folder.
- Use consistent JSON structure for all responses.
- API resource classes must be used for transforming data (except dashboard-only APIs).
- Dashboard APIs should use `dashboard` route prefix and may return raw data.

---

### Testing Standards

- Use **Pest** for all backend tests.
- All APIs must have **Feature Tests**.
- Test files live in `tests/Feature/APIs/Domain/`.
- File naming: `{Entity}APIsTest.php`
- Always test before/after any change.
- Backend: unit tests for models/services + feature tests for endpoints.
- Frontend: use React Testing Library.
- Ensure coverage includes unit and E2E.

---

### Workflow & Best Practices

1. Start with **migration + model + policy**.
2. Use `FormRequest` for validation.
3. Build controller → service → frontend (page → components).
4. Use Laravel helpers over facades.
5. Apply authorization with `Policy`.
6. Write translation strings in both languages.
7. Use `Route::resource()` for all CRUD routes.
8. Maintain folder structure by **domain**.
9. Reuse table/form/modal logic as components.
10. Add feature tests with Pest.
11. Run tests continuously.
12. Build responsive UI.

---

### Common Commands

```bash
# Backend
php artisan migrate
php artisan test
php artisan test --filter=SomeTest
composer run dev

# Build Frontend
npm run build
npm run lint

# Database Reset
php artisan migrate:fresh --seed
php artisan tinker
```

---

This is a mature, well-structured project. Follow conventions, prioritize readability and reusability, and write testable, scalable code across all layers.
