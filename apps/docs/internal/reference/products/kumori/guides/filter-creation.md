# Filter Creation Guide

Master the art of using and creating filters in Kumori. This comprehensive guide covers everything from understanding filter basics to advanced customization techniques.

## Table of Contents

1. [Understanding Filters](#understanding-filters)
2. [Filter Categories](#filter-categories)
3. [Using Existing Filters](#using-existing-filters)
4. [Filter Customization](#filter-customization)
5. [Creating Custom Filters](#creating-custom-filters)
6. [Advanced Techniques](#advanced-techniques)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Understanding Filters

### What are Filters?

Filters in Kumori are AI-powered transformation templates that convert your photos into stunning artwork. Each filter contains:

- **Style Instructions** - The artistic direction for the AI
- **Output Settings** - Whether to create stickers or scenes
- **Enhancement Options** - Additional processing parameters
- **Category Tags** - For easy browsing and discovery

### How Filters Work

```
Your Photo → Filter (AI Instructions) → Generated Artwork
```

1. **Input Analysis** - The AI analyzes your photo's content
2. **Style Application** - Filter instructions guide the transformation
3. **Generation** - AI creates a new image based on the filter
4. **Post-Processing** - Final enhancements and formatting

![Filter Process](screenshots/filter-process-placeholder.png)

## Filter Categories

### 🗡️ Fantasy Filters

Transform subjects into magical beings and mystical scenes.

**Popular Fantasy Filters:**
- **Fantasy Warrior** - Epic armor, weapons, heroic poses
- **Ethereal Mage** - Magical auras, spell effects, robes
- **Dragon Rider** - Mythical creatures, aerial scenes
- **Enchanted Forest** - Mystical backgrounds, fairy tale settings

**Best For:** Portraits, action shots, landscapes

![Fantasy Examples](screenshots/fantasy-examples-placeholder.png)

### 🎌 Anime Filters

Create cute chibi characters and anime-style artwork.

**Popular Anime Filters:**
- **Kawaii Chibi** - Super-deformed proportions, huge eyes
- **Manga Hero** - Dynamic poses, speed lines, effects
- **Magical Girl** - Sparkles, transformation sequences
- **Slice of Life** - Soft colors, everyday scenes

**Best For:** Selfies, portraits, pets

![Anime Examples](screenshots/anime-examples-placeholder.png)

### 📸 Realistic Filters

Enhance photos with photorealistic improvements.

**Popular Realistic Filters:**
- **Portrait Pro** - Skin smoothing, lighting enhancement
- **HDR Landscape** - Enhanced dynamic range, vivid colors
- **Film Noir** - Black and white, dramatic shadows
- **Golden Hour** - Warm lighting, soft glow

**Best For:** Professional photos, landscapes, portraits

![Realistic Examples](screenshots/realistic-examples-placeholder.png)

### 🎨 Artistic Filters

Transform photos into various art styles.

**Popular Artistic Filters:**
- **Oil Painting** - Brush strokes, rich textures
- **Watercolor Dream** - Soft edges, flowing colors
- **Pop Art** - Bold colors, comic style
- **Impressionist** - Loose strokes, light play

**Best For:** Any photo type, creative expression

![Artistic Examples](screenshots/artistic-examples-placeholder.png)

### 🌃 Cyberpunk Filters

Futuristic, neon-soaked transformations.

**Popular Cyberpunk Filters:**
- **Neon Streets** - City lights, rain effects
- **Tech Augmented** - Cybernetic enhancements, HUD overlays
- **Hologram** - Translucent effects, digital artifacts
- **Synthwave** - Retro-futuristic, grid patterns

**Best For:** Urban photos, portraits, night scenes

![Cyberpunk Examples](screenshots/cyberpunk-examples-placeholder.png)

### ⚪ Minimal Filters

Clean, simple transformations with elegant results.

**Popular Minimal Filters:**
- **Line Art** - Simple outlines, clean design
- **Flat Design** - Solid colors, geometric shapes
- **Monochrome** - Single color schemes
- **Zen Garden** - Peaceful, balanced compositions

**Best For:** Logos, simple subjects, meditation

![Minimal Examples](screenshots/minimal-examples-placeholder.png)

## Using Existing Filters

### Filter Selection Best Practices

#### 1. Match Filter to Content

| Your Photo | Recommended Filter Type |
|------------|------------------------|
| Close-up portrait | Character-focused (Anime, Fantasy) |
| Full body shot | Costume/armor filters |
| Landscape | Scene-based filters |
| Pet photo | Kawaii/cute filters |
| Object | Item transformation filters |

#### 2. Consider Output Type

**Stickers (Transparent Background):**
- Perfect for messaging apps
- Great for character cutouts
- Ideal for collections
- Easy to composite

**Scenes (Full Background):**
- Complete artistic compositions
- Great for wallpapers
- Social media ready
- Story-telling potential

![Output Types](screenshots/output-types-placeholder.png)

### Filter Preview System

Before generating, you can:

1. **See Example Results** - Tap the filter for preview gallery
2. **Read Description** - Understand the filter's style
3. **Check Tags** - See what it works best with
4. **View Ratings** - Community feedback on results

### Favoriting Filters

Mark your go-to filters for quick access:

1. Long-press any filter
2. Tap the ⭐ star icon
3. Access favorites from the filter menu
4. Organize by most used

## Filter Customization

### Basic Adjustments

Most filters allow these modifications:

#### Intensity Control
- **Low (0.5)** - Subtle transformation
- **Medium (1.0)** - Balanced effect (default)
- **High (1.5)** - Strong stylization

```
Slider: [====|========] 1.0x
```

#### Color Options
- **Original** - Preserve source colors
- **Filter** - Use filter's color palette
- **Custom** - Pick your own theme

![Customization Panel](screenshots/customization-panel-placeholder.png)

### Advanced Parameters

For Pro users, access deeper customization:

#### Prompt Modifiers
Add keywords to influence generation:
```
Base Filter + "golden sunset lighting"
Base Filter + "extra detailed"
Base Filter + "vintage film grain"
```

#### Negative Prompts
Exclude unwanted elements:
```
Avoid: "blur, low quality, distorted"
```

#### Aspect Ratios
- **Square (1:1)** - Instagram ready
- **Portrait (3:4)** - Phone wallpapers
- **Landscape (16:9)** - Desktop backgrounds
- **Custom** - Any ratio you need

### Enhancement Options

Post-generation improvements:

1. **Upscaling**
   - 2x resolution increase
   - AI-enhanced details
   - Sharper output

2. **Denoising**
   - Remove artifacts
   - Smoother gradients
   - Cleaner results

3. **Color Enhancement**
   - Vibrance boost
   - Contrast adjustment
   - Saturation control

## Creating Custom Filters

### Understanding the Filter Engine

Kumori's filter system uses structured prompts:

```
{
  "name": "Your Filter Name",
  "category": "fantasy",
  "outputType": "sticker",
  "basePrompt": "Main transformation instructions",
  "styleModifiers": ["style1", "style2"],
  "qualityTags": ["high quality", "detailed"],
  "negativePrompt": "things to avoid"
}
```

### Step-by-Step Filter Creation

#### Step 1: Define Your Vision

Ask yourself:
- What style am I creating?
- Who is my target audience?
- What makes this filter unique?
- What type of images will it work with?

#### Step 2: Choose Base Category

Start with an existing category as foundation:
- Modify a similar filter
- Combine elements from multiple filters
- Add your unique twist

#### Step 3: Write Core Instructions

Structure your prompt:
```
[Subject description], [style keywords], [mood/atmosphere], 
[technical details], [quality modifiers]
```

Example:
```
"Transform subject into cute forest fairy, chibi style, 
sparkling wings, magical forest background, soft pastel colors, 
dreamy atmosphere, high detail, professional illustration"
```

#### Step 4: Add Style Modifiers

Layer additional style elements:
- Art movement references
- Color palettes
- Lighting styles
- Material textures

#### Step 5: Set Quality Parameters

Include quality enhancers:
```
"masterpiece, best quality, highly detailed, 
professional artwork, trending on artstation"
```

#### Step 6: Define Negative Prompts

Prevent common issues:
```
"low quality, blurry, distorted, bad anatomy, 
oversaturated, jpeg artifacts"
```

### Testing Your Filter

1. **Start with Test Images**
   - Use diverse photo types
   - Try different lighting conditions
   - Test with various subjects

2. **Iterate and Refine**
   - Adjust prompt weights
   - Add/remove modifiers
   - Fine-tune parameters

3. **Document Results**
   - Save successful examples
   - Note what works/doesn't work
   - Build a reference gallery

![Filter Testing](screenshots/filter-testing-placeholder.png)

## Advanced Techniques

### Filter Stacking (Pro Feature)

Combine multiple filters for unique effects:

1. **Base Layer** - Primary transformation
2. **Style Layer** - Additional artistic elements
3. **Effect Layer** - Final touches

Example Stack:
```
Fantasy Warrior (0.7) + Cyberpunk Tech (0.3) + Glow Effects
= Techno-Knight Filter
```

### Conditional Filters

Create filters that adapt to content:

```
IF portrait detected:
  Apply character transformation
ELSE IF landscape:
  Apply environment transformation
ELSE:
  Apply general artistic style
```

### Seasonal Variations

Design filters with variants:
- **Spring** - Cherry blossoms, pastels
- **Summer** - Bright sun, vibrant colors
- **Autumn** - Warm tones, falling leaves
- **Winter** - Snow effects, cool palette

### Filter Families

Create cohesive filter sets:
1. **Hero Series** - Warrior, Mage, Rogue, Healer
2. **Time Period** - Medieval, Renaissance, Modern, Future
3. **Mood Set** - Happy, Mysterious, Epic, Serene

## Best Practices

### Do's ✅

1. **Be Specific**
   - Clear, detailed instructions
   - Concrete style references
   - Defined color palettes

2. **Test Thoroughly**
   - Various image types
   - Different lighting
   - Multiple subjects

3. **Consider User Experience**
   - Clear naming
   - Accurate descriptions
   - Helpful examples

4. **Optimize for Performance**
   - Efficient prompts
   - Balanced complexity
   - Fast generation

### Don'ts ❌

1. **Avoid Vagueness**
   - Not: "Make it look good"
   - Better: "Professional portrait lighting with soft shadows"

2. **Don't Overload**
   - Too many conflicting styles
   - Excessive detail requirements
   - Contradictory instructions

3. **Skip Inappropriate Content**
   - Keep filters family-friendly
   - Avoid controversial themes
   - Respect copyright

### Filter Naming Conventions

Good filter names are:
- **Descriptive** - "Neon Cyberpunk Portrait"
- **Memorable** - "Dragon's Breath"
- **Searchable** - Include key terms
- **Unique** - Stand out from others

## Troubleshooting

### Common Filter Issues

#### Filter Not Working as Expected

**Problem:** Results don't match filter description

**Solutions:**
1. Check if image type matches filter design
2. Try adjusting intensity settings
3. Use a different source image
4. Report to support if persistent

#### Inconsistent Results

**Problem:** Same filter gives varying quality

**Solutions:**
1. Ensure consistent image quality
2. Check lighting in source photos
3. Use similar composition types
4. Apply enhancement options

#### Generation Failures

**Problem:** Filter fails to generate

**Solutions:**
1. Verify internet connection
2. Check image size (max 10MB)
3. Try simpler filter first
4. Clear app cache

### Performance Optimization

#### Faster Generation
- Use favorites for quick access
- Pre-select filters while image loads
- Batch process similar images
- Use cached results when available

#### Better Quality
- Start with high-resolution images
- Choose appropriate filter intensity
- Enable enhancement options
- Use Pro features for fine control

### Filter Compatibility

| Image Type | Best Filters | Avoid |
|------------|--------------|-------|
| Portraits | Character, Artistic | Landscape-only |
| Landscapes | Scene, Environmental | Portrait-specific |
| Objects | Item transformation | Character filters |
| Groups | Scene filters | Single-character |
| Low light | Filters with lighting | Dark/noir styles |

## Community and Sharing

### Share Your Creations

1. **Filter Gallery** - Showcase your custom filters
2. **Recipe Sharing** - Export/import filter settings
3. **Collaboration** - Work with other creators
4. **Feedback** - Get community input

### Learning from Others

- Browse trending filters
- Study successful combinations
- Join filter creation challenges
- Follow top creators

![Community Gallery](screenshots/community-gallery-placeholder.png)

## Conclusion

Filters are the heart of Kumori's creative power. Whether using existing filters or creating your own, the key is experimentation and understanding how different elements work together.

### Quick Reference

- 📱 **Access Filters**: Tap + → Select Image → Browse Filters
- ⭐ **Favorite**: Long-press any filter → Tap star
- 🎨 **Customize**: Select filter → Adjust settings → Generate
- 🔧 **Create**: Settings → Custom Filters → New Filter
- 🤝 **Share**: Profile → My Filters → Share Recipe

### Next Steps

1. **Practice** with different filter categories
2. **Experiment** with customization options
3. **Create** your first custom filter
4. **Share** your results with the community

For more guides:
- [Quick Start Guide](./quick-start.md) - Get started with basics
- [Image Generation Guide](./image-generation-guide.md) - Advanced generation techniques
- [Troubleshooting Guide](./troubleshooting.md) - Solve common problems

*Happy filtering! Transform your world with Kumori* ✨