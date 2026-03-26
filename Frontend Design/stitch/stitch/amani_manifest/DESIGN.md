# Design System Document: Manifest Kenya Outreach

## 1. Overview & Creative North Star: "Sacred Precision"
The Creative North Star for this design system is **Sacred Precision**. In the context of the Manifest Kenya outreach, the UI must transcend the "utility app" aesthetic to become an instrument of spiritual authority and disciplined service. This is achieved through a high-end editorial approach: expansive negative space, authoritative typography scales, and a rejection of common UI "clutter" like borders and heavy drop shadows.

We break the "template" look by using **intentional asymmetry**—aligning key actions to a rigorous grid while allowing display elements to breathe. The experience should feel like a premium digital ledger—non-commercial, mission-focused, and profoundly stable.

## 2. Colors: Depth Through Tone
The palette is rooted in the contrast between the infinite (`primary: #000613`) and the light (`surface_container_lowest: #ffffff`), punctuated by the warmth of `secondary: #735c00` (Warm Gold).

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts.
*   Use `surface_container_low` (#f3f4f5) to define a secondary content area against a `surface` (#f8f9fa) background.
*   Use `surface_variant` (#e1e3e4) for subtle logical groupings within a view.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the surface-container tiers to create "nested" depth:
1.  **Level 0 (Base):** `surface` (#f8f9fa) - The foundation of the screen.
2.  **Level 1 (Sub-sections):** `surface_container_low` (#f3f4f5) - Large background blocks for lists or forms.
3.  **Level 2 (Interactive Elements):** `surface_container_lowest` (#ffffff) - Floating cards or input fields that sit "above" the sub-section.

### Signature Textures & Glassmorphism
*   **The Liturgical Gradient:** For primary CTAs and header backgrounds, use a subtle linear gradient from `primary_container` (#001f3f) to `primary` (#000613). This adds "soul" and prevents the Deep Navy from feeling flat.
*   **Frosted Glass:** For mobile navigation bars or floating action buttons, use `surface_container_highest` (#e1e3e4) with a `backdrop-filter: blur(12px)` and an opacity of 80%. This integrates the UI into the environment rather than "pasting" it on top.

## 3. Typography: The Authoritative Voice
We employ a dual-typeface system to balance modern clarity with traditional authority.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-md` for impact. Manrope’s geometric yet open nature conveys a sense of modern discipline.
*   **Body & Titles (Inter):** Inter is used for all functional reading (`body-md`) and metadata (`label-sm`). It provides maximum legibility for field workers under varying light conditions.
*   **Hierarchy Note:** Always prioritize high contrast. A `headline-lg` in `primary` (#000613) should be followed by a `body-md` in `on_surface_variant` (#43474e) to create a clear editorial "read."

## 4. Elevation & Depth: Tonal Layering
Instead of traditional shadows that can feel "muddy," we use light and tone to imply importance.

*   **The Layering Principle:** Depth is achieved by "stacking." A card using `surface_container_lowest` (#ffffff) placed on a `surface_container_low` (#f3f4f5) background creates a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a critical Outreach Action Button), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(0, 31, 63, 0.06);`. The shadow is tinted with the Navy Primary to mimic natural light.
*   **The Ghost Border:** For accessibility in input fields, use `outline_variant` (#c4c6cf) at **20% opacity**. Never use 100% opaque borders.

## 5. Components: Refined Utility

### Buttons (The "Seal")
Buttons must be large and tactile (minimum height 56px) for field use.
*   **Primary:** Background: `primary_container` (#001f3f), Text: `on_primary` (#ffffff), Border-radius: `md` (0.375rem).
*   **Secondary:** Background: `surface_container_highest`, Text: `primary`.
*   **Tertiary:** No background. Text: `secondary` (#735c00). Use for "Cancel" or "Back" actions.

### Cards & Lists (The "Ledger")
*   **Forbid Divider Lines:** Use vertical white space (`spacing: 4` or `1.4rem`) to separate list items. 
*   **Interaction:** Active list items should shift from `surface` to `surface_container_high`.

### Input Fields
*   Text inputs should be "filled" style using `surface_container_highest`. 
*   Labels must use `label-md` in `on_surface_variant`, sitting 4px above the input area.
*   **Error State:** Use `error` (#ba1a1a) for the "Ghost Border" and `on_error_container` (#93000a) for helper text.

### Field-Specific Components
*   **The Authority Header:** A large-scale typography header (using `display-sm`) that pins to the top on scroll, utilizing Glassmorphism to show the "work" (content) passing underneath it.
*   **Progress Steppers:** Use `secondary_fixed_dim` (#e9c349) for active spiritual milestones, ensuring the "Warm Gold" acts as a beacon of progress.

## 6. Do’s and Don’ts

### Do
*   **Do** use expansive padding (`spacing: 6` or `2rem`) to frame important spiritual content.
*   **Do** use `secondary` (Gold) sparingly—only for moments of success, spiritual milestones, or primary calls to action.
*   **Do** prioritize a mobile-first, bottom-aligned navigation to ensure "field-readiness."

### Don’t
*   **Don’t** use pure black (#000000). Use `primary` (#000613) for deep contrast.
*   **Don’t** use standard "Material Design" shadows. They look commercial and generic.
*   **Don’t** use 1px dividers to separate content. Let the whitespace and tonal shifts do the work.
*   **Don’t** use high-saturation reds or greens. Use the refined `error` and `secondary` tokens to maintain a professional, non-commercial palette.