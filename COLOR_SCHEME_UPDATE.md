# Color Scheme Update Documentation

## New Color Palette

This document describes the updated color scheme for the FAP Frontend project.

### Primary Colors

- **Primary Color**: `#F4831C` (Orange) - Main brand color
  - Used for: Primary buttons, main CTAs, important highlights
  - Hover: `#d6721a`
  - Light variant: `#fef3e9`
  - Dark variant: `#c96d17`

- **Secondary Color 1**: `#016FBB` (Blue)
  - Used for: Student Portal theme, secondary actions
  - Hover: `#015a97`
  - Light variant: `#e6f4fc`

- **Secondary Color 2**: `#73BF44` (Green)
  - Used for: Public Portal theme, success states
  - Hover: `#5fa037`
  - Light variant: `#f0f9eb`

- **White**: `#FFFFFF`
  - Used for: Text on colored backgrounds, cards, clean sections

### Updated Files

#### Core Style Files
1. `/src/styles/variables.scss` - Central color variable definitions

#### Login Section
2. `/src/pages/hoang/Login/index.scss` - Login page with orange gradient background

#### Student Portal (Blue theme)
3. `/src/pages/hoang/StudentPortal/index.scss` - Main layout with blue gradient
4. `/src/pages/hoang/StudentPortal/Dashboard/Dashboard.scss`
5. `/src/pages/hoang/StudentPortal/MyCredentials/MyCredentials.scss`
6. `/src/pages/hoang/StudentPortal/Profile/Profile.scss`
7. `/src/pages/hoang/StudentPortal/WeeklyTimetable/WeeklyTimetable.scss`
8. `/src/pages/hoang/StudentPortal/SharePortal/SharePortal.scss`
9. `/src/pages/hoang/StudentPortal/InstructorDetail/InstructorDetail.scss`
10. `/src/pages/hoang/StudentPortal/GradeReport/GradeReport.scss`
11. `/src/pages/hoang/StudentPortal/CredentialDetail/CredentialDetail.scss`
12. `/src/pages/hoang/StudentPortal/ClassStudentList/ClassStudentList.scss`
13. `/src/pages/hoang/StudentPortal/AttendanceReport/AttendanceReport.scss`
14. `/src/pages/hoang/StudentPortal/ActivityDetail/ActivityDetail.scss`

#### Public Portal (Green theme)
15. `/src/pages/hoang/PublicPortal/index.scss` - Main layout with green gradient
16. `/src/pages/hoang/PublicPortal/Home/Home.scss`
17. `/src/pages/hoang/PublicPortal/VerificationResults/VerificationResults.scss`
18. `/src/pages/hoang/PublicPortal/VerificationPortal/VerificationPortal.scss`
19. `/src/pages/hoang/PublicPortal/VerificationHistory/VerificationHistory.scss`
20. `/src/pages/hoang/PublicPortal/AboutHelp/AboutHelp.scss`

### Color Usage Guidelines

#### When to use Primary Color (#F4831C - Orange)
- Main call-to-action buttons
- Primary navigation highlights
- Important status indicators
- Login page branding
- Key interactive elements

#### When to use Secondary Color 1 (#016FBB - Blue)
- Student Portal theme
- Information displays
- Student-related features
- Academic content sections

#### When to use Secondary Color 2 (#73BF44 - Green)
- Public Portal theme
- Verification features
- Success messages
- Public-facing content

#### When to use White (#FFFFFF)
- Text on colored backgrounds
- Clean card backgrounds
- Contrast elements for emphasis

### Gradients

Three gradient combinations are available:

```scss
$gradient-primary: linear-gradient(135deg, #F4831C 0%, #c96d17 100%);
$gradient-secondary-1: linear-gradient(135deg, #016FBB 0%, #015a97 100%);
$gradient-secondary-2: linear-gradient(135deg, #73BF44 0%, #5fa037 100%);
```

### Migration Notes

All color values have been centralized in `/src/styles/variables.scss` using SCSS variables. The old `@import` syntax has been updated to `@use` for better module system support.

**Before:**
```scss
@import "../../../styles/variables.scss";
color: #1890ff;
```

**After:**
```scss
@use "../../../styles/variables" as *;
color: $primary-color;
```

### Breaking Changes

- All hardcoded color values (#1890ff, #722ed1, etc.) have been replaced with variables
- Box shadow rgba values updated to match new primary color
- Gradient definitions updated to use new color scheme

### Testing Checklist

- [x] Login page displays with orange theme
- [x] Student Portal uses blue gradient
- [x] Public Portal uses green gradient
- [x] All buttons use appropriate color scheme
- [x] Hover states work correctly
- [x] Dark mode compatibility maintained
- [x] No SCSS compilation errors

### Future Enhancements

Consider creating:
- Color utility classes for easy color application
- Themed components using the color palette
- Accessibility contrast checks for all color combinations
- Design tokens for consistent color usage across frameworks

