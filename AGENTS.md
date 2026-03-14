# Agent Guidelines for Gasotrip

This is an Ionic/Angular project for calculating fuel trip costs.

## Commands

```bash
# Development
npm start              # Start dev server (ng serve)
npm run watch         # Build with watch mode

# Build
npm run build         # Production build (ng build)

# Testing
npm test              # Run all tests (ng test --watch)
npm test -- --no-watch --browsers=ChromeHeadless  # Single run
npm test -- --include="**/tab1.page.spec.ts"      # Run single test file

# Linting
npm run lint          # Run ESLint (ng lint)
```

## Code Style

### TypeScript
- Use strict TypeScript (strict mode enabled in tsconfig.json)
- Always specify return types for functions
- Use `const` over `let`, avoid `var`

### Angular Patterns
- Components must use `Page` or `Component` suffix (enforced by ESLint)
- Component selectors must use `app` prefix with kebab-case
- Directive selectors must use `app` prefix with camelCase
- Use standalone: false for NgModule-based components (legacy)

### Formatting (EditorConfig)
- 2 spaces for indentation
- Single quotes for TypeScript
- UTF-8 charset
- Trim trailing whitespace
- Insert final newline

### Naming
- Classes: PascalCase (e.g., `Tab1Page`)
- Interfaces: PascalCase with optional `I` prefix (prefer without)
- Methods/variables: camelCase
- Files: kebab-case (e.g., `tab1.page.ts`)
- CSS classes: kebab-case

### Imports
- Use absolute imports when possible (configured in tsconfig.json)
- Group imports: Angular core, third-party, app modules, relative paths

### Error Handling
- Use try/catch for async operations
- Display user-friendly error messages in UI
- Log errors to console for debugging

### Templates
- Use async pipe with observables where possible
- Avoid inline templates for complex logic
- Use Ionic components (ion-*)

## Project Structure

```
src/app/
  tab1/          # Fuel calculator page
  tab2/          # Placeholder
  tab3/          # Placeholder
  tabs/          # Tab navigation
  explore-container/
```

## Notes

- This is an Ionic 8 / Angular 19 project
- Uses NgModules (not standalone components)
- Target: ES2022
- Test framework: Karma + Jasmine