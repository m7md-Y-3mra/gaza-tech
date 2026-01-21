# Form Handling & Error Handling

## Form Handling Pattern

Forms use a consistent pattern with react-hook-form + zod:

1. Define zod schema for validation
2. Use `@hookform/resolvers/zod` with `useForm()`
3. Wrap server actions with `errorHandler()` from `utils/error-handler.ts`
4. Server actions return `{ success: boolean, data?: T, message?: string, errors?: Record<string, string> }`
5. Use custom field components (`TextField`, `CheckboxField`) for consistent error display

## Error Handling

**Server Actions**: Wrap all server actions with `errorHandler()`:
```typescript
import { errorHandler } from '@/utils/error-handler';

export const myAction = errorHandler(async (data) => {
  // Action logic
  return result;
});
```

This provides automatic handling for:
- Zod validation errors
- Custom errors (extends `CustomError`)
- Unexpected errors (logged to console)

**Custom Errors**: Throw `CustomError` for business logic errors:
```typescript
import CustomError from '@/utils/CustomError';

throw new CustomError('Error message', { field: 'error detail' });
```
