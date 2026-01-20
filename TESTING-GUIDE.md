# Testing Guide - User Behavior First

This project follows [Testing Library's guiding principles](https://testing-library.com/docs/guiding-principles):

> **"The more your tests resemble the way your software is used, the more confidence they can give you."**

## ✅ DO: Test User Behavior

### Query by Accessible Roles (Best)

```typescript
// ✅ BEST - How screen readers and users interact
expect(screen.getByRole('button', { name: 'Add House' })).toBeVisible();
expect(screen.getByRole('heading', { name: 'Houses' })).toBeVisible();
expect(screen.getByRole('link', { name: /view listing/i })).toBeVisible();
expect(screen.getByRole('textbox', { name: 'Address' })).toBeVisible();
```

### Query by Text Users See

```typescript
// ✅ GOOD - What users read on screen
expect(screen.getByText('Loading...')).toBeVisible();
expect(screen.getByText('$500,000')).toBeVisible();
expect(screen.getByText(/no houses yet/i)).toBeVisible();
```

### Query by Label (Forms)

```typescript
// ✅ GOOD - How users identify form fields
expect(screen.getByLabelText('Street Address')).toBeVisible();
expect(screen.getByLabelText(/city/i)).toHaveValue('San Francisco');
```

### Test User Actions

```typescript
// ✅ GOOD - Simulate real user interactions
import { fireEvent } from '@testing-library/svelte';

const button = screen.getByRole('button', { name: 'Delete' });
await fireEvent.click(button);

const input = screen.getByLabelText('Price');
await fireEvent.input(input, { target: { value: '500000' } });
```

### Test Accessibility

```typescript
// ✅ GOOD - Ensure accessible to all users
const link = screen.getByRole('link', { name: 'View Listing' });
expect(link).toHaveAttribute('href', 'https://...');
expect(link).toHaveAttribute('target', '_blank');
expect(link).toHaveAttribute('rel', 'noopener noreferrer'); // Security!
```

---

## ❌ DON'T: Test Implementation Details

### Don't Query by CSS Classes

```typescript
// ❌ BAD - Testing internal structure
const spinner = container.querySelector('.loading-spinner');
expect(spinner).toBeInTheDocument();

// ✅ GOOD - Test what user sees
expect(screen.getByText('Loading...')).toBeVisible();
```

### Don't Test for Specific HTML Elements

```typescript
// ❌ BAD - Testing implementation
const svg = container.querySelector('svg');
expect(svg).toBeInTheDocument();

// ✅ GOOD - If icon is decorative, just test the text
expect(screen.getByText('Error occurred')).toBeVisible();

// ✅ GOOD - If icon has meaning, test via aria-label
expect(screen.getByLabelText('Error icon')).toBeVisible();
```

### Don't Test Internal State

```typescript
// ❌ BAD - Testing component internals
expect(component.loading).toBe(false);
expect(component.formData.address).toBe('123 Main St');

// ✅ GOOD - Test visible output
expect(screen.getByText('123 Main St')).toBeVisible();
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
```

### Don't Test Exact CSS Styling

```typescript
// ❌ BAD - Testing visual implementation
expect(button).toHaveClass('btn-primary');
expect(element).toHaveStyle({ color: 'red' });

// ✅ GOOD - Test semantic meaning or visibility
expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
// If color matters for meaning, test aria attributes instead
```

---

## 📚 Query Priority (from Testing Library docs)

Use these queries **in this order**:

### 1. Accessible Queries (Everyone can use these)

- `getByRole` - Buttons, links, headings, inputs
- `getByLabelText` - Form fields
- `getByPlaceholderText` - Form inputs
- `getByText` - Non-interactive text
- `getByDisplayValue` - Current form value

### 2. Semantic Queries (Fallback)

- `getByAltText` - Images
- `getByTitle` - Title attributes

### 3. Test IDs (Last Resort)

- `getByTestId` - Only when nothing else works

### ❌ Never Use

- `querySelector()` with CSS classes
- `getElementById()`
- `getElementsByClassName()`

---

## 🎯 Real Examples from This Project

### Example 1: PropertyDetailsCard ✅

```typescript
// ✅ EXCELLENT - Tests user-visible content
it('renders property price', () => {
  render(PropertyDetailsCard, { props: { house: mockHouse } });
  expect(screen.getByText('$500,000')).toBeVisible();
});

// ✅ EXCELLENT - Tests accessible link behavior
it('renders listing URL link', () => {
  const link = screen.getByRole('link', { name: /view original listing/i });
  expect(link).toBeVisible();
  expect(link).toHaveAttribute('href', 'https://zillow.com/property/123');
  expect(link).toHaveAttribute('target', '_blank');
});

// ✅ EXCELLENT - Tests visibility based on data
it('hides optional fields when null', () => {
  const house = { ...mockHouse, price: null };
  render(PropertyDetailsCard, { props: { house } });
  expect(screen.queryByText('$500,000')).not.toBeInTheDocument();
});
```

### Example 2: HouseForm (Future Test)

```typescript
// ✅ GOOD - Test user workflow
it('allows user to submit valid house data', async () => {
  const onsubmit = vi.fn();
  render(HouseForm, { props: { onsubmit, /* ... */ } });

  // User fills out form
  await fireEvent.input(screen.getByLabelText('Street Address'), {
    target: { value: '123 Main St' }
  });
  await fireEvent.input(screen.getByLabelText('City'), {
    target: { value: 'San Francisco' }
  });

  // User clicks submit
  await fireEvent.click(screen.getByRole('button', { name: 'Add House' }));

  // Verify callback called with correct data
  expect(onsubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      address: '123 Main St',
      city: 'San Francisco'
    })
  );
});

// ✅ GOOD - Test validation feedback user sees
it('shows validation error when ZIP code is invalid', async () => {
  render(HouseForm, { props: { /* ... */ } });

  await fireEvent.input(screen.getByLabelText('ZIP Code'), {
    target: { value: '1234' } // Invalid ZIP
  });

  await fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

  // User sees error message
  expect(screen.getByText(/ZIP code must be exactly 5 digits/i)).toBeVisible();
});
```

---

## 🧪 Test Categories

### 1. **Component Tests** (UI behavior)
- What does user see?
- Can user interact with it?
- Does it respond correctly?

### 2. **Schema/Validation Tests** (Business logic)
- Does validation catch bad input?
- Are error messages helpful?
- Edge cases handled?

### 3. **Integration Tests** (User workflows)
- Can user complete a task?
- Do components work together?
- Does data flow correctly?

---

## 🚫 Common Anti-Patterns to Avoid

```typescript
// ❌ Testing implementation
expect(component.state.isLoading).toBe(false);
expect(component.handleClick).toBeDefined();
wrapper.find('.card-container').exists();

// ❌ Testing framework internals
expect(component.$$.props).toEqual({ ... });
expect(component.$$.callbacks).toHaveLength(1);

// ❌ Snapshot testing (brittle, not user-focused)
expect(container).toMatchSnapshot();

// ❌ Testing styles
expect(element).toHaveClass('btn-primary');
expect(element).toHaveStyle({ backgroundColor: 'blue' });
```

---

## 💡 Philosophy Summary

**Ask yourself:**
- ❓ "Does the user see/do this?" → ✅ Test it
- ❓ "Is this an internal detail?" → ❌ Don't test it
- ❓ "Would this break user experience?" → ✅ Test it
- ❓ "Can I refactor without changing this test?" → ✅ Good test

**Examples:**
- User sees "Loading..." → ✅ Test
- Component has `.loading-spinner` class → ❌ Don't test
- Button works when clicked → ✅ Test
- Button uses `onclick` vs `addEventListener` → ❌ Don't test
- Form shows validation errors → ✅ Test
- Validation uses Zod vs custom code → ❌ Don't test

---

## 📖 Further Reading

- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Which Query Should I Use?](https://testing-library.com/docs/queries/about#priority)
