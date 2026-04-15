

## Add Founder Photo Placeholder

### Changes

**1. `src/components/home/FounderSection.tsx`**
- Replace the name/title block (lines 65-72) with a row: photo placeholder (80×80px square, navy bg, gold "NT" initials) + name/title
- Wrap photo in `<a href={linkedinUrl}>` with a small LinkedIn indicator on hover
- Import `SITE_CONFIG` for the LinkedIn URL

**2. `src/pages/About.tsx`**
- In the bottom profile card (lines 104-114), add a 96×96px photo placeholder beside the name/title, linked to LinkedIn
- Import `SITE_CONFIG`

**3. Both locations**
- Use the existing `Avatar` / `AvatarFallback` component with custom sizing
- Square shape (no rounded corners) to match the geometric brand aesthetic
- Photo path: `SITE_CONFIG.author.image` (`/author.jpg`) with "NT" fallback
- Subtle hover effect on the LinkedIn-linked image

No new files needed — uses existing Avatar component and site config. The Contact page LinkedIn link remains untouched.

