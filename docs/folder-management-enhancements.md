# Folder Management Enhancements

## Overview

The folder management system has been enhanced with improved maintainability, better UX, and cleaner code architecture. These enhancements include global dialog providers, featured filtering, a dedicated service layer, and refined UI components.

## Key Features

### 1. Global Dialog Providers

#### Implementation

- **Folder Providers**: `resources/js/contexts/folder-providers.tsx`
- **Edit Context**: `resources/js/contexts/edit-folder-context.tsx`
- **Delete Context**: `resources/js/contexts/delete-folder-context.tsx`
- **Global Components**:
    - `resources/js/components/folders/global-edit-folder-dialog.tsx`
    - `resources/js/components/folders/global-delete-folder-dialog.tsx`

#### Usage

The folder providers are automatically available throughout the application via the `DialogProviders` component. Components can access the global dialogs using the provided hooks:

```typescript
// Edit folder dialog
const { openDialog: openEditDialog } = useEditFolder();
openEditDialog(folder);

// Delete folder dialog (single or bulk)
const { openDialog: openDeleteDialog, openBulkDialog } = useDeleteFolder();
openDeleteDialog(folder); // Single folder
openBulkDialog(selectedFolderIds); // Bulk deletion
```

#### Benefits

- **Reusability**: Dialogs are globally available and reusable across components
- **State Management**: Centralized dialog state management
- **Consistency**: Uniform dialog behavior throughout the application
- **Memory Efficiency**: Single dialog instances instead of multiple per component

### 2. Featured Filtering

#### Implementation

- **Filter Component**: `resources/js/components/folders/folder-filters.tsx`
- **Types**: Updated `resources/js/types/folders.tsx` with `featured` filter option
- **Backend Support**: Enhanced `FolderService` with featured filtering

#### Filter Options

- **All**: Show all folders (default)
- **Featured Only**: Show only featured folders
- **Not Featured Only**: Show only non-featured folders

#### Usage

```typescript
// In component
const { featured, setFeatured } = useFolderListState({ initialFilters: filters });

// Filter component
<FolderFilters featured={featured} setFeatured={setFeatured} />
```

### 3. Service Layer Architecture

#### Implementation

- **Service Class**: `app/Services/FolderService.php`
- **Controller Refactor**: `app/Http/Controllers/FolderController.php`

#### Service Methods

```php
// Core CRUD operations
public function createFolder(User $user, array $data): Folder
public function updateFolder(Folder $folder, array $data): Folder
public function deleteFolder(Folder $folder): bool

// Bulk operations
public function bulkUpdateFolders(User $user, array $folderIds, array $data): int
public function bulkDeleteFolders(User $user, array $folderIds): int

// Filtering and pagination
public function getFolders(User $user, array $filters = [])
```

#### Benefits

- **Separation of Concerns**: Business logic separated from HTTP handling
- **Testability**: Service methods are easily unit testable
- **Reusability**: Service methods can be used across different controllers/contexts
- **Maintainability**: Centralized business logic makes changes easier

### 4. UI Improvements

#### Removed Password Count Display

- Cleaned up folder table to focus on essential information
- Removed passwords count column and related sorting
- Updated table headers and row components

#### Enhanced Filtering Interface

- Star icon filter dropdown for featured status
- Intuitive checkbox interface for filter selection
- Integrated with existing search functionality

## Technical Implementation Details

### Frontend Architecture

#### State Management

```typescript
// Hook: use-folder-list-state.ts
const useFolderListState = ({ initialFilters }) => {
    // Manages: search, sort, direction, per_page, featured
    // Provides: debounced updates, filter management
};
```

#### Component Structure

```
folders/
├── folder-filters.tsx              // Featured status filtering
├── folder-providers.tsx            // Global dialog providers
├── global-edit-folder-dialog.tsx   // Global edit dialog
├── global-delete-folder-dialog.tsx // Global delete dialog
├── folders-search-and-filters.tsx  // Search + filters
├── folders-table.tsx              // Main table
├── folders-table-header.tsx       // Table header (no passwords count)
└── folder-table-row.tsx           // Table row (no passwords count)
```

### Backend Architecture

#### Service Layer

```php
namespace App\Services;

class FolderService
{
    // Handles all folder business logic
    // Provides filtering, pagination, CRUD operations
    // Validates ownership and permissions
}
```

#### Controller Refactor

```php
class FolderController extends Controller
{
    public function __construct(protected FolderService $folderService) {}

    // All methods delegate to service layer
    // Controllers only handle HTTP concerns
}
```

### Testing Strategy

#### Service Layer Tests

- **Location**: `tests/Feature/Services/FolderServiceTest.php`
- **Coverage**: All service methods including edge cases
- **Focus**: Business logic validation, filtering, permissions

#### Controller Tests

- **Location**: `tests/Feature/Controllers/FolderControllerTest.php`
- **Coverage**: HTTP endpoints, validation, authorization
- **Focus**: Request/response handling, integration with service layer

## Migration Guide

### For Developers

#### Using Global Dialogs

**Before:**

```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false);
<EditFolderDialog folder={folder} open={editDialogOpen} setOpen={setEditDialogOpen} />
```

**After:**

```typescript
const { openDialog: openEditDialog } = useEditFolder();
// Dialog renders globally, just trigger it
openEditDialog(folder);
```

#### Using Featured Filtering

**Before:**

```typescript
// No featured filtering available
```

**After:**

```typescript
const { featured, setFeatured } = useFolderListState({ initialFilters });
<FolderFilters featured={featured} setFeatured={setFeatured} />
```

#### Using Service Layer

**Before:**

```php
// Business logic in controller
$folders = auth()->user()->folders()->withCount('passwords')->paginate(10);
```

**After:**

```php
// Delegate to service
$folders = $this->folderService->getFolders(auth()->user(), $filters);
```

### Breaking Changes

1. **Passwords Count Removal**

    - No longer displayed in folder lists
    - Removed from sorting options
    - Updated table layout

2. **Component Props Changes**

    - `FolderRowActions`: Removed `onEdit` prop
    - `FoldersSearchAndFilters`: Added `featured` and `setFeatured` props

3. **Type Updates**
    - `FolderSortKey`: Removed `'passwords_count'` option
    - `FolderFilters`: Added `featured` property

## Performance Considerations

### Frontend

- **Debounced Search**: 300ms debounce for search input
- **Global Dialogs**: Reduced memory footprint with single dialog instances
- **Optimized Rendering**: Removed unnecessary password count queries

### Backend

- **Service Layer**: Optimized queries with proper indexes
- **Filtering**: Efficient database queries for featured status
- **Bulk Operations**: Single database queries for bulk updates/deletes

## Security Enhancements

### Authorization

- **Service Layer**: Ownership validation for all operations
- **Bulk Operations**: Per-folder authorization checks
- **Exception Handling**: Proper error messages for unauthorized access

### Validation

- **Request Validation**: Maintained existing validation rules
- **Service Validation**: Additional business logic validation
- **Type Safety**: TypeScript interfaces for better type checking

## Future Considerations

### Potential Enhancements

1. **Folder Categories**: Group folders by categories
2. **Advanced Sorting**: Multi-column sorting options
3. **Folder Templates**: Pre-defined folder structures
4. **Bulk Operations UI**: Enhanced bulk selection interface

### Scalability

- **Pagination**: Already implemented for large folder lists
- **Caching**: Consider Redis caching for frequently accessed folders
- **API Rate Limiting**: Implement rate limiting for bulk operations

## Troubleshooting

### Common Issues

#### Dialog Not Opening

- Ensure `FolderProviders` is wrapped around your component tree
- Check that hooks are called within the provider context

#### Filtering Not Working

- Verify backend supports the `featured` filter parameter
- Check that frontend state is properly synchronized

#### Service Layer Errors

- Ensure proper dependency injection in controller constructor
- Verify service is properly registered in Laravel container

### Development Tips

- Use browser DevTools to inspect dialog state
- Check network requests for proper filter parameters
- Verify database queries include proper filtering conditions
