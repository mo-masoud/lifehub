# LifeHub Development Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Testing the Application](#testing-the-application)
4. [Creating New Features](#creating-new-features)
5. [Enhancing Existing Features](#enhancing-existing-features)
6. [Bug Fixing Workflow](#bug-fixing-workflow)
7. [Code Architecture](#code-architecture)
8. [Common Patterns](#common-patterns)
9. [Debugging Guide](#debugging-guide)

## Project Overview

LifeHub is a Laravel + React (Inertia.js) application for personal life management with two major features:

- **Password Management**: Secure password storage and SSH key management
- **Savings Tracking**: Track savings across different storage locations with snapshots, transactions, income/expenses
- **Multi-language Support**: Arabic and English

### Tech Stack

- **Backend**: Laravel 12 with Inertia.js
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: SQLite (development)
- **Build Tool**: Vite
- **UI Components**: Shadcn UI components with Lucide icons
- **Component Architecture**: Use Shadcn components as-is, extend in `/components` folder (not `/ui`)

## Development Environment Setup

### Starting Development Servers

```bash
# Start both Laravel and Vite development servers
cd /home/masoud/own/lifehub
composer run dev
```

**Note**: The `composer run dev` command starts both the Laravel server and Vite development server automatically.

### Database Operations

```bash
# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Reset database
php artisan migrate:fresh --seed

# Seed default test user
php artisan db:seed  # Creates user@test.com with password 'password'

# Check database in Tinker
php artisan tinker
```

### User Management

```bash
# Default test user credentials (created by seeder)
# Email: user@test.com
# Password: password

# Create/update user password for testing
php artisan tinker --execute="
use App\Models\User;
use Illuminate\Support\Facades\Hash;
\$user = User::first();
\$user->password = Hash::make('password');
\$user->save();
echo 'Password updated for: ' . \$user->email;
"

# Check user's initial savings status
php artisan tinker --execute="
use App\Models\User;
use App\Models\UserSetting;
\$user = User::first();
echo 'Has completed initial savings: ' . (UserSetting::hasCompletedInitialSavings(\$user) ? 'true' : 'false');
"
```

## Testing the Application

### Manual Testing Workflow

1. **Start Development Servers** (see commands above)

2. **Access Application**

    - Main URL: `http://localhost:8000`
    - Login: `user@test.com` with password `password`

3. **Test Different User States**

    ```bash
    # Test as user who hasn't completed initial savings
    php artisan tinker --execute="
    use App\Models\UserSetting;
    UserSetting::where('key', 'initial_savings_completed')->delete();
    echo 'Initial savings reset - user will see setup screen';
    "

    # Test as user who has completed initial savings
    php artisan tinker --execute="
    use App\Models\UserSetting;
    use App\Models\User;
    UserSetting::markInitialSavingsCompleted(User::first());
    echo 'Initial savings marked complete - user will see dashboard';
    "
    ```

### Testing Routes Directly

```bash
# Test controller output as JSON
curl -s http://localhost:8000/test-route | jq

# Test specific endpoints
curl -H "Accept: application/json" http://localhost:8000/dashboard
```

### Frontend Testing

```bash
# Check for TypeScript errors
npm run build

# Check for linting issues
npm run lint
```

### Backend Testing

```bash
# Run PHPUnit tests
php artisan test

# Run specific test
php artisan test --filter UserTest

# Check for syntax errors
php artisan route:list
```

## Creating New Features

### Development Principles

- **Follow Laravel 12 Best Practices**: Use the latest patterns and conventions
- **Follow React Best Practices**: Use modern hooks, proper component patterns
- **Component Organization**:
    - Use Shadcn UI components as-is
    - Create custom components in `/components` folder (not `/ui`)
    - Use folder domain structure for organization
- **Naming Conventions**:
    - Pages: `export default function PageName()`
    - Components: `export const ComponentName`

### 1. Plan the Feature

- Define the user story
- Identify database changes needed
- Plan the UI/UX flow
- Consider authentication/authorization

### 2. Backend Development

#### Create Migration

```bash
php artisan make:migration create_feature_table
```

#### Create Model

```bash
php artisan make:model FeatureName -mcr
# -m: migration, -c: controller, -r: resource controller
```

#### Create Controller

```bash
php artisan make:controller FeatureController
```

#### Add Routes

Edit `routes/dashboard.php`:

```php
Route::resource('features', FeatureController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->names('features');
```

#### Create Policy (if needed)

```bash
php artisan make:policy FeaturePolicy --model=Feature
```

### 3. Frontend Development

#### Create React Components

```tsx
// resources/js/pages/dashboard/feature/index.tsx (Page Component)
import { PageProps } from '@/types';

interface Props extends PageProps {
    features: Feature[];
}

export default function FeatureIndex({ features }: Props) {
    return <div>{/* Page content */}</div>;
}
```

```tsx
// resources/js/components/feature/feature-card.tsx (Reusable Component)
import { Feature } from '@/types/models';

interface FeatureCardProps {
    feature: Feature;
}

export const FeatureCard = ({ feature }: FeatureCardProps) => {
    return <div>{/* Component content */}</div>;
};
```

#### Update Types

```typescript
// resources/js/types/models.d.ts
export interface Feature {
    id: number;
    name: string;
    // ... other properties
}
```

### 4. Testing the New Feature

1. **Test Backend API**:

    ```bash
    php artisan tinker --execute="
    use App\Models\Feature;
    Feature::create(['name' => 'Test Feature']);
    echo 'Feature created: ' . Feature::count();
    "
    ```

2. **Test Frontend Rendering**:
    - Access the route in browser
    - Check browser console for errors
    - Verify responsive design

## Enhancing Existing Features

### 1. Analyze Current Implementation

- Study existing controller logic
- Review current React components
- Check database schema
- Understand existing API contracts

### 2. Common Enhancement Patterns

#### Adding New Fields

1. **Database**: Create migration for new columns
2. **Model**: Update `$fillable` and add relationships
3. **Controller**: Update validation rules and data handling
4. **Frontend**: Update TypeScript interfaces and forms

#### Adding New UI Components

1. **Use Shadcn Components**: First check if Shadcn UI has the component you need
2. **Extend in /components**: Create custom components by extending Shadcn components

    ```tsx
    // resources/js/components/feature/custom-button.tsx
    import { Button } from '@/components/ui/button';

    interface CustomButtonProps {
        variant?: 'primary' | 'secondary';
        children: React.ReactNode;
    }

    export const CustomButton = ({ variant = 'primary', children }: CustomButtonProps) => {
        return (
            <Button variant={variant === 'primary' ? 'default' : 'outline'} className="custom-styles">
                {children}
            </Button>
        );
    };
    ```

3. **Folder Domain Structure**: Organize components by feature/domain
    ```
    components/
    ├── dashboard/          # Dashboard-specific components
    ├── savings/           # Savings feature components
    ├── passwords/         # Password management components
    └── ui/               # Shadcn UI components (don't modify)
    ```

#### Conditional Rendering (like our recent work)

```tsx
// Pattern for conditional display
{
    condition ? <ComponentA {...propsA} /> : <ComponentB {...propsB} />;
}
```

## Bug Fixing Workflow

### 1. Identify the Bug

- **Frontend Issues**: Check browser console, React DevTools
- **Backend Issues**: Check Laravel logs (`storage/logs/laravel.log`)
- **Database Issues**: Use Tinker to verify data state

### 2. Reproduce the Bug

```bash
# Create test scenario
php artisan tinker --execute="
// Set up specific conditions that trigger the bug
"
```

### 3. Debug Tools

#### Laravel Debugging

```bash
# Enable debug mode
# Edit .env: APP_DEBUG=true

# Check logs
tail -f storage/logs/laravel.log

# Use Tinker for data exploration
php artisan tinker
```

#### Frontend Debugging

```typescript
// Add debug logging
console.log('Debug data:', data);

// Use React DevTools in browser
// Check Network tab for API calls
```

### 4. Fix and Test

1. **Make the fix**
2. **Test the specific bug scenario**
3. **Test related functionality**
4. **Ensure no regressions**

## Code Architecture

### Backend Structure

```
app/
├── Http/Controllers/Dashboard/     # Feature controllers (by domain)
├── Models/                        # Eloquent models
├── Policies/                      # Authorization policies
├── Services/                      # Business logic services
└── Enums/                        # Enum classes
```

### Frontend Structure (Folder Domain Organization)

```
resources/js/
├── components/                    # Reusable UI components (by domain)
│   ├── dashboard/                # Dashboard-specific components
│   ├── savings/                  # Savings feature components
│   ├── passwords/                # Password management components
│   └── ui/                       # Shadcn UI components (don't modify)
├── pages/dashboard/              # Page components (by domain)
│   ├── savings/                  # Savings pages
│   ├── passwords/                # Password management pages
│   └── home/                     # Dashboard home
├── types/                        # TypeScript type definitions
└── layouts/                      # Layout components
```

### Key Models and Relationships

- **User**: Has many savings, transactions, snapshots
- **InitialSaving**: Belongs to user and storage location
- **Snapshot**: Has many snapshot items, belongs to user
- **Transaction**: Belongs to user and storage location
- **UserSetting**: Key-value settings for users

## Common Patterns

### Controller Pattern (Laravel 12 Best Practices)

```php
public function index(Request $request)
{
    /** @var User $user */
    $user = $request->user(); // Preferred for better IntelliSense support
    // Alternative: $user = auth()->user(); (works but may show IDE warnings)
    $data = SomeModel::where('user_id', $user->id)->get();

    return inertia('dashboard/feature/index', [
        'data' => $data,
    ]);
}
```

### React Component Patterns

```tsx
// Page Component (use default export)
export default function FeaturePage({ features }: Props) {
    const [state, setState] = useState(initialValue);

    const handleAction = () => {
        router.post(route('some.route'), data, {
            onSuccess: () => toast.success('Success!'),
            onError: () => toast.error('Error!'),
        });
    };

    return <div>{/* JSX */}</div>;
}

// Regular Component (use named export)
export const FeatureCard = ({ feature }: FeatureCardProps) => {
    return <div>{/* JSX */}</div>;
};
```

### Conditional Data Loading (like our recent implementation)

```php
// Controller Pattern
/** @var User $user */
$user = Auth::user(); // Always add type hint comment

if ($condition) {
    $data = ['option1' => $data1];
} else {
    $data = ['option2' => $data2];
}
return inertia('component', $data);
```

```tsx
// React component pattern
{
    condition ? <ComponentA {...props} /> : <ComponentB {...props} />;
}
```

### Shadcn UI Integration

```tsx
// Use Shadcn components as-is
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Extend for custom functionality
export const CustomCard = ({ title, children }: CustomCardProps) => {
    return (
        <Card className="custom-styling">
            <CardHeader>{title}</CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
};
```

## Debugging Guide

### Common Issues and Solutions

#### 1. "Method not found" errors

- **Check**: Model relationships are properly defined
- **Solution**: Verify method exists in model class

#### 2. TypeScript errors

- **Check**: Interface definitions match actual data
- **Solution**: Update `resources/js/types/` files

#### 3. 404 routes

- **Check**: Routes are properly defined and named
- **Solution**: Run `php artisan route:list` to verify

#### 4. Database issues

- **Check**: Migrations have run successfully
- **Solution**: Run `php artisan migrate:status`

#### 5. Frontend not updating

- **Check**: Vite is running and compiling
- **Solution**: Restart `npm run dev`

### Development Tools

```bash
# Useful Laravel commands
php artisan route:list              # List all routes
php artisan config:cache            # Cache configuration
php artisan view:cache              # Cache views
php artisan optimize:clear          # Clear all caches

# Database inspection
php artisan tinker                  # Interactive shell
php artisan migrate:status          # Migration status
php artisan db:show                 # Database info

# Frontend tools
npm run build                       # Production build
npm run dev                         # Development server
npm run lint                        # Linting
```

---

## Quick Reference

### Authentication

- Login route: `/dashboard/login`
- Protected routes use `dashboard.auth` middleware
- User data available via `$request->user()` or `Auth::user()`

### Current User States

- **New User**: `hasCompletedInitialSavings() = false`
- **Existing User**: `hasCompletedInitialSavings() = true`

### Test User Credentials

- Email: `user@test.com`
- Password: `password`

### Key Files for Recent Feature

- Controller: `app/Http/Controllers/Dashboard/HomeController.php`
- Frontend: `resources/js/pages/dashboard/home/index.tsx`
- Component: `resources/js/pages/dashboard/home/initial-savings/initial-savings-card.tsx`
