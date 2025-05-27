# LifeHub 🏠💰

A comprehensive personal finance and life management application built with Laravel and React. LifeHub provides a unified dashboard for managing your financial life, secure credentials, and personal data with full bilingual support.

[![Laravel](https://img.shields.io/badge/Laravel-11+-FF2D20?style=flat&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-1.0+-9553E9?style=flat&logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

## ✨ Features

### 💰 Financial Management

- **Savings Tracking**: Monitor multiple savings goals with target amounts and deadlines
- **Transaction Management**: Comprehensive income, expense, and transfer tracking
- **Multi-Currency Support**: Handle USD/EGP with real-time exchange rates
- **Financial Analytics**: Visual insights into spending patterns and financial health
- **Snapshots**: Capture and compare financial states over time

### 🔐 Security & Credentials

- **Password Manager**: Secure AES-256 encrypted password storage
- **SSH Manager**: Store and manage SSH connection details and keys
- **Folder Organization**: Hierarchical organization for all credentials
- **Secure Sharing**: Safe credential sharing capabilities

### 📊 Dashboard & Analytics

- **Real-time Overview**: Live financial dashboard with key metrics
- **Visual Reports**: Charts and graphs for spending analysis
- **Goal Tracking**: Progress visualization for savings and financial goals
- **Custom Categories**: Organize transactions with custom categories

### 🌍 Internationalization

- **Bilingual Support**: Complete Arabic and English localization
- **RTL/LTR Layouts**: Proper right-to-left and left-to-right text support
- **Cultural Formatting**: Localized date, number, and currency formatting

## 🚀 Tech Stack

### Backend

- **Framework**: Laravel 11+ with PHP 8.2+
- **Database**: SQLite (development), PostgreSQL/MySQL (production)
- **Authentication**: Laravel Sanctum with SPA token authentication
- **Testing**: Pest framework for feature and unit tests
- **Architecture**: Domain-driven design with proper separation of concerns

### Frontend

- **Framework**: React 18+ with TypeScript
- **Routing**: Inertia.js for seamless SPA experience
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: Inertia.js shared data and useForm hooks
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite with hot module replacement

### Development Tools

- **IDE Support**: Laravel IDE Helper for enhanced development experience
- **Code Quality**: ESLint, Prettier for consistent code formatting
- **Version Control**: Git with conventional commit messages
- **Package Management**: Composer (PHP), npm (JavaScript)

## 📦 Installation

### Prerequisites

- PHP 8.2 or higher
- Node.js 18+ and npm
- Composer
- SQLite (for development) or PostgreSQL/MySQL (for production)

### Quick Start

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/lifehub.git
    cd lifehub
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install JavaScript dependencies**

    ```bash
    npm install
    ```

4. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5. **Database setup**

    ```bash
    php artisan migrate:fresh --seed
    ```

6. **Start development servers**

    ```bash
    composer run dev
    ```

    This command starts both Laravel and Vite development servers simultaneously.

    Alternatively, you can run them separately:

    ```bash
    # Terminal 1 - Laravel server
    php artisan serve

    # Terminal 2 - Vite dev server
    npm run dev
    ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## 🏗️ Project Structure

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

## 🧪 Testing

LifeHub uses Pest for comprehensive testing coverage.

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test class
php artisan test --filter=SavingsTest

# Run multiple test classes
php artisan test --filter=SavingsTest|TransactionTest

# Run tests with coverage (requires Xdebug)
php artisan test --coverage
```

### Test Organization

- **Feature Tests**: Located in `tests/Feature/APIs/` grouped by domain
- **Unit Tests**: Located in `tests/Unit/` for testing individual components
- **Naming Convention**: `{Entity}APIsTest.php` for API feature tests

## 🌐 Internationalization

LifeHub supports both English and Arabic with proper RTL/LTR handling.

### Adding Translations

1. **Add to English**: `lang/en/dashboard.php`
2. **Add to Arabic**: `lang/ar/dashboard.php`
3. **Use in code**: `__('dashboard.your_key')`

### Translation Guidelines

- Use snake_case for translation keys
- Group related translations under domain-specific keys
- Always provide both English and Arabic versions
- Handle RTL/LTR layouts with Tailwind CSS classes

## 🎨 UI Components

LifeHub uses shadcn/ui components with Tailwind CSS for a modern, responsive design.

### Adding New Components

```bash
# Install a shadcn/ui component
npx shadcn@latest add button

# Components are installed to resources/js/components/ui/
```

### Component Guidelines

- All shadcn/ui components go in `resources/js/components/ui/`
- Custom components extend shadcn/ui with domain-specific logic
- Use TypeScript interfaces for all component props
- Follow consistent naming conventions (PascalCase for components)

## 📱 API Documentation

### Authentication

All API endpoints use Laravel Sanctum for authentication. Include the bearer token in the Authorization header.

### API Structure

- **Dashboard APIs**: `/api/dashboard/*` - Return data directly for dashboard use
- **Public APIs**: `/api/*` - Use API Resource classes for consistent response structure

### Response Format

```json
{
    "data": {
        // Your data here
    },
    "meta": {
        "pagination": {
            // Pagination info if applicable
        }
    }
}
```

## 🔧 Development Guidelines

### Backend Standards

1. Use `FormRequest` classes for validation
2. Implement authorization through Policies
3. Group controllers by domain
4. Write feature tests for all APIs
5. Use Eloquent models for data access (no repository pattern)
6. Follow Laravel naming conventions

### Frontend Standards

1. Use TypeScript for all React components
2. Implement proper props interfaces
3. Use Inertia.js `useForm` for form handling
4. Organize components by domain
5. Handle validation from backend only
6. Create responsive, accessible designs

### Code Quality

- Follow PSR-12 coding standards for PHP
- Use ESLint and Prettier for JavaScript/TypeScript
- Write meaningful commit messages
- Maintain test coverage above 80%
- Document complex business logic

## 📚 Common Commands

### Development

```bash
# Start development environment
composer run dev

# Database operations
php artisan migrate:fresh --seed
php artisan tinker

# Testing
php artisan test
php artisan test --filter=SpecificTest
```

### Frontend

```bash
# Build for production
npm run build

# Lint and format code
npm run lint
npm run format

# Type checking
npm run type-check
```

### Database

```bash
# Create migration
php artisan make:migration create_example_table

# Create model with migration and factory
php artisan make:model Example -mf

# Seed database
php artisan db:seed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the project guidelines
4. Write tests for your changes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Workflow

1. Start with migration + model + policy
2. Create FormRequest for validation
3. Build controller → service → frontend
4. Write feature tests with Pest
5. Add translations for both languages
6. Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**LifeHub** - Simplifying personal finance management, one transaction at a time. 🚀
