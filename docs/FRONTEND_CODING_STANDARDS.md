# Frontend Coding Standards

## React Component Export Style

### Standard Format

All React components should be exported using function declarations, not arrow functions:

**✅ Correct:**

```tsx
export function ComponentName() {
    return <div>Content</div>;
}

export function ComponentWithProps({ prop1, prop2 }: ComponentProps) {
    return <div>{prop1}</div>;
}
```

**❌ Incorrect:**

```tsx
export const ComponentName = () => {
    return <div>Content</div>;
};

export const ComponentWithProps: FC<ComponentProps> = ({ prop1, prop2 }) => {
    return <div>{prop1}</div>;
};
```

### Key Benefits

1. **Hoisting**: Function declarations are hoisted, allowing for more flexible component organization
2. **Clarity**: Function declarations are immediately identifiable as components
3. **Consistency**: Uniform style across the entire codebase
4. **TypeScript**: Better TypeScript inference without needing explicit `FC` types

### Exceptions

The following should continue using arrow function exports:

- **Hooks**: Custom hooks starting with `use`
- **Utility functions**: Helper functions that are not React components
- **UI Library components**: Components in `resources/js/components/ui/` directory

### ESLint Configuration

To enforce this standard, add the following ESLint rules to your `.eslintrc.js`:

```javascript
module.exports = {
    rules: {
        // Prefer function declarations for React components
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'function-declaration',
                unnamedComponents: 'function-expression',
            },
        ],
        // Discourage FC type annotation
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    'React.FC': {
                        message: 'Use function declarations instead of React.FC',
                        fixWith: 'function declaration',
                    },
                    'React.FunctionComponent': {
                        message: 'Use function declarations instead of React.FunctionComponent',
                        fixWith: 'function declaration',
                    },
                    FC: {
                        message: 'Use function declarations instead of FC',
                        fixWith: 'function declaration',
                    },
                },
            },
        ],
    },
};
```

### Pre-commit Hook

Add a pre-commit hook to catch violations:

```bash
#!/bin/sh
# Check for arrow function component exports
if git diff --cached --name-only | grep -E '\.(tsx?)$' | xargs grep -l 'export const [A-Z].*= (' | grep -v '/ui/'; then
  echo "❌ Found arrow function component exports. Use function declarations instead."
  echo "Run: npm run lint:fix to auto-fix these issues"
  exit 1
fi
```

### Migration Complete

As of this documentation, all React components in the codebase have been successfully migrated to use function declaration exports while preserving:

- All props and their types
- All return logic and JSX
- Component functionality and behavior

The migration excluded:

- Custom hooks (functions starting with `use`)
- Utility functions
- UI library components in `resources/js/components/ui/`
