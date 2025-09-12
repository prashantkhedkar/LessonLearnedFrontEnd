# Observation Module

This module contains all observation-related components, pages, services, models, and hooks.

## Structure

```
src/app/observation/
├── components/           # Reusable observation components
│   ├── ObservationForm.tsx
│   └── observation-form.css
├── pages/               # Observation pages
│   └── ObservationPage.tsx
├── models/              # TypeScript models and interfaces
│   └── observationModel.ts
├── services/            # API service layer
│   └── observationService.ts
├── hooks/               # Custom React hooks
│   └── useObservation.ts
└── index.ts            # Module exports
```

## Components

### ObservationForm
A form component for creating and editing observations/articles.

**Props:**
- `onSubmit`: Function to handle form submission
- `initialValues`: Optional initial values for editing
- `mode`: 'add' | 'edit' - determines form behavior

### ObservationPage
Main page component that combines the form with state management.

## Models

### ObservationModel
Core observation data structure.

### ArticleCreateUpdateModel
Model for API requests when creating/updating observations.

### ArticleSearchModel
Model for search and filtering parameters.

## Services

### observationService
Handles all API communication for observations including:
- CRUD operations
- Search and filtering
- Status management (submit, approve, reject, archive)
- Statistics and lookup data

## Hooks

### useObservation
Custom hook that provides:
- State management for observations
- CRUD operations
- Loading and error states
- Search functionality

## Usage

```typescript
import { ObservationPage, ObservationForm, useObservation } from '../observation';

// Or import specific items
import ObservationForm from '../observation/components/ObservationForm';
import { useObservation } from '../observation/hooks/useObservation';
```

## Features

- Complete CRUD operations for observations
- Form validation with Yup
- Internationalization support
- RTL (Right-to-Left) text direction support
- Status management workflow
- Search and filtering capabilities
- Error handling and loading states
