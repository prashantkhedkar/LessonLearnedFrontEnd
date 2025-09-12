# Custom Chart Styling Guide

This guide explains how to add custom CSS styling to bar and donut charts in the Dashboard system.

## Overview

The chart system now supports custom CSS styling for:
- Chart titles
- X-axis labels (bar charts only)
- Y-axis labels (bar charts only)

Two approaches are available:
1. **CSS Classes**: Apply predefined CSS classes
2. **Inline Styles**: Use React CSSProperties for dynamic styling

## Configuration Options

### ChartConfig Interface

```typescript
interface ChartConfig {
  id: string;
  type: 'donut' | 'bar' | 'timeline' | 'updates' | 'rating' | 'averageClosureTime' | 'notificationTimeline' | 'widgetStats';
  title: string;
  dataSource: string;
  height?: number;
  
  // New CSS customization options
  titleClassName?: string;        // CSS class for chart title
  xAxisClassName?: string;        // CSS class for X-axis labels (bar charts)
  yAxisClassName?: string;        // CSS class for Y-axis labels (bar charts)
  customStyles?: {                // Inline styles
    titleStyle?: React.CSSProperties;
    xAxisStyle?: React.CSSProperties;
    yAxisStyle?: React.CSSProperties;
  };
}
```

## Usage Examples

### 1. Using CSS Classes

```json
{
  "id": "priority-chart",
  "type": "donut",
  "title": "DASHBOARD.PRIORITY_DISTRIBUTION",
  "dataSource": "getPriorityData",
  "height": 350,
  "titleClassName": "custom-chart-title-green"
}
```

```json
{
  "id": "monthly-requests",
  "type": "bar",
  "title": "DASHBOARD.MONTHLY_REQUESTS",
  "dataSource": "getNumberOfRequestCreatedByMonthData",
  "height": 400,
  "titleClassName": "dashboard-service-chart-title",
  "xAxisClassName": "dashboard-request-chart-x-axis",
  "yAxisClassName": "custom-y-axis-highlight"
}
```

### 2. Using Inline Styles

```json
{
  "id": "service-stats",
  "type": "bar",
  "title": "DASHBOARD.SERVICE_STATISTICS",
  "dataSource": "getTopNthRequestsByServiceCategories",
  "height": 350,
  "customStyles": {
    "titleStyle": {
      "color": "#dc2626",
      "fontSize": "20px",
      "fontWeight": "bold",
      "textAlign": "center",
      "backgroundColor": "rgba(220, 38, 38, 0.1)",
      "padding": "10px",
      "borderRadius": "8px"
    },
    "xAxisStyle": {
      "color": "#374151",
      "fontSize": "12px",
      "fontWeight": "500",
      "transform": "rotate(-20deg)"
    },
    "yAxisStyle": {
      "color": "#7c3aed",
      "fontSize": "14px",
      "fontWeight": "bold"
    }
  }
}
```

### 3. Combining CSS Classes and Inline Styles

```json
{
  "id": "hybrid-chart",
  "type": "donut",
  "title": "DASHBOARD.HYBRID_EXAMPLE",
  "dataSource": "getPriorityData",
  "height": 350,
  "titleClassName": "custom-chart-title-animated",
  "customStyles": {
    "titleStyle": {
      "color": "#059669",
      "textShadow": "2px 2px 4px rgba(0,0,0,0.2)"
    }
  }
}
```

## Available CSS Classes

The system includes predefined CSS classes in `custom-chart-styles.css`:

### Title Classes
- `custom-chart-title` - Blue gradient title
- `custom-chart-title-green` - Green uppercase title
- `custom-chart-title-red` - Red title with border
- `dashboard-priority-chart-title` - Orange themed title
- `dashboard-service-chart-title` - Brown gradient title

### X-Axis Classes
- `custom-x-axis` - Standard gray styling
- `custom-x-axis-italic` - Italic light gray
- `custom-x-axis-bold` - Bold with underline
- `dashboard-request-chart-x-axis` - Green rotated labels

### Y-Axis Classes
- `custom-y-axis` - Standard styling
- `custom-y-axis-highlight` - Purple with background

### Animation Classes
- `custom-chart-title-animated` - Fade in animation
- `custom-x-axis-animated` - Slide in from bottom
- `custom-y-axis-animated` - Slide in from right

## How It Works

### For Canvas Charts (Bar & Donut)

1. **Without Custom Styling**: Charts render normally with ECharts canvas
2. **With Custom Styling**: 
   - Chart renders without title/axis labels
   - HTML overlays are positioned over the canvas
   - Custom CSS classes and styles are applied to HTML elements

### Implementation Details

- **StyledChart Component**: Wraps ResponsiveChart and adds HTML overlays
- **Positioning**: Absolute positioning over the canvas chart
- **RTL Support**: CSS includes RTL-specific adjustments
- **Responsive**: Media queries handle mobile adjustments

## Best Practices

1. **Performance**: Use CSS classes instead of inline styles when possible
2. **Consistency**: Create reusable CSS classes for common styling patterns
3. **RTL Support**: Test with both LTR and RTL languages
4. **Responsive**: Consider mobile screen sizes in your styling
5. **Accessibility**: Ensure adequate color contrast for text readability

## Limitations

- Only available for `bar` and `donut` chart types
- Canvas chart elements (bars, pie slices) cannot be styled with CSS
- HTML overlays may not perfectly align with canvas elements on all devices
- Performance impact when using many styled charts simultaneously

## Migration Guide

Existing charts continue to work without changes. To add custom styling:

1. Add `titleClassName`, `xAxisClassName`, `yAxisClassName`, or `customStyles` to your chart config
2. Create CSS classes in your stylesheet or use the provided `custom-chart-styles.css`
3. Test across different screen sizes and languages
