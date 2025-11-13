# Flutter Coding Guidelines - Clinico Mobile App

## Architecture

**Clean Architecture** with 3 layers:
- **Presentation Layer**: UI, Widgets, BLoC/Provider, Pages
- **Domain Layer**: Entities, Use Cases, Repository Interfaces
- **Data Layer**: Models, Data Sources, Repository Implementations

**Dependency Rule**: Presentation → Domain → Data

---

## Project Structure

```
lib/
├── core/                    # Shared utilities, theme, network
│   ├── constants/
│   ├── theme/
│   ├── utils/
│   ├── network/
│   └── error/
├── features/                # Feature modules
│   └── [feature_name]/
│       ├── data/
│       │   ├── models/
│       │   ├── datasources/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── shared/                  # Reusable widgets and models
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Files/Folders** | snake_case | `user_profile.dart` |
| **Classes/Enums** | PascalCase | `UserProfile`, `AuthBloc` |
| **Variables/Functions** | camelCase | `userName`, `fetchData()` |
| **Constants** | kPrefixCamelCase or SCREAMING_SNAKE_CASE | `kPrimaryColor`, `API_BASE_URL` |
| **Private Members** | _underscore prefix | `_privateMethod()` |
| **Booleans** | is/has/can prefix | `isLoading`, `hasError` |

---

## Code Organization

### Class Member Order:
1. Static constants
2. Instance variables (prefer `final`)
3. Constructor (use `const` when possible)
4. Lifecycle methods (`initState`, `dispose`)
5. Build method
6. Public methods
7. Private methods (prefix with `_`)

### Import Order:
1. Dart imports
2. Flutter imports
3. Package imports (alphabetically)
4. Project imports (alphabetically)

---

## Clean Code Principles

### Widget Composition
- Break large widgets into smaller, reusable components
- Use `const` constructors wherever possible
- Extract repeated UI into separate widget classes
- Keep widgets under 100 lines

### State Management (BLoC Pattern)
- **Events**: VerbNoun format (`LoginRequested`, `FetchUserProfile`)
- **States**: NounAdjective format (`AuthLoading`, `AuthError`)
- Always handle all possible states in UI
- Use Equatable for events and states

### Error Handling
- Use `Either<Failure, Success>` pattern (dartz package)
- Create specific exception types (`ServerException`, `NetworkException`)
- Map exceptions to failures in repositories
- Never expose exceptions to UI layer

### API Integration
- Use repository pattern
- Implement remote and local data sources
- Handle network connectivity checks
- Use interceptors for auth tokens and logging

---

## Best Practices

### Performance
- Use `const` constructors for immutable widgets
- Use `ListView.builder` for long lists
- Add `keys` to list items
- Avoid expensive operations in `build()`
- Use `RepaintBoundary` for complex animations
- Dispose controllers and listeners in `dispose()`

### Forms & Validation
- Use `GlobalKey<FormState>` for forms
- Create reusable validator functions
- Always dispose `TextEditingController`
- Show validation errors on user interaction

### Navigation
- Define routes as constants
- Use route generator for centralized routing
- Create argument classes for route parameters
- Use named routes consistently

### Theme & Design
- Extract all colors to `AppColors` class
- Define text styles in `AppTextStyles` class
- Use spacing constants from `AppDimensions`
- Never hardcode colors, fonts, or spacing

### Testing
- Write unit tests for use cases and repositories
- Write widget tests for UI components
- Mock dependencies using mocktail
- Aim for 80%+ code coverage
- Test happy path and error scenarios

---

## Security & Best Practices

- Never commit API keys or secrets
- Store sensitive data securely (flutter_secure_storage)
- Validate all user inputs
- Implement proper authentication flow
- Handle token refresh automatically
- Use HTTPS for all API calls

---

## Accessibility

- Add semantic labels to widgets
- Ensure proper contrast ratios
- Support screen readers
- Make touch targets at least 48x48dp
- Support dynamic text sizing

---

## Documentation

- Add doc comments for public APIs using `///`
- Document complex logic with inline comments
- Keep README.md updated
- Document breaking changes in CHANGELOG.md

---

## Git Workflow

### Commit Message Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**: `feat(auth): implement login with email and password`

---

## Code Quality Checklist

Before committing, ensure:
- [ ] Code follows naming conventions
- [ ] No hardcoded values (use constants)
- [ ] All imports organized properly
- [ ] Proper error handling implemented
- [ ] No commented-out code
- [ ] Widgets are properly decomposed
- [ ] `const` constructors used where possible
- [ ] Controllers/listeners disposed
- [ ] Tests written and passing
- [ ] Code formatted (`flutter format .`)
- [ ] No analyzer warnings (`flutter analyze`)

---

## Common Patterns

### Repository Pattern
- Repository interface in domain layer
- Implementation in data layer
- Returns `Either<Failure, Success>`

### Use Case Pattern
- One use case per business operation
- Single public `call()` method
- Depends on repository interface

### BLoC Pattern
- Separate files for events, states, and bloc
- Use `on<Event>` handlers
- Emit states based on results

### Dependency Injection
- Use get_it for service locator
- Register dependencies in `injection_container.dart`
- Inject dependencies through constructors

---

## DON'Ts

❌ Skip documentation review  
❌ Hardcode colors, fonts, or spacing  
❌ Create monolithic widgets  
❌ Ignore error handling  
❌ Use generic variable names  
❌ Leave TODO comments in production  
❌ Mix business logic with UI  
❌ Use `print()` (use proper logging)  
❌ Commit commented-out code  
❌ Push without testing  

---

## DOs

✅ Follow Clean Architecture  
✅ Write self-documenting code  
✅ Handle all edge cases  
✅ Test thoroughly  
✅ Use meaningful names  
✅ Keep functions small and focused  
✅ Follow SOLID principles  
✅ Review code before committing  
✅ Update documentation  
✅ Run formatter and analyzer  

---

**Remember**: Quality over speed. Write code that is maintainable, testable, and scalable.