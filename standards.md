# Project Standards & Preferences

**Project**: AT Protocol OS  
**Last Updated**: 2025-06-11  
**Purpose**: Central source of truth for development standards, preferences, and team guidelines

## Communication Standards

### Response Style
- **Concise with solid detail**: Provide substantive information without overwhelming
- **Ask-first approach**: "I'll ask if need more info" - start concise, expand on request
- **Direct and practical**: Focus on actionable information and clear next steps
- **Status-driven**: Use clear indicators (✅ WORKING, 🔧 NEEDS WORK, 🚀 READY)

### Documentation Voice
- **Professional but approachable**: Technical accuracy with clear explanations
- **No emojis in technical documentation**: Keep docs clean and professional
- **Emojis OK in UX**: End-user facing prompts can have emojis to improve experience
- **Structured format**: Clear sections, consistent headers, logical flow

### Update Methodology
- **Prefer `cat >` commands**: Easy command-line file updates for quick implementation
- **Incremental changes**: Small, focused updates rather than large rewrites
- **Version tracking**: Clear version progression (v0.05a style)
- **Changelog maintenance**: Keep CHANGELOG.md current with detailed progress

## Technical Standards

### Stack Preferences
- **Framework**: Next.js (React 18+) with TypeScript
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Animations**: Framer Motion with smooth, calm transitions
- **Icons**: Lucide React for consistency
- **State Management**: React Context for global state
- **No localStorage**: Ensure Claude.ai compatibility

### Code Quality
- **TypeScript strict mode**: Proper typing throughout
- **Component structure**: Clean separation of concerns
- **Error handling**: Comprehensive error states and user feedback
- **Performance**: Lazy loading, efficient re-renders, proper cleanup
- **Accessibility**: Semantic markup, proper contrast, keyboard navigation

### Architecture Patterns
- **Context-based auth**: Persistent session management
- **Component composition**: Reusable, composable components
- **API route organization**: Clear separation by feature
- **Type safety**: Interfaces for all data structures
- **Clean imports**: Organized import statements with proper paths

## UI/UX Standards

### Visual Design
- **Dark themes only**: No light or bright themes
- **Color preferences**: 
  - Primary: Deep blue (#1d4ed8)
  - Accent: Deep orange (#ea580c)
  - Subtle variations for depth and hierarchy
- **Hover effects**: Subtle glow effects (0 0 10px var(--border-glow))
- **Professional aesthetics**: Clean, polished, modern appearance

### Animation Standards
- **Duration**: 300ms for most transitions
- **Easing**: `ease-in-out` or `ease-out` for natural feel
- **Smoothness priority**: Calm, professional animations
- **No jarky motion**: Avoid fast, startling, or jumpy animations
- **Performance**: Hardware-accelerated properties when possible

### Layout Principles
- **Three-column structure**: Left navigation, center content, right contextual
- **Responsive design**: Mobile-first approach with proper breakpoints
- **Consistent spacing**: Use spacing scale throughout
- **Information hierarchy**: Clear visual hierarchy with proper typography
- **Standard sizing**: Follow platform conventions (40px Bluesky profile pics)

### Interactive Elements
- **Feedback on actions**: Clear success/error messages
- **Loading states**: Proper loading indicators for all async actions
- **Disabled states**: Clear visual feedback for non-interactive elements
- **Hover states**: Consistent hover feedback across all interactive elements

## Feature Development

### Implementation Approach
- **Functionality first**: Working features over perfect polish
- **Incremental improvement**: Ship working versions, iterate quickly
- **User feedback**: Clear interaction feedback and status messages
- **Error resilience**: Graceful error handling and recovery

### Timeline Management
- **Reasonable refresh rates**: 25-30 seconds for timeline auto-refresh
- **User control**: Pause/resume options for auto-refresh
- **Persistent state**: Login sessions survive page refreshes
- **Real-time updates**: Live data where appropriate

### Integration Standards
- **AT Protocol**: Multi-service support (Bluesky, custom PDS)
- **Authentication**: Secure, persistent session management
- **API design**: RESTful endpoints with proper error handling
- **Data validation**: Input validation and sanitization

## Project Management

### Version Control
- **Semantic versioning**: v0.05a style with clear progression
- **Feature branches**: Separate branches for major features
- **Commit messages**: Clear, descriptive commit messages
- **Documentation updates**: Keep CHANGELOG.md current

### Testing Approach
- **Manual testing**: Thorough testing of user flows
- **Cross-browser**: Ensure compatibility across modern browsers
- **Performance testing**: Check for memory leaks and performance issues
- **Accessibility testing**: Verify keyboard navigation and screen readers

### Deployment
- **Environment parity**: Development matches production
- **Gradual rollout**: Test features before full deployment
- **Rollback plan**: Easy rollback for problematic deployments
- **Monitoring**: Basic error tracking and performance monitoring

## Team Guidelines

### Onboarding New Contributors
1. Review this STANDARDS.md first
2. Check CHANGELOG.md for current project status
3. Review existing code patterns before implementing
4. Ask questions early rather than making assumptions
5. Test thoroughly before committing changes

### Code Review Standards
- **Functionality**: Does it work as intended?
- **Style consistency**: Follows established patterns?
- **Performance**: No obvious performance issues?
- **Error handling**: Proper error states and messaging?
- **Documentation**: Comments where necessary, self-documenting code preferred

### Communication Protocols
- **Progress updates**: Regular status updates on development
- **Issue reporting**: Clear reproduction steps and context
- **Feature requests**: User story format with clear acceptance criteria
- **Technical decisions**: Document reasoning for major technical choices

## Current Project Context

### Active Priorities
1. **UI/UX Polish**: Theme system, smooth animations, professional feel
2. **Timeline Enhancement**: Threading, better refresh control, interaction feedback
3. **Layout Optimization**: Three-column structure with proper information architecture

### Technical Debt
- Terminal widget needs real integration (currently mock)
- Threading system needs full conversation support
- Settings panel needs more configuration options
- Profile management features needed

### Success Metrics
- **User Experience**: Smooth, professional interface feel
- **Performance**: Fast load times, responsive interactions
- **Reliability**: Persistent authentication, error resilience
- **Functionality**: Core features working consistently

## Contact & Resources

- **Primary Repository**: https://github.com/Cache8063/atproto-os
- **Development Environment**: ~/atdash/atproto-test
- **Documentation**: Keep CHANGELOG.md updated with all changes
- **Communication**: Direct, practical, solution-focused

---

**Note for Teams**: This document reflects established preferences and should be referenced before making major changes to architecture, design, or user experience patterns. When in doubt, ask for clarification rather than assuming.