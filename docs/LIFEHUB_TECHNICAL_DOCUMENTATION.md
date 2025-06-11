# LifeHub - Technical Documentation for AI Agents

## Executive Summary

**LifeHub** is a sophisticated password management application built with Laravel 12 (PHP 8.2) backend and React 19 (TypeScript) frontend, connected via Inertia.js for seamless SPA functionality. The system provides secure password storage with envelope encryption, comprehensive audit logging, folder organization, and advanced security features. Password management is the foundational feature, with additional features planned for future implementation that will leverage the existing folder organization system.

## Architecture Overview

### Technology Stack

- **Backend**: Laravel 12, PHP 8.2, SQLite/MySQL
- **Frontend**: React 19, TypeScript, Inertia.js
- **Authentication**: Laravel Sanctum
- **Encryption**: Custom envelope encryption service
- **UI Framework**: ShadCN (built on Radix UI), TailwindCSS 4.0
- **Build Tools**: Vite 6.0, Laravel Vite Plugin
- **Testing**: Pest PHP (99.8% coverage), Vitest + Testing Library (150 tests)
- **Development**: Concurrent setup with hot reloading

### Project Structure

```
lifehub/
├── app/                          # Laravel application code
│   ├── Console/Commands/         # Artisan commands
│   ├── Enums/                   # Application enums
│   ├── Http/                    # Controllers, middleware, requests
│   ├── Models/                  # Eloquent models
│   ├── Policies/                # Authorization policies
│   ├── Providers/               # Service providers
│   ├── Services/                # Business logic services
│   └── Utils/                   # Utility functions
├── database/                    # Migrations, factories, seeders
├── resources/                   # Frontend assets and views
│   ├── css/                     # Stylesheets
│   └── js/                      # TypeScript/React code
│       ├── components/          # React components
│       │   ├── features/        # Feature-specific components
│       │   │   ├── passwords/   # Password management components
│       │   │   ├── folders/     # Folder management components
│       │   │   └── audit-logs/  # Audit log components
│       │   ├── layout/          # Layout and navigation components
│       │   ├── shared/          # Reusable shared components
│       │   │   └── forms/       # Shared form components
│       │   └── ui/              # ShadCN UI components
│       ├── contexts/            # React context providers
│       │   ├── folders/         # Folder-related contexts
│       │   ├── passwords/       # Password-related contexts
│       │   └── shared/          # Shared context providers
│       ├── hooks/               # Custom React hooks
│       │   ├── audit-logs/      # Audit log hooks
│       │   ├── folders/         # Folder management hooks
│       │   ├── passwords/       # Password management hooks
│       │   └── shared/          # Shared utility hooks
│       ├── layouts/             # Page layout templates
│       ├── pages/               # Inertia.js page components
│       ├── types/               # TypeScript type definitions
│       └── lib/                 # Utility functions
│           ├── passwords/       # Password utilities
│           └── shared/          # Shared utilities
├── routes/                      # Route definitions
└── tests/                       # Test suites
```

## Core Features and Modules

### 1. Password Management (`app/Models/Password.php`)

**Purpose**: Core entity for storing and managing user passwords with enterprise-grade security.

#### Database Schema (`database/migrations/2025_06_02_110026_create_passwords_table.php`)

```sql
passwords:
- id (Primary Key)
- user_id (Foreign Key → users.id, CASCADE DELETE)
- type (ENUM: 'normal', 'ssh')
- name (String, max 255, UNIQUE per user)
- username (String, max 255)
- password (LongText - encrypted payload)
- encrypted_key (Text - envelope encryption key)
- key_version (TinyInt - encryption version)
- url (String, max 255, nullable)
- notes (Text, max 10000, nullable)
- folder_id (Foreign Key → folders.id, NULL ON DELETE)
- copied (BigInt, default 0 - usage counter)
- last_used_at (Timestamp, nullable)
- expires_at (Date, nullable)
- created_at, updated_at (Timestamps)
```

#### Key Features

- **Envelope Encryption**: Two-layer encryption with data keys and master keys
- **Password Types**: Normal passwords and SSH credentials with CLI command support
- **Expiration Management**: Tracks expiry dates with "expires soon" warnings (15 days)
- **Usage Analytics**: Copy count, last used timestamps
- **Password Strength**: Real-time strength calculation with detailed feedback
- **Organization**: Folder-based categorization
- **Audit Trail**: Complete action logging

#### Model Relationships

```php
// Password belongsTo User
// Password belongsTo Folder (nullable)
// Password hasMany PasswordAuditLog
```

#### Computed Attributes

- `cli`: SSH command string for SSH type passwords
- `is_expired`: Boolean indicating if password has expired
- `is_expired_soon`: Boolean for passwords expiring within 15 days
- `password_power`: Strength calculation object with score, label, feedback

#### Query Scopes

- `expiresSoon()`: Passwords expiring within 15 days
- `whereExpired()`: Expired passwords
- `sortByLastUsed()`: Sort by usage patterns
- `filterByType()`, `filterByFolder()`, `filterByExpiry()`: Filtering scopes

### 2. Folder Organization (`app/Models/Folder.php`)

**Purpose**: Hierarchical organization system designed for grouping related items. Currently used for password organization, but architected to support future features and content types.

#### Database Schema (`database/migrations/2025_06_02_110004_create_folders_table.php`)

```sql
folders:
- id (Primary Key)
- user_id (Foreign Key → users.id, CASCADE DELETE)
- name (String, UNIQUE per user)
- featured (Boolean, default false)
- created_at, updated_at (Timestamps)
```

#### Key Features

- **User Isolation**: All folders scoped to individual users
- **Featured System**: Priority folders for quick access
- **Smart Ordering**: Custom scope ordering by featured status, recent activity, content count
- **Cascade Behavior**: When folder deleted, contents move to "uncategorized"
- **Future-Ready Design**: Architected to support multiple content types beyond passwords

#### Custom Query Scope (`ordered`)

```php
// Orders by: featured DESC → latest password activity → password count → folder update → name
```

### 3. User Management (`app/Models/User.php`)

**Purpose**: Standard Laravel user authentication with password/folder relationships.

#### Database Schema

```sql
users:
- id (Primary Key)
- name (String)
- email (String, UNIQUE)
- email_verified_at (Timestamp, nullable)
- password (Hashed)
- remember_token (String, nullable)
- created_at, updated_at (Timestamps)
```

#### Relationships

```php
User hasMany Password
User hasMany Folder
User hasMany PasswordAuditLog (through passwords)
```

### 4. Audit Logging System (`app/Models/PasswordAuditLog.php`)

**Purpose**: Comprehensive audit trail for all password-related activities with security context.

#### Database Schema (`database/migrations/2025_06_02_110027_create_password_audit_logs_table.php`)

```sql
password_audit_logs:
- id (Primary Key)
- password_id (Foreign Key → passwords.id, CASCADE DELETE)
- user_id (Foreign Key → users.id, CASCADE DELETE)
- action (String, max 50) - Action type
- ip_address (String, max 45) - IPv6 compatible
- context (String, max 20, default 'web') - Source context
- metadata (JSON, nullable) - Additional data
- created_at (Timestamp) - No updated_at
```

#### Tracked Actions

- `created`: Password creation
- `updated`: Password modifications
- `deleted`: Password deletion
- `copied`: Password copied to clipboard
- `viewed`: Password accessed/viewed
- `bulk_deleted`: Multiple passwords deleted
- `moved_to_folder`: Folder assignment
- `removed_from_folder`: Folder removal

#### Features

- **Privacy Protection**: Masked password names in display
- **Context Tracking**: Web, API, CLI source identification
- **IP Logging**: Security audit trail
- **Metadata Storage**: Flexible JSON field for additional context
- **Comprehensive Filtering**: By user, action, date range, password

#### Query Scopes

- `forPasswordsOwnedBy(User)`: Security-filtered logs
- `withAction(string)`: Filter by action type
- `forPassword(int)`: Password-specific logs
- `inDateRange(start, end)`: Time-based filtering

## Security Implementation

### 1. Envelope Encryption Service (`app/Services/EnvelopeEncryptionService.php`)

**Purpose**: Military-grade encryption using envelope encryption pattern for password storage.

#### Architecture

```
Plaintext Password
    ↓ Encrypt with Random DEK (Data Encryption Key)
Encrypted Password Data
    ↓ Store DEK encrypted with Master Key
[Encrypted Data + Encrypted DEK + Key Version] → Database
```

#### Key Features

- **AES-256-CBC Encryption**: Industry standard encryption
- **Key Versioning**: Support for key rotation without data migration
- **Random DEKs**: Each password encrypted with unique key
- **Master Key Management**: Configurable master keys by version
- **Re-encryption Support**: Seamless key rotation capability

#### Configuration

```php
// config/encryption.php (implied)
'master_key_version' => 1,
'master_keys' => [
    1 => 'base64-encoded-256-bit-key',
    2 => 'base64-encoded-256-bit-key', // For rotation
]
```

#### API Methods

```php
encrypt(string $plaintext, ?int $keyVersion): array
decrypt(string $encryptedData, string $encryptedKey, int $keyVersion): string
reEncrypt(string $data, string $key, int $currentVersion, ?int $newVersion): array
getCurrentKeyVersion(): int
generateTestKey(?string $seed): string
```

### 2. Password Strength Calculator (`app/Services/PasswordStrengthCalculator.php`)

**Purpose**: Real-time password strength assessment with actionable feedback.

#### Scoring Algorithm

```php
Base Score Factors:
- Length: 8+ chars (25pts), 6+ chars (15pts), 4+ chars (5pts)
- Length Bonuses: 12+ chars (+10pts), 16+ chars (+10pts)
- Character Variety: 4 types (25pts), 3 types (20pts), 2 types (10pts)
- Pattern Analysis: No repetition (+10pts), No sequences (+10pts)
- Common Password Check: Dictionary check (-30pts)
- Pattern Penalties: Letters+Numbers pattern (-10pts)

Score Ranges:
95-100: "Awesome"
90-94: "Very strong"
80-89: "Strong"
60-79: "Good"
40-59: "Medium"
0-39: "Weak"
```

#### Features

- **Real-time Feedback**: Specific improvement suggestions
- **Pattern Detection**: Identifies common weak patterns
- **Dictionary Checking**: Guards against common passwords
- **Detailed Analysis**: Character type analysis and recommendations

### 3. Authorization System

#### Laravel Policies

- **PasswordPolicy**: CRUD operations scoped to password owners
- **FolderPolicy**: Folder management permissions
- **User-level Isolation**: All data strictly scoped to authenticated users

#### Request Validation

- **Unique Constraints**: Password names unique per user
- **Type Validation**: Enum validation for password types
- **Conditional Rules**: Username required for normal passwords
- **Ownership Validation**: Folder assignments validated against user ownership

## Service Layer Architecture

### 1. Password Service (`app/Services/PasswordService.php`)

**Purpose**: Central business logic for password management operations.

#### Core Methods

```php
createPassword(User $user, array $data): Password
updatePassword(Password $password, array $data): Password
copy(Password $password): Password // Updates usage stats
delete(Password $password): void
destroyBulk(array $ids): void
moveToFolder(array $ids, ?int $folderId): void
removeFromFolder(array $ids): void
```

#### Features

- **SSH Command Parsing**: Automatic username/hostname extraction from CLI commands
- **Encryption Integration**: Seamless envelope encryption handling
- **Audit Logging**: Automatic audit trail for all operations
- **Bulk Operations**: Efficient multi-password operations
- **Authorization**: Built-in permission checking

#### SSH Support

```php
// CLI: "ssh user@hostname" → username: "user", url: "hostname"
extractUsernameFromCli(string $cli): string
extractUrlFromCli(string $cli): string
```

### 2. Password Query Service (`app/Services/PasswordQueryService.php`)

**Purpose**: Optimized database queries with filtering and sorting for password retrieval.

#### Filtering Capabilities

- **Folder Filter**: Specific folder or "uncategorized" passwords
- **Type Filter**: Normal vs SSH passwords
- **Expiry Filter**: All, expired only, expires soon only
- **Search Filter**: Multi-field text search (name, username, url, notes)

#### Sorting Options

- Last used date (default)
- Name alphabetical
- Username alphabetical
- Custom sort fields with direction control

#### Performance Features

- **Eager Loading**: Automatic folder relationship loading
- **Pagination Support**: Configurable page sizes
- **Query Optimization**: Efficient database queries with proper indexing

### 3. Audit Log Services

#### AuditLogService (`app/Services/AuditLogService.php`)

**Purpose**: Centralized audit logging with context capture.

```php
logPasswordAction(Password $password, User $user, string $action, Request $request): void
logBulkPasswordAction(array $ids, User $user, string $action, Request $request, array $metadata = []): void
```

#### AuditLogQueryService (`app/Services/AuditLogQueryService.php`)

**Purpose**: Advanced audit log querying and reporting.

#### Features

- **Multi-dimensional Filtering**: User, password, action, date range
- **Security Context**: IP tracking, user agent, session data
- **Bulk Action Support**: Special handling for bulk operations
- **Performance Optimization**: Indexed queries for large audit datasets

### 4. Folder Service (`app/Services/FolderService.php`)

**Purpose**: Folder management with intelligent ordering and bulk operations.

#### Key Methods

```php
createFolder(User $user, array $data): Folder
updateFolder(Folder $folder, array $data): Folder
deleteFolder(Folder $folder): void // Moves passwords to uncategorized
bulkUpdateFolders(User $user, array $ids, array $data): void
bulkDeleteFolders(User $user, array $ids): void
getFolders(User $user, array $filters): Collection
```

#### Smart Features

- **Intelligent Ordering**: Featured folders, recent activity, password count
- **Safe Deletion**: Orphaned passwords automatically uncategorized
- **Bulk Operations**: Efficient multi-folder management

### 5. Password Stats Service (`app/Services/Stats/PasswordStatsService.php`)

**Purpose**: Comprehensive statistics and analytics for password data visualization.

#### Key Methods

```php
getAllStats(User $user): array
getTypeDistribution(User $user): array
getTopCopiedPasswords(User $user, int $limit = 5): Collection
getTotalCopiedCount(User $user): int
getSecurityHealthOverview(User $user): array
```

#### Statistics Provided

- **Type Distribution**: Count of normal vs SSH passwords
- **Top Copied Passwords**: Most frequently copied passwords with usage counts
- **Security Health**: Distribution of password strength levels (strong, medium, weak)
- **Usage Analytics**: Total copy counts and activity metrics

#### Features

- **User Scoped**: All statistics are isolated per user
- **Performance Optimized**: Efficient aggregation queries
- **Dashboard Ready**: Data formatted for frontend chart components
- **Real-time**: Statistics reflect current state without caching

## Notification System

LifeHub implements a comprehensive notification system with backend automation, API integration, and a modern frontend interface.

### 1. Architecture Overview

The notification system is built on multiple layers:

- **Backend**: Laravel notifications with custom service layer
- **API**: RESTful endpoints for frontend integration
- **Frontend**: React component with Inertia.js shared data
- **Automation**: Scheduled commands for password expiration management

### 2. Notification Classes

#### WelcomeNotification (`app/Notifications/WelcomeNotification.php`)

**Purpose**: Welcome new users to LifeHub.

```php
Features:
- Database channel delivery
- Welcome message and branding
- Icon type: 'welcome' (blue user icon in UI)
- Always sends (no conditional logic)
```

#### PasswordExpiringSoon (`app/Notifications/PasswordExpiringSoon.php`)

**Purpose**: Notifies users when passwords are expiring within 15 days.

```php
Features:
- Database channel delivery
- Dynamic message with time until expiration
- shouldSend() validation using password's is_expired_soon attribute
- Database type: 'password-expiring-soon'
- Icon type: 'password_expiring' (amber shield icon in UI)
```

#### PasswordExpired (`app/Notifications/PasswordExpired.php`)

**Purpose**: Notifies users when passwords have already expired.

```php
Features:
- Database channel delivery
- Dynamic message with time since expiration
- shouldSend() validation using password's is_expired attribute
- Database type: 'password-expired'
- Icon type: 'password_expired' (red shield alert icon in UI)
```

#### Notification Data Structure

```php
[
    'password_id' => int,           // Password identifier (for expiration notifications)
    'title' => string,              // Notification title
    'message' => string,            // Formatted message with password name and timing
    'icon_type' => string,          // UI icon type (welcome, password_expiring, password_expired)
]
```

### 3. Service Layer

#### NotificationService (`app/Services/NotificationService.php`)

**Purpose**: Frontend API integration and data formatting for notifications.

```php
Core Methods:
getLatestNotifications(User $user, int $limit = 5): Collection
getUnreadCount(User $user): int
markAsRead(User $user, string $notificationId): bool
markAllAsRead(User $user): int
getPaginatedNotifications(User $user, int $perPage = 15): LengthAwarePaginator
```

**Special Features**:

- **Password Object Inclusion**: For expiration notifications, includes full password model with folder relationship
- **Data Formatting**: Consistent API response structure with metadata
- **Type Detection**: Handles both class names and database types for notifications
- **User Isolation**: All operations strictly scoped to authenticated user

#### PasswordNotificationService (`app/Services/PasswordNotificationService.php`)

**Purpose**: Centralized service for managing password expiration notifications with duplicate prevention.

```php
Core Methods:
sendExpiringSoonNotifications(): array    // Send notifications for passwords expiring within 15 days
sendExpiredNotifications(): array         // Send notifications for already expired passwords
sendAllPasswordNotifications(): array    // Send both expiring soon and expired notifications
```

**Duplicate Prevention Logic**:

1. **Unread Notification Check**: Uses `$user->notifications()` relationship to check for unread notifications for the same password
2. **Recent Notification Check**: Prevents same notification type within 10 days for the same password using efficient database queries

**Return Structure**:

```php
[
    'expiring_soon' => [
        'sent' => [['password_id' => 1, 'password_name' => 'Gmail', 'user_id' => 1, 'type' => 'expiring-soon']],
        'skipped' => [['password_id' => 2, 'reason' => 'Recent or unread notification exists']]
    ],
    'expired' => [...],
    'summary' => ['total_sent' => 2, 'total_skipped' => 1]
]
```

### 4. API Layer

#### NotificationController (`app/Http/Controllers/API/NotificationController.php`)

**Purpose**: RESTful API endpoints for notification management with no business logic (delegated to services).

**Endpoints**:

```bash
GET    /api/v1/notifications                    # Latest notifications (limit parameter)
GET    /api/v1/notifications/unread-count       # Unread count
GET    /api/v1/notifications/paginated          # Paginated notifications
POST   /api/v1/notifications/{id}/mark-read     # Mark single notification as read
POST   /api/v1/notifications/mark-all-read      # Mark all notifications as read
```

**Security**: All endpoints require Sanctum authentication and are user-scoped.

**Response Format**:

```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "type": "password-expired",
        "title": "Password Expired",
        "message": "Your password for 'Gmail' expired 2 days ago.",
        "icon_type": "password_expired",
        "read_at": null,
        "created_at": "2024-01-01T00:00:00Z",
        "password": {
            "id": 123,
            "name": "Gmail",
            "folder": {...}
        }
    }
}
```

### 5. Frontend Integration

#### Inertia.js Shared Data (`app/Http/Middleware/HandleInertiaRequests.php`)

**Shared Structure**:

```typescript
notifications: {
    latest: Notification[],      // Latest 5 notifications
    unread_count: number         // Total unread count
}
```

#### NotificationsNav Component (`resources/js/components/shared/notifications-nav.tsx`)

**Features**:

- **Dynamic Badge**: Shows unread count with red destructive styling
- **Hover-to-Read**: 1000ms delay before marking notifications as read via API
- **Mark All Read**: Bulk action with loading states and disabled state management
- **Icon System**: Contextual icons based on notification type
- **Responsive Design**: 320px width dropdown with proper spacing
- **Timestamp Display**: Relative time formatting using date-fns
- **Coming Soon Button**: Placeholder for full notification management view

**UI Elements**:

- Welcome notifications: Blue user icon with blue background
- Password expiring: Amber shield icon with amber background
- Password expired: Red shield alert icon with red background
- Read indicators: Blue dot for unread notifications
- Loading states: Spinner animation for async operations

### 6. Automated Scheduling

#### Console Command (`app/Console/Commands/CheckPasswordExpirations.php`)

**Purpose**: Artisan command for checking and sending password expiration notifications.

```bash
# Command signature
php artisan passwords:check-expirations [--dry-run]

# Scheduling (configured in routes/console.php)
Schedule: Daily at midnight (00:00)
```

**Command Features**:

- **Dry Run Mode**: Preview notifications without sending using `--dry-run` flag
- **Detailed Reporting**: Comprehensive tables showing sent/skipped notifications with reasons
- **Performance Tracking**: Execution time reporting
- **Service Integration**: Uses PasswordNotificationService for business logic
- **Reflection-based Dry Run**: Accesses protected methods for preview functionality

**Scheduling Configuration**:

```php
// routes/console.php
Schedule::command(CheckPasswordExpirations::class)
    ->daily()
    ->at('00:00')
    ->description('Check for password expirations and send notifications');
```

### 7. Database Integration

#### Notifications Table

Laravel's default notifications table stores all notification data:

```sql
notifications:
- id (UUID)
- type (String) - Database type from databaseType() method
- notifiable_type (String) - 'App\Models\User'
- notifiable_id (BigInt) - User ID
- data (JSON) - Notification payload with title, message, icon_type
- read_at (Timestamp, nullable)
- created_at, updated_at (Timestamps)
```

#### User Model Integration

```php
// User model automatically includes Notifiable trait
// Provides: notifications(), unreadNotifications(), readNotifications()
```

### 8. Seeding and Development

#### NotificationSeeder (`database/seeders/NotificationSeeder.php`)

**Purpose**: Generate sample notifications for development and testing.

**Features**:

- Creates welcome notifications for user ID 1
- Generates password expiration notifications based on existing data
- Marks some notifications as read for UI variety
- Provides detailed console output with statistics

**Usage**:

```bash
php artisan db:seed NotificationSeeder
```

### 9. Testing Coverage

#### Test Structure

- **WelcomeNotificationTest** (5 tests): Notification structure and delivery
- **NotificationServiceTest** (15 tests): API service functionality and security
- **NotificationControllerTest** (18 tests): API endpoint authentication and responses
- **PasswordNotificationServiceTest** (10 tests): Business logic and duplicate prevention
- **CheckPasswordExpirationsTest** (12 tests): Command execution and scheduling

**Total**: 60 tests with 191+ assertions covering all layers of the notification system.

## Controller Layer

### 1. Password Controller (`app/Http/Controllers/Passwords/PasswordController.php`)

**Purpose**: HTTP interface for password management with Inertia.js integration.

#### Endpoints

```php
GET    /passwords                     # index() - List passwords with filtering
POST   /passwords                     # store() - Create new password
PUT    /passwords/{password}          # update() - Update existing password
DELETE /passwords/{password}          # destroy() - Delete single password
POST   /passwords/{password}/copy     # copy() - Copy password (increment counter)
POST   /passwords/destroy-bulk        # destroyBulk() - Delete multiple passwords
POST   /passwords/move-to-folder      # moveToFolder() - Bulk folder assignment
POST   /passwords/remove-from-folder  # removeFromFolder() - Bulk folder removal
```

#### Features

- **Inertia.js Responses**: Seamless SPA navigation
- **Policy Authorization**: Automatic permission checking
- **Service Delegation**: Clean separation of concerns
- **Request Validation**: Comprehensive input validation
- **Bulk Operations**: Efficient multi-item operations
- **Statistics Integration**: Password analytics dashboard included in index response

### 2. Folder Controller (`app/Http/Controllers/FolderController.php`)

**Purpose**: Folder management with bulk operations support.

#### Endpoints

```php
GET    /folders                       # index() - List folders
POST   /folders                       # store() - Create folder
PUT    /folders/{folder}              # update() - Update folder
DELETE /folders/{folder}              # destroy() - Delete folder
PUT    /folders/bulk-update           # bulkUpdate() - Bulk feature toggle
DELETE /folders/bulk-destroy          # bulkDestroy() - Bulk deletion
```

### 3. Audit Log Controller (`app/Http/Controllers/AuditLogController.php`)

**Purpose**: Audit log viewing with advanced filtering.

#### Endpoints

```php
GET /passwords/audit-logs # index() - View audit logs with filtering
```

#### Features

- **Advanced Filtering**: Action, date range, password-specific logs
- **User Scoping**: Only shows logs for user's passwords
- **Performance**: Paginated results with efficient queries

## Request Validation Layer

### Password Validation (`app/Http/Requests/Passwords/`)

#### StorePasswordRequest

```php
Rules:
- name: required|string|max:255|unique per user
- type: required|enum(normal,ssh)
- username: nullable|required_if:type,normal
- password: required|string|max:255
- url: nullable|string|max:255
- folder_id: nullable|integer|exists in user's folders
- expires_at: nullable|date|after:now
- notes: nullable|string|max:10000
```

#### UpdatePasswordRequest

- Similar rules with unique validation excluding current record

#### Bulk Operation Requests

- **BulkDeletePasswordsRequest**: Validates password ID arrays
- **BulkMoveToFolderRequest**: Validates IDs and folder ownership
- **BulkRemoveFromFolderRequest**: Validates password ownership

### Folder Validation (`app/Http/Requests/Folders/`)

#### StoreFolderRequest / UpdateFolderRequest

```php
Rules:
- name: required|string|max:255|unique per user
- featured: boolean
```

#### Bulk Validation

- **BulkUpdateFoldersRequest**: Featured status toggle validation
- **BulkDestroyFoldersRequest**: Ownership validation

## Frontend Architecture (React/TypeScript)

### Application Setup (`resources/js/`)

#### Entry Point (`app.tsx`)

```typescript
- Inertia.js SPA setup
- Dialog providers for state management
- Sonner toast notifications
- Theme system integration
- Dynamic page loading with Vite
```

#### Development Setup

- **TypeScript 5.7**: Strict type checking
- **React 19**: Latest React features
- **Vite 6.0**: Fast HMR and building
- **TailwindCSS 4.0**: Utility-first styling
- **ShadCN**: High-quality component library built on Radix UI
- **Radix UI**: Accessible component primitives foundation

### Page Structure (`resources/js/pages/`)

#### Main Pages

- `passwords/index.tsx`: Password management interface with integrated statistics dashboard
- `folders/index.tsx`: Folder organization
- `audit-logs/index.tsx`: Audit log viewing
- `settings/`: Application settings
- `auth/`: Authentication pages
- `dashboard.tsx`: Main dashboard
- `welcome.tsx`: Landing page

#### Password Index Page Enhancements

The passwords index page now includes:

- **Toggleable Statistics Dashboard**: Real-time password analytics with smooth transitions
- **Statistics Toggle Button**: Easy access to show/hide statistics panel
- **Responsive Design**: Statistics properly adapt to mobile and desktop layouts
- **State Management**: Statistics visibility state persisted during session

### Component Architecture (`resources/js/components/`)

#### UI Components (`ui/`)

- **ShadCN Integration**: High-quality components built on Radix UI primitives
- **Radix UI Foundation**: Accessible, unstyled component primitives
- **Custom Components**: Application-specific UI elements
- **Design System**: Consistent styling and behavior with TailwindCSS

#### Feature Components (`features/`)

Feature-specific components organized by functional domain. Each feature module is self-contained with all related components grouped together.

##### Password Components (`features/passwords/`)

```typescript
- PasswordForm: Comprehensive password creation/editing
- PasswordsTable: Data table with sorting and selection
- PasswordsHeader: Bulk actions, stats toggle, and creation buttons
- PasswordsSearchAndFilters: Advanced filtering interface
- PasswordFilters: Granular filter controls
- PasswordRowActions: Individual password actions
- ViewPasswordSheet: Secure password viewing
- PasswordBulkActions: Multi-selection operations
- CreatePasswordSheet: Password creation modal
- EditPasswordSheet: Password editing modal
- DeletePasswordDialog: Password deletion confirmation
- MoveToFolderDialog: Folder reassignment
- RemoveFromFolderDialog: Folder removal
- Global dialog components for cross-page usage
```

##### Password Statistics Components (`features/passwords/stats/`)

```typescript
- PasswordStatsDashboard: Main statistics dashboard container
- TopCopiedPasswords: Bar chart showing most copied passwords
- SecurityHealthOverview: Pie chart of password strength distribution
- PasswordTypeDistribution: Pie chart of normal vs SSH password types
```

##### Password Statistics Features

```typescript
Key Features:
- Real-time statistics display with toggle functionality
- Interactive charts using Recharts with ShadCN theming
- Responsive design with proper mobile handling
- Smooth transitions and animations
- Color-coded charts with consistent theming
- Truncated text handling for long password names
- Tooltip integration for detailed information
```

##### Password Form Features (`features/passwords/password-form.tsx`)

```typescript
Key Features:
- Adaptive UI for Normal vs SSH passwords
- SSH CLI command parsing
- Password strength indicators
- Random password generation
- Folder assignment combobox
- Expiration date management
- Markdown notes with preview
- Real-time validation feedback
```

##### Folder Components (`features/folders/`)

```typescript
- FoldersHeader: Folder management header with actions
- FoldersTable: Data table for folder listing
- FoldersSearchAndFilters: Folder filtering interface
- FoldersCombobox: Advanced folder selection with search
- CreateFolderDialog: Folder creation modal
- EditFolderDialog: Folder editing modal
- DeleteFolderDialog: Folder deletion confirmation
- BulkDeleteFoldersDialog: Multiple folder deletion
- FolderBulkActions: Multi-selection operations
- FolderFilters: Folder filtering controls
- FolderRowActions: Individual folder actions
- FolderTableRow: Individual folder display
```

##### Audit Log Components (`features/audit-logs/`)

```typescript
- AuditLogsHeader: Audit log page header
- AuditLogsTable: Paginated audit log display
- AuditLogsSearchAndFilters: Log filtering interface
- AuditLogFilters: Advanced filtering controls
- AuditLogTableRow: Individual log entry display
- AuditLogsTableHeader: Table header with sorting
```

#### Layout Components (`layout/`)

Application layout and navigation components that provide the overall structure and user interface shell.

```typescript
- AppHeader: Main application header with navigation and user menu
- AppSidebar: Collapsible sidebar with navigation menu
- AppSidebarHeader: Sidebar header with breadcrumbs and notifications
- AppContent: Main content wrapper
- AppShell: Overall application shell structure
- NavMain: Primary navigation menu
- NavUser: User profile navigation
- NavFooter: Footer navigation
- UserInfo: User profile information display
- UserMenuContent: User dropdown menu content
```

#### Shared Components (`shared/`)

Reusable components used across multiple features and pages. These components are designed to be generic and feature-agnostic.

```typescript
// Generic UI Components
- Heading: Consistent page and section headings
- HeadingSmall: Smaller section headings
- Icon: Standardized icon component
- Breadcrumbs: Navigation breadcrumb component
- InputError: Form validation error display
- TextLink: Styled link component
- QuickTooltip: Simple tooltip component
- ViewPanel: Content viewing panel

// Application Branding
- AppLogo: Application logo component
- AppLogoIcon: Icon-only logo variant

// Complex Shared Components
- TablePagination: Reusable table pagination controls
- MarkdownReader: Markdown content display with syntax highlighting
- NotificationsNav: Notification center navigation
- DeleteUser: Account deletion component
- AppearanceDropdown: Theme selection dropdown
- AppearanceTabs: Appearance settings tabs

// Form Components (shared/forms/)
- DateInput: Date picker with calendar
- SmartRadioGroup: Enhanced radio button group
```

#### Component Organization Benefits

1. **Clear Separation of Concerns**: Features, layout, and shared components are distinctly organized
2. **Scalability**: New features can be added without cluttering existing code
3. **Reusability**: Shared components prevent code duplication
4. **Maintainability**: Related components are grouped together for easier maintenance
5. **Developer Experience**: Intuitive folder structure makes finding components straightforward

#### Recent Reorganization (December 2024)

The component architecture was recently reorganized from a flat structure to the current hierarchical organization:

**Previous Structure**: All components in `resources/js/components/` with some subdirectories
**Current Structure**: Three-tier organization:

- `features/`: Domain-specific components (passwords, folders, audit-logs)
- `layout/`: Application shell and navigation components
- `shared/`: Generic reusable components and forms

**Benefits Achieved**:

- ✅ Better code organization and maintainability
- ✅ Clearer component purpose and scope
- ✅ Easier navigation for developers
- ✅ Improved scalability for future features
- ✅ All import paths updated to use `@/components/...` aliases
- ✅ TypeScript compilation verified and passing

### State Management Strategy

#### Architectural Principles

The frontend follows a **feature-based modular architecture** with clear separation of concerns:

- **Feature Isolation**: Each domain (passwords, folders, audit-logs) has its own hooks, contexts, and utilities
- **Shared Foundation**: Common functionality is centralized in `shared/` directories
- **Consistent Patterns**: All features follow the same organizational structure
- **Absolute Imports**: Using `@/` prefix for clean, maintainable import paths
- **Type Safety**: Full TypeScript integration with proper type definitions

#### Custom Hooks (`resources/js/hooks/`)

**Organized by Feature Domain:**

```typescript
// Shared Hooks (hooks/shared/)
- useAppearance: Theme management (light/dark mode)
- useInitials: User initials generation
- useIsMobile: Mobile viewport detection
- useMobileNavigation: Mobile navigation state

// Password Hooks (hooks/passwords/)
- usePasswordListState: Password filtering and sorting state
- usePasswordSelection: Multi-selection state management
- usePasswords: Core password data management

// Folder Hooks (hooks/folders/)
- useFolderListState: Folder filtering and management
- useFolderSelection: Folder selection state

// Audit Log Hooks (hooks/audit-logs/)
- useAuditLogListState: Audit log data management
```

#### Context Providers (`resources/js/contexts/`)

**Feature-Based Organization:**

```typescript
// Shared Contexts (contexts/shared/)
- ModalProviders: Global dialog state management

// Password Contexts (contexts/passwords/)
- CreatePasswordProvider: Password creation context
- DeletePasswordProvider: Password deletion context
- EditPasswordProvider: Password editing context
- ViewPasswordProvider: Password viewing context
- PasswordProviders: Combined password providers

// Folder Contexts (contexts/folders/)
- DeleteFolderProvider: Folder deletion context
- EditFolderProvider: Folder editing context
- FolderProviders: Combined folder providers
```

### Type System (`resources/js/types/`)

#### Core Types

```typescript
// passwords.d.ts
interface Password {
    id: number;
    type: 'normal' | 'ssh';
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    folder_id?: number;
    copied: number;
    last_used_at?: Date;
    expires_at?: Date;
    cli?: string;
    is_expired?: boolean;
    is_expired_soon?: boolean;
    password_power?: PasswordStrength;
    folder?: Folder;
}

interface PasswordFilters {
    folderId?: string;
    sort: SortKey;
    direction: SortDirection;
    search?: string;
    type?: PasswordType;
    perPage?: number;
    expiryFilter?: 'all' | 'expired' | 'expires_soon';
}

interface PasswordStatsData {
    type_distribution: {
        normal: number;
        ssh: number;
    };
    top_copied_passwords: Array<{
        id: number;
        name: string;
        copied: number;
        type: string;
    }>;
    total_copied_count: number;
    security_health: {
        strong: number;
        medium: number;
        weak: number;
    };
}

// folders.tsx
interface Folder {
    id: number;
    name: string;
    featured: boolean;
    passwords_count?: number;
    created_at: string;
    updated_at: string;
}
```

## Database Design and Performance

### Indexing Strategy

#### Passwords Table Optimization

```sql
-- Basic indexes
idx_passwords_user_name
idx_passwords_user_type_created
idx_passwords_user_folder_last_used
idx_passwords_user_expires

-- Composite indexes for complex queries
idx_passwords_user_type_last_used
idx_passwords_user_folder_created
idx_passwords_user_expires_created
idx_passwords_user_name_username
idx_passwords_user_copied_usage
idx_passwords_key_version_user
```

#### Audit Logs Performance

```sql
-- Query-specific indexes
idx_audit_user_password_action_created
idx_audit_user_action_created_id
idx_audit_password_action_created_user
idx_audit_user_context_created
idx_audit_ip_user_created
```

### Data Integrity

#### Constraints

- **Unique Constraints**: Password names per user, folder names per user
- **Foreign Key Constraints**: Proper referential integrity
- **Cascade Rules**: User deletion cascades, folder deletion nullifies

#### Validation

- **Application Level**: Request validation, model validation
- **Database Level**: NOT NULL constraints, enum values, unique indexes

## Configuration and Environment

### Key Configuration Files

#### Laravel Configuration

- `config/app.php`: Application settings
- `config/database.php`: Database connections
- `config/encryption.php`: Encryption keys and versions (implied)
- `config/auth.php`: Authentication settings
- `config/sanctum.php`: API authentication

#### Frontend Configuration

- `tsconfig.json`: TypeScript compiler options with path mapping
- `vite.config.ts`: Build configuration with Laravel integration
- `tailwind.config.js`: Styling configuration
- `eslint.config.js`: Code quality rules
- `resources/css/app.css`: Chart color variables using consistent blue palette

#### Package Management

- `composer.json`: PHP dependencies and scripts
- `package.json`: Node.js dependencies and build scripts

### Development Workflow

#### Concurrent Development (`composer.json` dev script)

```bash
# Runs simultaneously:
- php artisan serve      # Laravel server
- php artisan queue:listen # Queue processing
- php artisan pail       # Log monitoring
- npm run dev           # Vite HMR
```

#### Build Commands

```bash
npm run build          # Production build
npm run build:ssr      # SSR build
npm run types          # TypeScript checking
npm run lint           # ESLint
npm run format         # Prettier formatting
```

## Testing Strategy

### Backend Testing (Pest PHP)

- **Feature Tests**: HTTP endpoint testing
- **Unit Tests**: Service and model testing
- **Database Tests**: Migration and model testing

### Frontend Testing (Vitest + Testing Library)

**LifeHub has achieved comprehensive frontend test coverage with 150 passing tests** across all React components, providing enterprise-grade frontend reliability.

#### Frontend Test Coverage Results

- **Total Tests**: 150 passing tests
- **Test Files**: 14 complete test suites
- **Coverage**: 100% component testing for all features
- **Test Framework**: Vitest + React Testing Library + jsdom
- **Test Execution Time**: ~3.5 seconds

#### Complete Component Test Coverage

**Dashboard Components** (35 tests)

- `expired-passwords-list.test.tsx` (10 tests)
- `expiring-passwords-list.test.tsx` (10 tests)
- `recent-passwords-list.test.tsx` (13 tests)
- Testing: Empty states, data rendering, navigation, responsive behavior

**Password Management Components** (33 tests)

- `password-table-row.test.tsx` (17 tests)
- `passwords-table.test.tsx` (16 tests)
- Testing: CRUD operations, selection, sorting, interactions, context providers

**Folder Management Components** (24 tests)

- `folders-header.test.tsx` (12 tests)
- `folders-table.test.tsx` (12 tests)
- Testing: Folder operations, bulk actions, creation dialogs, state management

**Audit Log Components** (13 tests)

- `audit-logs-header.test.tsx` (9 tests)
- `audit-logs-table.test.tsx` (4 tests)
- Testing: Log display, filtering, date handling, security context

**Shared UI Components** (35 tests)

- `markdown-reader.test.tsx` (12 tests)
- `table-pagination.test.tsx` (17 tests)
- `quick-tooltip.test.tsx` (12 tests)
- Testing: Reusable components, accessibility, prop handling

**Form Components** (10 tests)

- `smart-radio-group.test.tsx` (3 tests)
- `date-input.test.tsx` (3 tests)
- Testing: Form interactions, validation, user input handling

#### Frontend Testing Architecture

**Testing Stack**

```typescript
// vitest.config.ts - Testing configuration
- Framework: Vitest (Vite-native testing)
- Environment: jsdom (browser simulation)
- Testing Library: @testing-library/react
- User Interactions: @testing-library/user-event
- Mocking: Vitest native mocking
```

**Test Organization Structure**

```
resources/js/components/
├── features/
│   ├── dashboard/__tests__/           # Dashboard component tests
│   ├── passwords/__tests__/           # Password management tests
│   ├── folders/__tests__/             # Folder management tests
│   └── audit-logs/__tests__/          # Audit log tests
└── shared/__tests__/                  # Shared component tests
    └── forms/__tests__/               # Form component tests
```

**Comprehensive Mocking Strategy**

- **UI Components**: Complete ShadCN/Radix UI component mocking
- **Icons**: Comprehensive Lucide React icon mocking (20+ icons)
- **Context Providers**: React context mocking for state management
- **Global Functions**: Laravel route function and other globals
- **Browser APIs**: ResizeObserver and other browser API mocking

#### Advanced Testing Patterns

**Context Provider Testing**

```typescript
// Example: Password management with context
const renderWithContext = (component: React.ReactElement) => {
    return render(
        <EditPasswordProvider>
            <DeletePasswordProvider>
                {component}
            </DeletePasswordProvider>
        </EditPasswordProvider>
    );
};
```

**Component Interaction Testing**

```typescript
// Example: Complex user interactions
it('handles bulk password selection', async () => {
    const user = userEvent.setup();
    render(<PasswordsTable passwords={mockData} hasFullFunctionality={true} />);

    await user.click(screen.getByLabelText('Select all passwords'));
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(3);
});
```

**Accessibility Testing**

```typescript
// Example: ARIA compliance testing
it('provides correct ARIA labels', () => {
    render(<PasswordTableRow password={mockPassword} canSelect={true} />);
    expect(screen.getByLabelText('Select password GitHub Account')).toBeInTheDocument();
});
```

#### Test Categories Covered

**Functional Testing**

- Component rendering and props handling
- User interactions (clicks, form input, keyboard navigation)
- State management and updates
- Conditional rendering logic

**Integration Testing**

- Context provider integration
- Component composition and communication
- Props drilling and data flow
- Event handling and callbacks

**Accessibility Testing**

- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Focus management

**Edge Case Testing**

- Empty states and error conditions
- Loading states and async operations
- Boundary value testing
- Error handling and recovery

**UI/UX Testing**

- Responsive behavior
- Styling and CSS classes
- Theme consistency
- Icon and visual element presence

#### Frontend Testing Benefits

1. **Component Reliability**: All UI components thoroughly tested for expected behavior
2. **Regression Prevention**: Changes cannot break UI functionality without test failures
3. **Development Confidence**: New features can be added with assurance of UI stability
4. **Documentation**: Tests serve as living documentation of component behavior
5. **Refactoring Safety**: UI refactoring protected by comprehensive test coverage

#### Continuous Frontend Testing

- **Fast Execution**: 150 tests complete in ~3.5 seconds
- **TypeScript Integration**: Full type checking during test execution
- **Component Isolation**: Each component tested independently with proper mocking
- **User-Centric Testing**: Focus on user interactions rather than implementation details

This comprehensive frontend test coverage ensures reliable UI behavior, excellent user experience, and maintainable React components across all features of the LifeHub application.

#### Running Frontend Tests

```bash
# Run all frontend tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Run specific test file
npx vitest password-table-row.test.tsx

# Run tests with pattern matching
npx vitest --grep "password"
```

**Note**: See `docs/FRONTEND_TESTING_GUIDE.md` for comprehensive frontend testing patterns, best practices, and detailed component testing guides.

### Test Structure (`tests/`)

```
tests/
├── Feature/
│   ├── Auth/                    # Authentication tests
│   ├── Controllers/API/         # API endpoint tests
│   ├── Models/                  # Model behavior tests
│   ├── Passwords/               # Password management tests
│   └── Services/                # Service layer tests
└── Unit/                        # Unit tests
```

## Security Considerations

### Authentication & Authorization

- **Laravel Sanctum**: API token authentication
- **Policy-based Authorization**: Granular permission control
- **User Isolation**: All data strictly scoped to users

### Encryption & Data Protection

- **Envelope Encryption**: Multi-layer password protection
- **Key Versioning**: Secure key rotation capability
- **Secure Storage**: Encrypted database fields

### Audit & Monitoring

- **Comprehensive Logging**: All password actions tracked
- **IP Tracking**: Security audit trails
- **Context Awareness**: Source tracking (web/api/cli)

### Input Validation

- **Request Validation**: Server-side validation
- **XSS Protection**: Output encoding
- **CSRF Protection**: Laravel built-in CSRF tokens

## API Integration

### Internal API Structure

- **Inertia.js**: Seamless SPA communication
- **RESTful Design**: Standard HTTP methods
- **JSON Responses**: Structured API responses

### Utility Functions (`app/Utils/functions.php`)

```php
api_response($data, $status, $message, $errors): JsonResponse
// JSend-compliant API responses
```

## Development Patterns and Conventions

### Laravel Patterns

- **Service Layer**: Business logic separation
- **Repository Pattern**: Query service abstraction
- **Policy Authorization**: Permission-based access control
- **Request Validation**: Dedicated form request classes

### React Patterns

- **Custom Hooks**: Reusable state logic
- **Component Composition**: Modular UI architecture
- **TypeScript Interfaces**: Strong typing throughout
- **Context Providers**: Global state management

### Code Organization

- **Feature-based Structure**: Grouped by functionality
- **Separation of Concerns**: Clear layer boundaries
- **Dependency Injection**: Service container usage
- **Configuration Management**: Environment-based settings

## Deployment and Production

### Production Considerations

- **Environment Configuration**: Secure key management
- **Database Optimization**: Proper indexing for scale
- **Caching Strategy**: Laravel caching for performance
- **Queue Processing**: Background job handling
- **Session Management**: Secure session storage

### Performance Optimization

- **Database Indexing**: Query-specific indexes
- **Eager Loading**: Relationship optimization
- **Pagination**: Large dataset handling
- **Frontend Optimization**: Vite bundling and tree shaking

## Test Coverage Achievement

### PHP Test Coverage Results (June 9, 2025)

**LifeHub has achieved exceptional 99.8% PHP test coverage**, representing enterprise-grade code quality and reliability assurance.

#### Coverage Summary

- **Total Tests**: 525 passing tests
- **Total Assertions**: 1,429 assertions
- **Overall Coverage**: 99.8%
- **Test Execution Time**: ~15 seconds

#### Perfect 100% Coverage Achieved

The following components have complete test coverage:

**Controllers & API**

- All HTTP Controllers (Password, Folder, Audit Log, Auth, Settings)
- All API Controllers
- All Middleware components

**Models & Data Layer**

- Password Model (100%)
- User Model (100%)
- Folder Model (100%)
- PasswordAuditLog Model (100%)

**Business Logic & Services**

- EnvelopeEncryptionService (100%)
- FolderService (100%)
- PasswordService (100%)
- PasswordQueryService (100%)
- AuditLogQueryService (100%)
- PasswordStatsService (100%)

**HTTP Requests & Validation**

- All Form Request classes (100%)
- All validation logic (100%)

**Authorization & Security**

- All Policy classes (100%)
- All authentication logic (100%)

**Console Commands**

- RotatePasswordEncryptionKeys command (100%)

**Utilities & Enums**

- All utility functions (100%)
- All enum classes (100%)
- All provider classes (100%)

#### Near-Perfect Coverage

Two components have minimal coverage gaps:

1. **AuditLogService**: 96.3% coverage

    - Missing: 1 line (default 'web' context return - unreachable during test execution)

2. **PasswordStrengthCalculator**: 98.8% coverage
    - Missing: 1 line ('Awesome' label assignment - unreachable with current scoring algorithm)

#### Test Organization Structure

```
tests/
├── Feature/                     # Integration & feature tests
│   ├── Auth/                   # Authentication workflows
│   ├── Controllers/            # HTTP endpoint testing
│   ├── Models/                 # Model behavior & relationships
│   ├── Passwords/              # Password management features
│   ├── Services/               # Business logic testing
│   ├── Policies/               # Authorization testing
│   └── Utils/                  # Utility function testing
└── Unit/                       # Isolated unit tests
    └── PasswordStrengthCalculatorTest.php
```

#### Test Categories Covered

**Functional Testing**

- All CRUD operations for passwords, folders, audit logs
- Password statistics generation and data isolation
- Complex business logic scenarios
- Edge cases and error conditions
- Bulk operations and batch processing

**Security Testing**

- Authorization and access control
- Encryption/decryption workflows
- Input validation and sanitization
- Audit trail completeness

**Integration Testing**

- Database relationships and constraints
- Service layer interactions
- Request/response workflows
- Authentication and session management

**Performance & Reliability Testing**

- Large dataset handling
- Concurrent operations
- Error recovery scenarios
- Database transaction integrity

#### Quality Impact

This comprehensive test coverage provides:

1. **Regression Prevention**: Changes cannot break existing functionality without test failures
2. **Security Assurance**: All authorization and encryption logic is thoroughly validated
3. **Maintainability**: Confident refactoring with immediate feedback on breaking changes
4. **Documentation**: Tests serve as living documentation of expected behavior
5. **Development Velocity**: New features can be added with confidence in existing stability

#### Continuous Testing Strategy

- **Pre-commit hooks**: Ensure test passage before code commits
- **CI/CD Integration**: Automated test execution on all pull requests
- **Coverage monitoring**: Track coverage trends over time
- **Performance benchmarking**: Monitor test execution speed

This exceptional test coverage level places LifeHub among the highest quality codebases, ensuring reliable operation, security, and maintainability for password management operations.

## Extension Points

### Adding New Password Types

1. Update `PasswordTypes` enum
2. Modify `Password` model validation
3. Update form UI for new type
4. Add type-specific business logic

### Expanding Folder System for New Features

1. Create new content type models with `folder_id` relationships
2. Update folder ordering logic to include new content types
3. Extend folder management UI to handle multiple content types
4. Add polymorphic relationships if needed for complex associations

### Custom Encryption Algorithms

1. Implement encryption service interface
2. Update service container bindings
3. Add migration for new encryption fields

### Additional Audit Actions

1. Extend audit action constants
2. Update audit service methods
3. Add frontend display logic

### Third-party Integrations

1. Create dedicated service classes
2. Add configuration options
3. Implement appropriate error handling

This documentation provides a complete technical understanding of the LifeHub password management system, enabling AI agents to reason about the codebase, understand architectural patterns, and assist with development tasks effectively.

## Dashboard Features

### Overview

The dashboard provides actionable, focused views rather than heavy analytics, designed to be module-agnostic and scalable.

### Current Features

#### 1. Recently Used Passwords

- **Purpose**: Shows last 5 passwords that have been actually used
- **Business Logic**: Only includes passwords with `last_used_at` not null
- **Sorting**: Most recently used first
- **Service Method**: `PasswordQueryService::getRecentlyUsedPasswords()`

#### 2. Expiring Soon Passwords

- **Purpose**: Shows passwords expiring within 15 days
- **Business Logic**: Uses existing `expires_soon` filter logic
- **Sorting**: Earliest expiring first (most urgent)
- **Limit**: 5 items
- **Service Method**: `PasswordQueryService::getFilteredPasswords()` with `expiry_filter`

#### 3. Recently Expired Passwords

- **Purpose**: Shows passwords expired in the last 30 days
- **Business Logic**: Excludes very old expired passwords
- **Sorting**: Most recently expired first
- **Limit**: 5 items
- **Service Method**: `PasswordQueryService::getRecentlyExpiredPasswords()`

### Dashboard Layout

#### Responsive Grid System

```
Desktop/Tablet:
┌─────────────────────────────────────┐
│           Recently Used             │
│            (Full Width)             │
└─────────────────────────────────────┘
┌─────────────────┬───────────────────┐
│  Expiring Soon  │ Recently Expired  │
│   (If Present)  │   (If Present)    │
└─────────────────┴───────────────────┘

Mobile:
┌─────────────────────────────────────┐
│           Recently Used             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│          Expiring Soon              │
│          (If Present)               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Recently Expired             │
│         (If Present)                │
└─────────────────────────────────────┘
```

#### Conditional Rendering

- **Empty Section Hiding**: Expiring and expired sections are completely hidden when empty
- **Dynamic Grid**: Second row adapts to show 1 or 2 columns based on content availability
- **Always Visible**: Recently used section always shows (with empty state if needed)

### Component Architecture

#### Reusable PasswordsTable

- **Full Functionality Mode**: Sorting, selection, complex styling (passwords index page)
- **Dashboard Mode**: Simplified view without sorting/selection
- **Props**: `hasFullFunctionality`, `canSelect` for fine-grained control

#### Consistent Design System

- **Border Standard**: `border-sidebar-border/70 dark:border-sidebar-border`
- **Button Patterns**: Outline buttons with `asChild` for navigation
- **Empty States**: Create button using `useCreatePassword` context
- **Responsive Tables**: Max height with scroll for long lists

## Service Layer Architecture

### PasswordQueryService

Centralizes all password querying logic with clean separation of concerns.

#### Key Methods

```php
// Dashboard-specific methods
getRecentlyUsedPasswords($user, int $limit = 5): Collection
getRecentlyExpiredPasswords($user, int $limit = 5): Collection

// General querying
getFilteredPasswords($user, array $filters, bool $paginate, int $perPage): LengthAwarePaginator|Collection
```

#### Design Benefits

- **No Business Logic in Controllers**: Controllers only orchestrate service calls
- **Testable**: Service methods can be unit tested independently
- **Reusable**: Methods can be used across different features
- **Maintainable**: Business logic centralized and easier to modify

## Testing Strategy

### Test Coverage

- **Service Layer Tests**: Unit tests for all business logic methods
- **Controller Tests**: Integration tests for HTTP responses and Inertia data
- **Component Architecture**: Flexible components allow for easy testing

### Test Organization

```
tests/
├── Feature/
│   ├── Controllers/
│   │   └── DashboardControllerTest.php (13 tests, 170 assertions)
│   └── Services/
│       └── PasswordQueryServiceTest.php (12 tests, 39 assertions)
└── Unit/ (Future unit tests)
```

## Future Scalability

### Module-Agnostic Design

The dashboard is designed to easily accommodate future modules:

#### Pattern for New Modules

1. **Service Layer**: Create dedicated service classes (e.g., `DocumentQueryService`)
2. **Dashboard Components**: Follow established patterns (`RecentDocumentsList`)
3. **Controller Integration**: Add service calls to `DashboardController`
4. **Conditional Rendering**: Add logic for hiding empty sections

#### Examples of Future Modules

- **Documents**: Recent documents, expiring certificates
- **Tasks**: Overdue tasks, upcoming deadlines
- **Files**: Recently accessed files, storage warnings
- **Notes**: Recent notes, shared items

### Design System Consistency

All future dashboard components should follow established patterns:

- Use `border-sidebar-border/70 dark:border-sidebar-border` borders
- Implement "View all" buttons with pre-applied filters
- Use `useCreate[Module]` contexts for empty state actions
- Follow responsive grid patterns

## Performance Considerations

### Database Optimization

- **Indexed Queries**: All dashboard queries use proper database indexes
- **Eager Loading**: Relationships loaded efficiently with `with()`
- **Query Limits**: All queries properly limited to prevent performance issues

### Frontend Optimization

- **Component Lazy Loading**: Dashboard components loaded efficiently
- **Conditional Rendering**: Hidden sections don't render unnecessary DOM
- **TypeScript**: Full type safety prevents runtime errors

## Development Guidelines

### Code Organization

```
app/
├── Http/Controllers/          # Thin controllers, orchestration only
├── Services/                  # Business logic layer
└── Models/                    # Eloquent models with scopes

resources/js/
├── components/
│   └── features/
│       └── dashboard/         # Dashboard-specific components
├── types/                     # TypeScript definitions
└── pages/                     # Inertia page components
```

### Adding New Dashboard Features

1. **Create Service Method**: Add business logic to appropriate service
2. **Update Controller**: Add service call to `DashboardController`
3. **Create Component**: Follow established patterns
4. **Update Types**: Add TypeScript definitions
5. **Write Tests**: Cover service and controller logic
6. **Update Layout**: Integrate into responsive grid system
