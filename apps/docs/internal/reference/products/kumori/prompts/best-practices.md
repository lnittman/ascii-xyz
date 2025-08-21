# Prompt Engineering Best Practices

## Overview

This guide covers universal principles and techniques that apply across all image generation styles. Whether you're creating chibi characters, fantasy landscapes, or photorealistic portraits, these best practices will help you craft more effective prompts.

## Fundamental Principles

### 1. Clarity Over Complexity
Start simple and add complexity gradually. A clear, well-structured prompt often produces better results than an overly complex one.

**Good**: "young woman, red dress, sitting on park bench, sunset lighting"  
**Avoid**: "a person who might be young wearing something red somewhere outside maybe"

### 2. Specific Over Vague
Concrete details guide the AI better than abstract concepts.

**Good**: "golden retriever puppy, 3 months old, playing with blue ball"  
**Avoid**: "cute dog playing"

### 3. Positive Over Negative
Describe what you want rather than what you don't want in the main prompt.

**Good**: "clear blue sky, sunny day"  
**Avoid**: "not cloudy, no rain" (save these for negative prompts)

## Prompt Structure

### Basic Formula
```
[Subject] + [Attributes] + [Action/Pose] + [Environment] + [Style] + [Technical]
```

### Hierarchical Organization
1. **Primary Subject**: The main focus
2. **Secondary Elements**: Supporting details
3. **Environment**: Setting and background
4. **Mood/Atmosphere**: Emotional tone
5. **Technical Specifications**: Quality and style modifiers

### Example Breakdown
```
Primary: "elderly wizard"
Attributes: "long white beard, purple robes, pointed hat"
Action: "casting a spell"
Environment: "ancient library"
Mood: "mysterious atmosphere"
Technical: "digital painting, highly detailed"
```

## Word Choice and Language

### Power Words by Category

#### Quality Enhancers
- **Universal**: masterpiece, best quality, highly detailed
- **Clarity**: sharp focus, crisp details, high resolution
- **Artistic**: professional, award-winning, exhibition quality

#### Lighting Words
- **Soft**: diffused, gentle, ambient, subtle
- **Dramatic**: rim lighting, chiaroscuro, spotlight, backlit
- **Natural**: golden hour, overcast, dappled, moonlight

#### Composition Terms
- **Angles**: low angle, bird's eye view, Dutch angle, eye level
- **Framing**: rule of thirds, centered, off-center, close-up
- **Depth**: foreground/background, layered, depth of field

### Precision in Description

#### Colors
Instead of "blue", use:
- **Light**: sky blue, powder blue, cerulean
- **Medium**: cobalt, royal blue, azure
- **Dark**: navy, midnight blue, prussian blue

#### Textures
Instead of "rough", use:
- **Natural**: weathered, bark-like, coarse grain
- **Fabric**: burlap, tweed, canvas
- **Surface**: sandpaper, concrete, unpolished

#### Emotions
Instead of "happy", use:
- **Subtle**: content, pleased, serene
- **Moderate**: cheerful, joyful, delighted
- **Intense**: ecstatic, elated, euphoric

## Weight and Emphasis

### Syntax Guide
Different platforms use different syntax:

#### Common Weight Syntax
- **(word:1.5)** - Increases importance by 50%
- **(word:0.7)** - Decreases importance by 30%
- **((word))** - Alternative emphasis (often equals 1.1x)
- **[word]** - De-emphasis (often equals 0.9x)

### Strategic Weighting
```
(main subject:1.3), secondary element, (important detail:1.2), 
background element, (critical style:1.4)
```

### Progressive Weighting
Start with no weights, then add them to fix specific issues:
1. Generate with base prompt
2. Identify what needs emphasis
3. Add weights incrementally
4. Test and refine

## Negative Prompts

### Purpose and Usage
Negative prompts tell the AI what to avoid. They're crucial for:
- Preventing unwanted elements
- Fixing persistent issues
- Maintaining style consistency

### Universal Negatives
```
low quality, blurry, pixelated, jpeg artifacts, watermark, 
signature, oversaturated, underexposed, amateur
```

### Style-Specific Negatives

#### For Realism
```
cartoon, anime, illustration, painting, sketch, 
unrealistic proportions, plastic skin, doll-like
```

#### For Illustration
```
photorealistic, photography, real photo, live action,
stock photo, candid shot
```

#### For Clean Images
```
busy background, cluttered, messy, chaotic,
multiple subjects, crowded, overlapping elements
```

## Token Optimization

### Understanding Tokens
- Most models have token limits (75-150 tokens typically)
- Front-loaded tokens have more influence
- Group related concepts together

### Efficient Phrasing

#### Combine Related Attributes
**Instead of**: "red hair, long hair, wavy hair"  
**Use**: "long wavy red hair"

#### Use Established Phrases
**Instead of**: "light coming from behind the subject"  
**Use**: "backlit" or "rim lighting"

#### Leverage Style Shortcuts
**Instead of**: "in the style of a Japanese animation"  
**Use**: "anime style"

## Iteration Strategies

### The Refinement Loop
1. **Base Prompt**: Start with core elements
2. **Test Generation**: Create initial images
3. **Identify Issues**: Note what's wrong/missing
4. **Targeted Fixes**: Add specific modifiers
5. **Repeat**: Continue until satisfied

### Common Iterations

#### Fixing Composition
- Add: "centered", "rule of thirds", "dynamic angle"
- Adjust: "(subject:1.3)" to make it more prominent
- Specify: "medium shot", "full body", "close-up portrait"

#### Improving Quality
- Add: "highly detailed", "8K", "professional"
- Fix: Add specific quality issues to negative prompt
- Enhance: "(sharp focus:1.2)", "crystal clear"

#### Correcting Style
- Strengthen: "(art style:1.4)"
- Add references: "in the style of [artist/movement]"
- Negative: List conflicting styles to avoid

## Platform-Specific Tips

### Stable Diffusion
- Supports complex weight syntax
- Benefits from detailed negative prompts
- Responds well to technical terms

### Midjourney
- Prefers natural language
- Responds to artistic references
- Less reliant on negative prompts
- Uses --parameters for adjustments

### DALL-E
- Favors descriptive language
- Limited negative prompt support
- Benefits from clear, structured descriptions

## Advanced Techniques

### Prompt Blending
```
[Style A] mixed with [Style B], predominantly [A] with hints of [B],
fusion of [characteristic from A] and [characteristic from B]
```

### Conditional Prompting
```
IF daytime THEN (bright sunshine:1.2) 
IF nighttime THEN (moonlight:1.2), (stars visible:1.1)
```

### Recursive Refinement
1. Generate base image
2. Describe what you see
3. Merge description with original prompt
4. Regenerate with combined prompt

## Troubleshooting Guide

### Problem: Inconsistent Style
**Solution**: 
- Add style anchors throughout prompt
- Use consistent vocabulary (all realistic or all stylized)
- Add conflicting styles to negative prompt

### Problem: Wrong Focus
**Solution**:
- Increase weight on main subject
- Add "focus on [subject]"
- Use composition terms: "centered", "[subject] in foreground"

### Problem: Unwanted Elements
**Solution**:
- Add to negative prompt
- Specify exact number: "single person", "one flower"
- Use exclusive terms: "only", "isolated", "alone"

### Problem: Poor Quality
**Solution**:
- Add quality boosters progressively
- Check for conflicting terms
- Ensure style matches quality descriptors

## Testing and Documentation

### A/B Testing Method
1. Create control prompt
2. Change ONE element
3. Generate multiple samples
4. Document what worked
5. Build on successful changes

### Prompt Journal Template
```
Date: [date]
Goal: [what you're trying to create]
Base Prompt: [initial prompt]
Variations Tested: [list changes]
Best Result: [winning prompt]
Notes: [what you learned]
```

## Quick Reference Checklist

### Before Generating
- [ ] Is the main subject clear?
- [ ] Are descriptions specific?
- [ ] Is the style consistent?
- [ ] Are technical specs included?
- [ ] Have I considered lighting?
- [ ] Is composition specified?

### After Generating
- [ ] What worked well?
- [ ] What needs improvement?
- [ ] Are there unwanted elements?
- [ ] Is the style consistent?
- [ ] Does it match my vision?

### Optimization Checklist
- [ ] Remove redundancies
- [ ] Combine related terms
- [ ] Prioritize important elements
- [ ] Add weights if needed
- [ ] Include negative prompts
- [ ] Test variations

## Golden Rules

1. **Start Simple**: Build complexity gradually
2. **Be Specific**: Concrete beats abstract
3. **Stay Consistent**: Match vocabulary to desired style
4. **Test Systematically**: Change one variable at a time
5. **Document Success**: Keep track of what works
6. **Embrace Iteration**: Perfect prompts rarely happen on first try
7. **Know Your Platform**: Different AIs have different strengths

## Conclusion

Mastering prompt engineering is an iterative process. These best practices provide a foundation, but the key to success is experimentation, documentation, and gradual refinement. Every image generation task is unique, so adapt these principles to your specific needs while maintaining the core approach of clarity, specificity, and systematic improvement.

Remember: The best prompt is the one that consistently produces the results you want. Use these practices as guidelines, not rigid rules, and develop your own style and techniques through practice and experimentation.