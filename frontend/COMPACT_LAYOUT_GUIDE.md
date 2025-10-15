# Compact NFT Layout Guide

## Overview

VeridiaHub now features multiple layout modes for displaying NFTs in the marketplace, allowing users to choose between different density levels based on their preferences and screen size.

## Layout Modes

### 1. **Large Grid** (Default)
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Card Size**: Full Web3Card component
- **Items per row**: 1-4 depending on screen size
- **Best for**: Detailed browsing, showcasing individual NFTs

### 2. **Compact Grid** (Recommended)
- **Grid**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`
- **Card Size**: CompactNFTCard component
- **Items per row**: 2-6 depending on screen size
- **Best for**: Balanced view with good detail and density

### 3. **Ultra Compact Grid** (Maximum Density)
- **Grid**: `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10`
- **Card Size**: CompactNFTCard component (same as compact)
- **Items per row**: 3-10 depending on screen size
- **Best for**: Browsing large collections, overview scanning

## Component Comparison

### Web3Card (Large Grid)
```typescript
// Full-featured card with:
- Large image (aspect-square)
- Full description
- Complete stats display
- Large action button
- Full creator info
- All tags displayed
```

### CompactNFTCard (Compact & Ultra Compact)
```typescript
// Optimized card with:
- Smaller image (aspect-square)
- Truncated description (2 lines)
- Compact stats (abbreviated numbers)
- Smaller action button
- Condensed creator info
- Limited tags (2 + overflow)
```

## Responsive Breakpoints

| Screen Size | Large Grid | Compact Grid | Ultra Compact |
|-------------|------------|--------------|---------------|
| Mobile (< 640px) | 1 column | 2 columns | 3 columns |
| Small (640px+) | 2 columns | 3 columns | 4 columns |
| Medium (768px+) | 2 columns | 4 columns | 6 columns |
| Large (1024px+) | 3 columns | 5 columns | 8 columns |
| XL (1280px+) | 4 columns | 6 columns | 10 columns |

## Features by Layout

### Large Grid Features
- ✅ Full image preview
- ✅ Complete description
- ✅ All statistics visible
- ✅ Full creator information
- ✅ All tags displayed
- ✅ Large action buttons
- ✅ Hover effects and animations

### Compact Grid Features
- ✅ Optimized image size
- ✅ Truncated description (2 lines)
- ✅ Abbreviated stats (1.2k format)
- ✅ Condensed creator info
- ✅ Limited tags (2 + overflow)
- ✅ Smaller action buttons
- ✅ Maintained hover effects

### Ultra Compact Features
- ✅ Same as Compact Grid
- ✅ Maximum density
- ✅ Best for large collections
- ✅ Quick scanning
- ✅ Mobile-friendly

## Usage Examples

### Switching Layout Modes
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'ultra-compact'>('compact');

// Render based on mode
{viewMode === 'grid' ? (
  <Web3Grid>
    {artworks.map(artwork => <Web3Card {...artwork} />)}
  </Web3Grid>
) : viewMode === 'compact' ? (
  <CompactNFTGrid>
    {artworks.map(artwork => <CompactNFTCard {...artwork} />)}
  </CompactNFTGrid>
) : (
  <UltraCompactNFTGrid>
    {artworks.map(artwork => <CompactNFTCard {...artwork} />)}
  </UltraCompactNFTGrid>
)}
```

### View Mode Controls
```typescript
<div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
  <button onClick={() => setViewMode('grid')} title="Large Grid">
    <Filter className="h-4 w-4" />
  </button>
  <button onClick={() => setViewMode('compact')} title="Compact Grid">
    <Eye className="h-4 w-4" />
  </button>
  <button onClick={() => setViewMode('ultra-compact')} title="Ultra Compact">
    <Zap className="h-4 w-4" />
  </button>
</div>
```

## Performance Benefits

### Compact Layout Advantages
- **More NFTs visible**: 2-3x more items on screen
- **Faster scanning**: Quick overview of large collections
- **Better mobile experience**: Optimized for small screens
- **Reduced scrolling**: More content per viewport
- **Improved navigation**: Easier to browse large datasets

### Memory Optimization
- **Smaller DOM nodes**: Reduced memory footprint
- **Lazy loading ready**: Better for infinite scroll
- **Virtual scrolling compatible**: Can handle thousands of items
- **Responsive images**: Optimized image sizes

## Customization

### Grid Density
```typescript
// Custom grid configurations
export const CustomGrid = ({ children, density = 'medium' }) => {
  const gridClasses = {
    low: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    high: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
    ultra: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
  };
  
  return (
    <div className={`grid ${gridClasses[density]} gap-3`}>
      {children}
    </div>
  );
};
```

### Card Customization
```typescript
// CompactNFTCard with custom props
<CompactNFTCard
  title={artwork.title}
  description={artwork.description}
  price={artwork.price}
  image={artwork.tokenURI}
  creator={artwork.creator}
  stats={{
    views: artwork.views,
    likes: artwork.likes,
    sales: artwork.sales
  }}
  tags={artwork.tags}
  isFeatured={artwork.isFeatured}
  isNew={artwork.isNew}
  onClick={() => handleClick(artwork)}
  className="custom-card-class"
/>
```

## Best Practices

### When to Use Each Layout

#### Large Grid
- Showcasing featured NFTs
- Detailed product pages
- Mobile-first designs
- Limited collections (< 50 items)

#### Compact Grid
- General marketplace browsing
- Balanced detail and density
- Most use cases
- Medium collections (50-200 items)

#### Ultra Compact
- Large collection browsing
- Search results
- Category overviews
- Large datasets (200+ items)

### Performance Tips
1. **Use compact layout for large datasets**
2. **Implement virtual scrolling for 1000+ items**
3. **Lazy load images for better performance**
4. **Cache layout preferences in localStorage**
5. **Use responsive images for different screen sizes**

## Accessibility

### Screen Reader Support
- All cards have proper alt text
- Semantic HTML structure
- Keyboard navigation support
- Focus indicators

### Visual Accessibility
- High contrast ratios
- Clear typography hierarchy
- Consistent spacing
- Color-blind friendly design

## Future Enhancements

### Planned Features
- [ ] Virtual scrolling for large datasets
- [ ] Custom grid density slider
- [ ] Saved layout preferences
- [ ] Advanced filtering in compact mode
- [ ] Batch operations for multiple NFTs
- [ ] Comparison mode for side-by-side viewing

### Performance Optimizations
- [ ] Image lazy loading
- [ ] Intersection Observer for visibility
- [ ] Memoized components
- [ ] Debounced search
- [ ] Optimized re-renders

---

**The compact layout system provides flexible, performant, and user-friendly ways to display NFT collections of any size while maintaining excellent user experience across all device types.**
