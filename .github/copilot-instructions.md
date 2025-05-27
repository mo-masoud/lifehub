## LifeHub - GitHub Copilot Instructions

### Project Overview

LifeHub is a comprehensive personal finance and life management application built with Laravel (backend) and React (frontend) using Inertia.js. The application provides a unified dashboard for managing savings tracking, password and SSH management, transaction recording, personal financial analytics, and currency exchange tracking with full bilingual support.

**Key Objectives:**

- Centralized personal finance management
- Secure password and SSH credential storage
- Real-time financial analytics and reporting
- Multi-currency support with exchange rate tracking
- Snapshot-based financial state management
- Folder-based organization system

---

### Architecture & Stack

- **Backend**: Laravel 11+ with PHP 8.2+
- **Frontend**: React 18+ with TypeScript, using Inertia.js for full-stack SPA routing
- **Database**: SQLite (development), supports PostgreSQL/MySQL for production
- **UI & Design System**: Tailwind CSS with component primitives from **shadcn/ui**

    - We use [shadcn/ui](https://ui.shadcn.dev/) to install only needed UI components.
    - To add a component, use:

        ```bash
        npx shadcn@latest add {component-name}
        ```

    - Components are stored in `resources/js/components/ui/`
    - Custom components extend shadcn/ui with domain-specific logic

- **Build Tool**: Vite with TypeScript support and hot module replacement
- **Authentication**: Laravel Sanctum with SPA token authentication
- **State Management**: Inertia.js shared data and useForm hooks
- **Styling**: Tailwind CSS with custom design tokens and RTL/LTR support
- **Icons**: Lucide React for consistent iconography
- **Internationalization**: Laravel localization (Arabic/English) with full RTL/LTR support
- **Testing**: Pest (backend), React Testing Library (frontend)
- **Development Tools**: Laravel IDE Helper, ESLint, Prettier, TypeScript

---

### Core Features

1. **Savings Management**:

    - Track multiple savings goals with target amounts and deadlines
    - Monitor storage locations (bank accounts, cash, investments)
    - Initial savings tracking and progress visualization
    - Currency-specific savings with automatic conversion

2. **Transaction System**:

    - Comprehensive income, expense, and transfer tracking
    - Categorized transactions with custom categories
    - Multi-currency transaction support
    - Batch transaction imports and exports
    - Transaction analytics and reporting

3. **Password Manager**:

    - Secure password storage with AES-256 encryption
    - Organized by folders (personal, work, etc.)
    - Password strength analysis and generation
    - Secure sharing capabilities
    - Auto-fill integration ready

4. **SSH Manager**:

    - SSH connection details storage (host, port, username)
    - Private key and certificate management
    - Connection testing and validation
    - Folder-based organization
    - Quick connection export

5. **Snapshots**:

    - Capture complete financial state at any point in time
    - Historical financial data comparison
    - Progress tracking over time
    - Automated snapshot scheduling
    - Data integrity verification

6. **Folders System**:

    - Hierarchical organization for passwords and SSH connections
    - Custom folder creation and management
    - Permissions and access control
    - Folder-based search and filtering

7. **Multi-language Support**:

    - Complete Arabic and English localization
    - RTL/LTR layout switching
    - Context-aware translations
    - Cultural formatting (dates, numbers, currency)

8. **Currency Exchange**:

    - Real-time USD/EGP exchange rate tracking
    - Historical exchange rate data
    - Multi-currency balance calculations
    - Exchange rate alerts and notifications

9. **Dashboard Analytics**:
    - Financial overview widgets
    - Spending patterns analysis
    - Income vs. expense visualization
    - Goal progress tracking
    - Custom reporting tools

---

### Project Structure

```
lifehub/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── API/Dashboard/          # Dashboard API endpoints
│   │   │   └── Dashboard/              # Web dashboard controllers
│   │   ├── Middleware/                 # Custom middleware
│   │   └── Requests/                   # Form request validation
│   ├── Models/                         # Eloquent models
│   ├── Policies/                       # Authorization policies
│   ├── Providers/                      # Service providers
│   └── Services/                       # Business logic services
├── database/
│   ├── migrations/                     # Database schema
│   └── seeders/                        # Data seeders
├── lang/
│   ├── ar/                            # Arabic translations
│   └── en/                            # English translations
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   └── shared/                # Shared components
│   │   ├── layouts/                   # Layout components
│   │   ├── pages/                     # Inertia.js pages
│   │   │   └── dashboard/             # Dashboard pages
│   │   └── types/                     # TypeScript definitions
│   └── views/                         # Blade templates
├── routes/
│   ├── web.php                        # Web routes
│   ├── dashboard.php                  # Dashboard routes
│   └── api.php                        # API routes
└── tests/
    ├── Feature/                       # Feature tests
    │   └── APIs/                      # API test suites
    └── Unit/                          # Unit tests
```

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
9. Controllers must be grouped by **domain** using folders.
10. If your controller handles both web and API logic, separate it into two dedicated controllers — one for Inertia views, and one for JSON API responses.
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
23. Do not translate CLI or shell commands. Always keep them in English.
24. When adding translation strings, always provide both English and Arabic versions.
25. Place all request classes, response classes, and services within the domain folder they belong to.
26. If multiple requests belong to the same controller, group them inside a dedicated subfolder within that controller’s domain folder.
27. If an API is dashboard-only, make sure it lives under `app/Http/Controllers/API/Dashboard/YourDomain`.
28. To run backend tests:

    ```bash
    php artisan test
    php artisan test --filter=ClassNameOrMethod
    php artisan test --filter=TestOne|TestTwo
    ```

29. `php artisan test --verbose` is deprecated and should not be used.
30. To run both backend and frontend dev servers at once:

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
- Do not translate command line instructions.
- Always add both English and Arabic versions of every key.

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
