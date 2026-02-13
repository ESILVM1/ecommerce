# Frontend Testing Guide

This directory contains test utilities and configuration for the frontend application.

## Test Setup

The testing infrastructure uses:
- **Vitest** - Fast unit test framework
- **React Testing Library** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Files Location

Tests are co-located with the components/modules they test:

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Button.test.tsx          # ✅ Tests here
│       ├── Input.tsx
│       └── Input.test.tsx           # ✅ Tests here
└── features/
    ├── auth/
    │   └── store/
    │       ├── authStore.ts
    │       └── authStore.test.ts    # ✅ Tests here
    └── cart/
        └── store/
            ├── cartStore.ts
            └── cartStore.test.ts    # ✅ Tests here
```

## Test Naming Convention

- Component tests: `ComponentName.test.tsx`
- Store tests: `storeName.test.ts`
- Utility tests: `utilityName.test.ts`
- Hook tests: `useHookName.test.ts`

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Store Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from './myStore';

describe('myStore', () => {
  beforeEach(() => {
    // Reset store state
    useMyStore.setState({ items: [] });
  });

  it('updates state correctly', () => {
    useMyStore.getState().addItem('test');
    expect(useMyStore.getState().items).toHaveLength(1);
  });
});
```

## Available Test Utilities

### Custom Matchers (from @testing-library/jest-dom)

- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveStyle()`
- `toHaveValue()`
- `toBeDisabled()`
- `toBeVisible()`
- And many more...

### User Interaction

```typescript
const user = userEvent.setup();

await user.click(element);
await user.type(input, 'text');
await user.selectOptions(select, 'option');
await user.upload(input, file);
```

### Queries

Prefer queries in this order:
1. `getByRole()` - Most accessible
2. `getByLabelText()` - Forms
3. `getByPlaceholderText()` - Forms
4. `getByText()` - Text content
5. `getByTestId()` - Last resort

## Mocks

### LocalStorage
LocalStorage is mocked in `setup.ts`:
```typescript
localStorage.setItem('key', 'value');
localStorage.getItem('key');
```

### Window.matchMedia
Media queries are mocked in `setup.ts`.

### API Calls
Mock API calls in individual tests:
```typescript
import { vi } from 'vitest';
import api from '@/lib/api';

vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });
```

## Test Coverage Goals

- **Components:** >70% coverage
- **Stores:** >80% coverage
- **Utilities:** >90% coverage
- **Overall:** >70% coverage

## Best Practices

1. **Test user behavior, not implementation details**
   ```typescript
   // ❌ Bad
   expect(component.state.count).toBe(1);
   
   // ✅ Good
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

2. **Use user-event over fireEvent**
   ```typescript
   // ❌ Bad
   fireEvent.click(button);
   
   // ✅ Good
   const user = userEvent.setup();
   await user.click(button);
   ```

3. **Query by accessibility features**
   ```typescript
   // ✅ Good
   screen.getByRole('button', { name: 'Submit' });
   screen.getByLabelText('Email');
   ```

4. **Clean up after tests**
   ```typescript
   beforeEach(() => {
     // Reset state
   });
   
   afterEach(() => {
     // Clean up
     vi.clearAllMocks();
   });
   ```

5. **Test error states**
   ```typescript
   it('displays error message on failure', async () => {
     // Trigger error
     // Assert error message is shown
   });
   ```

## Continuous Integration

Tests should run in CI/CD pipeline:
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test -- --run
  
- name: Check coverage
  run: npm run test:coverage
```

## Debugging Tests

### Run single test file
```bash
npx vitest run src/components/Button.test.tsx
```

### Debug in UI mode
```bash
npm run test:ui
```

### Console logging
```typescript
import { screen } from '@testing-library/react';

// Print current DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
