# Prompt Engineering Guides

Welcome to the comprehensive prompt engineering documentation for image generation. These guides provide detailed techniques, examples, and best practices for crafting effective prompts across various artistic styles.

## Available Guides

### 🎨 Style-Specific Guides

#### [Chibi/Kawaii Style](./chibi.md)
Master the art of creating adorable, super-deformed characters with oversized features and irresistible cuteness. Learn proportion rules, expression techniques, and style combinations.

#### [Fantasy Style](./fantasy.md)
Explore magical realms, mythical creatures, and epic scenes. From dragons to enchanted forests, learn how to bring fantastical visions to life.

#### [Photorealistic Style](./photorealistic.md)
Create images indistinguishable from photographs. Master lighting, materials, camera settings, and environmental details for stunning realism.

### 📚 General Resources

#### [Best Practices](./best-practices.md)
Universal principles that apply across all styles. Learn prompt structure, weight management, negative prompts, and optimization techniques.

## Quick Start

### Basic Prompt Structure
```
[Subject], [style], [composition], [lighting], [mood], [technical details]
```

### Style Keywords by Category

| Style | Primary Keywords | Key Characteristics |
|-------|-----------------|-------------------|
| **Chibi/Kawaii** | chibi, kawaii, cute, SD | Oversized heads, tiny bodies, huge eyes |
| **Fantasy** | fantasy, magical, ethereal | Mystical elements, vibrant colors, imaginative |
| **Photorealistic** | photorealistic, photography, realistic | Natural lighting, accurate proportions, detailed textures |

## Choosing the Right Guide

### For Character Design
- **Cute/Adorable**: Start with [Chibi/Kawaii](./chibi.md)
- **Heroic/Mystical**: Check [Fantasy](./fantasy.md)
- **Lifelike Portraits**: Use [Photorealistic](./photorealistic.md)

### For Environments
- **Whimsical/Playful**: Reference [Chibi/Kawaii](./chibi.md) backgrounds
- **Epic/Magical**: Explore [Fantasy](./fantasy.md) landscapes
- **Real-world Scenes**: Master [Photorealistic](./photorealistic.md) environments

### For Technical Mastery
- **Prompt Structure**: Read [Best Practices](./best-practices.md)
- **Style Mixing**: Check combination examples in each guide
- **Troubleshooting**: Find solutions in style-specific sections

## Common Elements Across Styles

### Universal Quality Enhancers
```
high quality, detailed, professional, masterpiece, best quality
```

### Composition Basics
- **Rule of thirds**: "subject positioned at 1/3 line"
- **Leading lines**: "path leading to subject"
- **Framing**: "framed by [elements]"

### Lighting Fundamentals
- **Natural**: "golden hour", "soft daylight", "overcast"
- **Dramatic**: "rim lighting", "chiaroscuro", "backlit"
- **Mood**: "warm glow", "cool tones", "neon lights"

## Advanced Techniques

### Style Fusion
Combine elements from different guides:
```
[Base style] with [secondary style] influences, 
maintaining [primary characteristic] while incorporating [secondary elements]
```

### Iterative Refinement
1. Start with basic prompt from relevant guide
2. Add style-specific modifiers
3. Include quality enhancers
4. Test and adjust weights
5. Add negative prompts as needed

### Weight Management
- `(keyword:1.2)` - Increase importance
- `(keyword:0.8)` - Decrease importance
- `[keyword]` - Lower priority
- `{keyword}` - Alternative syntax (platform-dependent)

## Tips for Success

1. **Start Simple**: Begin with basic prompts and add complexity
2. **Be Specific**: Concrete details > vague descriptions
3. **Study Examples**: Each guide includes numerous tested prompts
4. **Experiment**: Mix techniques from different guides
5. **Document Results**: Track what works for your use case

## Platform Considerations

Different AI image generators may interpret prompts differently:
- **Stable Diffusion**: Supports weight syntax, extensive modifiers
- **Midjourney**: Prefers natural language, artistic references
- **DALL-E**: Benefits from detailed descriptions, clear structure

## Contributing

Found a technique that works well? Each guide is designed to grow with community knowledge. Consider:
- Testing prompt variations
- Documenting new style combinations
- Sharing platform-specific tips
- Reporting what doesn't work

## Navigation

- 🏠 [Overview](../overview.mdx)
- 🎨 [Chibi/Kawaii Guide](./chibi.md)
- 🐉 [Fantasy Guide](./fantasy.md)
- 📸 [Photorealistic Guide](./photorealistic.md)
- 💡 [Best Practices](./best-practices.md)

---

Remember: Great prompts combine technical knowledge with creative vision. Use these guides as foundations, but don't be afraid to experiment and develop your unique style!