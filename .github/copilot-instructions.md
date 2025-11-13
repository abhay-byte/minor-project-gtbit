# Copilot Instructions for Clinico Mobile App (Flutter Frontend)

## Project Overview
This is the frontend Flutter mobile application for the Clinico project, a comprehensive healthcare management system. The app is located at `/frontend/clinico_mobile_app` and follows a structured, phase-based development approach.

## Documentation Structure
All project documentation is centralized and must be strictly followed:

### Core Documentation
- **Complete Documentation Root**: `/documentation`
- **SRS (Software Requirements Specification)**: `/documentation/SRS.md`
- **SDD (Software Design Document)**: `/documentation/SDD/SDD.md`
- **Features Specification**: `/documentation/features/features.md`
- **Database Schema**: `/documentation/database/readme.md`

### Diagrams & Architecture
- **Complete Diagrams**: `/documentation/diagrams`
- **ER Diagram**: `/documentation/diagrams/err/readme.md`
- **DFD (Data Flow Diagram)**: `/documentation/diagrams/dfd/readme.md`
- **Flow Charts**: `/documentation/diagrams/flow-charts/readme.md`
- **Low-Level Design**: `/documentation/diagrams/low-level-design/readme.md`

## Critical Rules

### 1. Documentation Compliance
- **ALWAYS** refer to the documentation at the specified locations before implementing any feature
- **NEVER** deviate from the specifications in SRS, SDD, and feature documentation
- **VERIFY** data models against the database schema and ER diagrams
- **CROSS-REFERENCE** flow charts and DFD diagrams to understand data flow and user interactions

### 2. Phase-Based Development Workflow

#### A. TODO Management
- Maintain a `todo.md` file in the frontend directory
- Divide all features into distinct, manageable phases
- Each phase should represent a cohesive set of features
- Mark progress clearly:
  - ✅ Completed
  - 🔄 In Progress
  - ⏳ Pending
  - 🚫 Blocked (with reason)

#### B. Phase Completion Cycle
For each phase, follow this exact workflow:

1. **Review Phase Requirements**
   - Read relevant documentation sections
   - Review Figma designs provided for the phase
   - Understand data models and API endpoints needed

2. **Implementation**
   - Implement all features for the current phase
   - Follow coding guidelines (see below)
   - Write clean, maintainable code

3. **Testing**
   - Test the implemented features on Flutter emulator
   - Verify UI matches Figma designs
   - Test edge cases and error scenarios
   - Ensure proper navigation and state management

4. **Version Control**
   - Run the app on emulator and verify everything works
   - Stage all changes: `git add .`
   - Commit with descriptive message: `git commit -m "feat(phase-X): [descriptive message]"`
   - Push to repository: `git push origin [branch-name]`

5. **Update TODO**
   - Mark the phase as completed in `todo.md`
   - Add any notes or issues encountered
   - Move to next phase

#### C. Figma Design Integration
- Figma designs will be provided via Figma MCP server for each phase
- **STRICTLY** follow the Figma designs for UI implementation
- Match colors, spacing, typography, and component structure
- Extract design tokens (colors, fonts, spacing) and use them consistently


## Coding Guidelines

**For complete coding guidelines, patterns, and best practices, refer to:**
📖 **[code-guidelines.md](./code-guidelines.md)**

### Quick Reference

**Architecture**: Clean Architecture (Presentation → Domain → Data)

**Naming Conventions**:
- Files/Folders: `snake_case`
- Classes: `PascalCase`
- Variables/Functions: `camelCase`
- Constants: `kPrefixCamelCase` or `SCREAMING_SNAKE_CASE`
- Private: `_underscore` prefix

**Code Organization**: Static constants → Instance variables → Constructor → Lifecycle → Build → Public → Private methods

**State Management**: BLoC Pattern (Events: `VerbNoun`, States: `NounAdjective`)

**Error Handling**: Use `Either<Failure, Success>` pattern

**Performance**: Use `const`, `ListView.builder`, dispose controllers

**Theme**: Never hardcode - use `AppColors`, `AppTextStyles`, `AppDimensions`

**Testing**: Write unit tests for logic, widget tests for UI

For detailed guidelines with complete information, always refer to `code-guidelines.md`.

## Git Commit Message Convention

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:
```
feat(auth): implement login with email and password

- Add login form with validation
- Integrate with authentication API
- Handle error states and loading

Closes #123
```

```
fix(profile): resolve image upload issue

The profile image was not being uploaded correctly due to incorrect MIME type
```

```

## Current Project Status

### Completed Features
- ✅ Onboarding screens
- ✅ Authentication screens (login, signup, forgot password)

### Project Location
- Frontend: `/frontend/clinico_mobile_app`
- All commands should be executed from this directory

## Phase Development Process

### Before Starting a Phase:
1. **Read Documentation**
   - Review `/documentation/SRS.md` for requirements
   - Check `/documentation/features/features.md` for feature specifications
   - Study relevant diagrams in `/documentation/diagrams/`
   - Verify database schema in `/documentation/database/readme.md`

2. **Review Figma Designs**
   - Wait for Figma designs to be provided via MCP server
   - Analyze design components, colors, spacing, and interactions
   - Extract design tokens and add to theme files

3. **Plan Implementation**
   - Break down features into smaller tasks
   - Identify required models, APIs, and state management
   - Update `todo.md` with detailed tasks for the phase

### During Implementation:
1. **Follow Clean Architecture**
   - Create entities in `domain/entities/`
   - Define repository interfaces in `domain/repositories/`
   - Implement use cases in `domain/usecases/`
   - Create models in `data/models/`
   - Implement data sources in `data/datasources/`
   - Implement repositories in `data/repositories/`
   - Build UI in `presentation/`

2. **State Management**
   - Create BLoC events and states (or Provider models)
   - Implement business logic in BLoC/Provider
   - Connect UI to state management

3. **UI Development**
   - Match Figma designs precisely
   - Use theme constants for colors, typography, spacing
   - Create reusable widgets
   - Implement proper navigation
   - Add loading and error states

4. **Code Review Checklist**
   - [ ] Follows clean architecture principles
   - [ ] Matches Figma designs
   - [ ] Has proper error handling
   - [ ] Uses const constructors where possible
   - [ ] Has meaningful variable and function names
   - [ ] Includes inline comments for complex logic
   - [ ] No hardcoded values (uses constants)
   - [ ] Proper null safety handling
   - [ ] Follows naming conventions
   - [ ] No code duplication

### After Implementation:
1. **Testing**
   ```bash
   # Run on emulator
   flutter run
   
   # Test all features
   # - Happy path
   # - Error scenarios
   # - Edge cases
   # - Navigation flows
   # - State persistence
   ```

2. **Code Quality Check**
   ```bash
   # Format code
   flutter format .
   
   # Analyze code
   flutter analyze
   
   # Run tests
   flutter test
   ```

3. **Git Workflow**
   ```bash
   # Check status
   git status
   
   # Add all changes
   git add .
   
   # Commit with conventional message
   git commit -m "feat(phase-X): descriptive message"
   
   # Push to repository
   git push origin [branch-name]
   ```

4. **Update Documentation**
   - Mark phase as completed in `todo.md`
   - Add any notes or known issues
   - Document any deviations from original plan
   - Update README if needed



## Important Reminders

### DO:
✅ Always consult documentation before implementing  
✅ Follow the phase-based development workflow strictly  
✅ Write clean, readable, and maintainable code  
✅ Test thoroughly on emulator before committing  
✅ Use meaningful commit messages  
✅ Break down large widgets into smaller components  
✅ Use const constructors for performance  
✅ Handle all possible states (loading, error, success, empty)  
✅ Validate user inputs  
✅ Use design tokens from theme  
✅ Add inline comments for complex logic  
✅ Follow naming conventions  
✅ Keep dependencies up to date  

### DON'T:
❌ Skip documentation review  
❌ Implement features not specified in documentation  
❌ Hardcode colors, fonts, or spacing values  
❌ Create monolithic widgets  
❌ Ignore error handling  
❌ Push code without testing  
❌ Use generic variable names (e.g., `data`, `temp`, `x`)  
❌ Leave TODO comments in production code  
❌ Skip validation for user inputs  
❌ Use `print()` statements (use proper logging)  
❌ Mix business logic with UI code  
❌ Commit commented-out code  

## Useful Commands

```bash
# Create new feature module structure
mkdir -p lib/features/[feature_name]/{data/{models,datasources,repositories},domain/{entities,repositories,usecases},presentation/{bloc,pages,widgets}}

# Run app
flutter run

# Run on specific device
flutter run -d [device-id]

# Hot reload
r

# Hot restart
R

# Format code
flutter format lib/

# Analyze code
flutter analyze

# Run tests
flutter test

# Run tests with coverage
flutter test --coverage

# Clean build
flutter clean
flutter pub get

# Update dependencies
flutter pub upgrade

# Check outdated packages
flutter pub outdated

# Generate code (for freezed, json_serializable, etc.)
flutter pub run build_runner build --delete-conflicting-outputs
```

## Resources

### Flutter Documentation
- [Flutter Docs](https://docs.flutter.dev/)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)

### Architecture & Patterns
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [BLoC Pattern](https://bloclibrary.dev/)
- [Provider Package](https://pub.dev/packages/provider)

### Testing
- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [Widget Testing](https://docs.flutter.dev/cookbook/testing/widget/introduction)
- [Integration Testing](https://docs.flutter.dev/testing/integration-tests)

---

**Remember**: Quality over speed. Write code that your future self (and teammates) will thank you for. When in doubt, refer to the documentation and follow these guidelines strictly.