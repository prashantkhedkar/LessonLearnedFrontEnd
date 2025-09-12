# Rating Evaluation Component

A React component that displays star ratings with percentages, designed for Arabic language interfaces with RTL support.

## Features

- 5-star rating display
- Percentage values for each rating level
- Arabic language support with RTL layout
- Responsive design
- Dark mode support
- Customizable data and styling
- TypeScript support

## Usage

### Basic Usage

```tsx
import RatingEvaluation from './components/ratingEvaluation';

function App() {
  return (
    <div>
      <RatingEvaluation />
    </div>
  );
}
```

### With Custom Data

```tsx
import RatingEvaluation from './components/ratingEvaluation';

const customRatings = [
  { stars: 5, percentage: 75 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 3 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
];

function App() {
  return (
    <RatingEvaluation 
      title="تقييم المنتج"
      ratings={customRatings}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"تصنيف التقييم"` | The title displayed at the top of the component |
| `ratings` | `RatingData[]` | Default ratings array | Array of rating objects with stars and percentage |
| `className` | `string` | `""` | Additional CSS class names for custom styling |

### RatingData Interface

```tsx
interface RatingData {
  stars: number;     // Number of stars (1-5)
  percentage: number; // Percentage value
}
```

## Default Data

The component comes with default rating data:
- 5 stars: 62%
- 4 stars: 31%
- 3 stars: 25%
- 2 stars: 10%
- 1 star: 0%

## Styling

The component includes responsive design and dark mode support. You can override styles by:

1. Using the `className` prop
2. Modifying the CSS variables
3. Creating custom CSS rules

### CSS Custom Properties

```css
.rating-evaluation-container {
  --star-filled-color: #ffd700;
  --star-empty-color: #e0e0e0;
  --text-color: #333333;
  --background-color: #ffffff;
  --border-color: #e5e5e5;
}
```

## Dependencies

- React
- FontAwesome (for star icons)
- CSS (included)

## Accessibility

The component includes:
- Semantic HTML structure
- Proper color contrast
- Responsive design
- Screen reader friendly markup

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- IE11+ (with polyfills)
