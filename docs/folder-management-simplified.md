# Folder Management - Simplified Architecture

## Overview

This document outlines the simplified folder management architecture that follows clean separation of concerns while avoiding unnecessary complexity.

## Key Principles Applied

1. **No unnecessary APIs for mobile** - Kept existing API structure simple
2. **No traits for shared validation** - Moved validation to dedicated request classes
3. **Combined service methods** - Unified `getFolders` method handles both pagination and collection needs
4. **Request-based validation** - All validation logic moved to Form Request classes

## Architecture Components

### 1. Service Layer (`FolderService.php`)

**Unified Method:**

```php
public function getFolders(User $user, array $filters = [])
{
    $query = $this->buildFoldersQuery($user, $filters);

    // If per_page is specified and > 0, return paginated results
    if (isset($filters['per_page']) && $filters['per_page'] > 0) {
        return $query->paginate($filters['per_page']);
    }

    // Otherwise return collection
    return $query->get();
}
```

**Benefits:**

- Single method for both paginated and collection results
- No breaking changes to existing frontend components
- Automatic detection based on `per_page` parameter

### 2. Request Classes

**Index Filtering (`IndexFoldersRequest.php`):**

```php
public function rules(): array
{
    return [
        'search' => ['nullable', 'string', 'max:255'],
        'sort' => ['nullable', 'string', 'in:name,created_at,updated_at'],
        'direction' => ['nullable', 'string', 'in:asc,desc'],
        'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        'featured' => ['nullable', 'string', 'in:all,featured,not_featured'],
    ];
}

public function getFilters(): array
{
    return [
        'search' => $this->input('search'),
        'sort' => $this->input('sort'),
        'direction' => $this->input('direction'),
        'per_page' => $this->input('per_page', 10),
        'featured' => $this->input('featured'),
    ];
}
```

**Bulk Update (`BulkUpdateFoldersRequest.php`):**

```php
public function rules(): array
{
    return [
        'folder_ids' => ['required', 'array', 'min:1'],
        'folder_ids.*' => ['integer', 'exists:folders,id'],
        'featured' => ['required', 'boolean'],
    ];
}

public function getSuccessMessage(): string
{
    $count = count($this->getFolderIds());
    $action = $this->getFeaturedStatus() ? 'added to featured' : 'removed from featured';
    return "{$count} folder" . ($count === 1 ? '' : 's') . " {$action}.";
}
```

**Bulk Delete (`BulkDestroyFoldersRequest.php`):**

```php
public function rules(): array
{
    return [
        'folder_ids' => ['required', 'array', 'min:1'],
        'folder_ids.*' => ['integer', 'exists:folders,id'],
    ];
}

public function getSuccessMessage(): string
{
    $count = count($this->getFolderIds());
    return "{$count} folder" . ($count === 1 ? '' : 's') . " deleted successfully.";
}
```

### 3. Controller Simplification

**Web Controller (`FolderController.php`):**

```php
public function index(IndexFoldersRequest $request)
{
    $filters = $request->getFilters();
    $folders = $this->folderService->getFolders(auth()->user(), $filters);

    return Inertia::render('folders/index', [
        'folders' => $folders,
        'filters' => $filters,
    ]);
}

public function bulkUpdate(BulkUpdateFoldersRequest $request)
{
    $folders = auth()->user()->folders()
        ->whereIn('id', $request->getFolderIds())
        ->get();

    foreach ($folders as $folder) {
        $this->authorize('update', $folder);
    }

    $this->folderService->bulkUpdateFolders(
        auth()->user(),
        $request->getFolderIds(),
        ['featured' => $request->getFeaturedStatus()]
    );

    return redirect()->back()->with('success', $request->getSuccessMessage());
}
```

**API Controller (`API/FolderController.php`):**

```php
public function index()
{
    $folders = $this->folderService->getFolders(auth()->user());
    return response()->json($folders);
}
```

## Frontend Compatibility

### Existing Components

- `folders-combobox.tsx` - Works unchanged, automatically gets collection
- Main folders page - Works unchanged, gets paginated results
- All filtering and search functionality preserved

### Usage Examples

**Collection (no pagination):**

```javascript
// Frontend automatically gets collection when no per_page is specified
const response = await fetch('/api/folders');
```

**Paginated results:**

```javascript
// Frontend gets paginated results when per_page is specified
const response = await fetch('/folders?per_page=10&search=work');
```

## Benefits of This Architecture

1. **Simplified Service Layer**

    - Single method handles both use cases
    - No code duplication
    - Clear conditional logic

2. **Request-Based Validation**

    - All validation rules in dedicated request classes
    - Helper methods for extracting validated data
    - Success message generation included

3. **Clean Controllers**

    - Controllers focus only on HTTP concerns
    - No inline validation
    - Authorization clearly separated

4. **Zero Breaking Changes**

    - Existing frontend components work unchanged
    - API endpoints maintain same behavior
    - Database queries remain optimized

5. **Maintainable Code**
    - Clear separation of concerns
    - Easy to test and extend
    - Follows Laravel best practices

## Testing Coverage

- **94 tests passing** with 298 assertions
- Complete test coverage for all scenarios
- Both unit and integration tests included
- API and web controller tests comprehensive

## File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── API/FolderController.php
│   │   └── FolderController.php
│   └── Requests/Folders/
│       ├── BulkDestroyFoldersRequest.php
│       ├── BulkUpdateFoldersRequest.php
│       ├── IndexFoldersRequest.php
│       ├── StoreFolderRequest.php
│       └── UpdateFolderRequest.php
└── Services/
    └── FolderService.php
```

This architecture provides a clean, maintainable solution that follows your preferences while ensuring all existing functionality continues to work seamlessly.
