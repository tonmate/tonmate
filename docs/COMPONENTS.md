# Tonmate Components

This directory contains React components organized using a feature-based architecture.

## Structure

- `features/` - Feature-specific components organized by domain
  - `AgentDetails/` - Components for agent configuration and management
  - Add more feature folders as needed

- `ui/` - Reusable UI components (buttons, inputs, cards, etc.)

- `Layout/` - Page layout components

## Component Guidelines

1. Use PascalCase for component names and filenames
2. Place components in the appropriate feature directory
3. Extract reusable UI elements to the `ui/` directory
4. Implement proper TypeScript typing for all props
5. Include JSDoc comments for complex components
6. Use consistent prop naming conventions

## Creating New Components

When creating a new component:

1. Consider where it belongs in the architecture
2. Use the appropriate naming convention
3. Include necessary tests in the same directory
4. Document any complex behavior or props
