# Design System Specification: The Serene Steward

This design system is a bespoke framework crafted for church management, moving beyond the utilitarian "admin dashboard" to create a "Digital Sanctuary." It balances the heavy responsibility of data management with an atmosphere of peace, stability, and grace.

## 1. Overview & Creative North Star: "Editorial Sanctuary"
The Creative North Star for this system is **Editorial Sanctuary**. 

Typical management systems feel like spreadsheets—rigid, boxed-in, and cold. This system breaks that mold by using high-end editorial layouts. We achieve this through **intentional asymmetry**, where large `display-lg` typography sits offset from content, and **tonal layering**, where depth is created by shifts in color rather than harsh lines. 

The goal is to make the user feel like they are "curating a community" rather than "managing a database." We use breathing room (whitespace) as a functional element to reduce cognitive load for church administrators who are often balancing multiple pastoral tasks.

---

## 2. Colors & Surface Philosophy
The palette is built on deep, authoritative blues and expansive, soft whites.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off the UI. Containers must be defined by background color shifts.
*   **Background:** Use `surface` (#f7fafc) for the main canvas.
*   **Sectioning:** Use `surface-container-low` (#f1f4f6) to define secondary sidebars or utility areas.
*   **Floating Elements:** Use `surface-container-lowest` (#ffffff) for primary content cards to create a natural, "lifted" feel.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine stationery. 
*   **Base:** `surface`
*   **Tier 1 (Cards/Workspaces):** `surface-container-lowest`
*   **Tier 2 (Inner Inputs/Nested Data):** `surface-container` (#ebeef0)

### Signature Textures: The "Glass & Gradient" Rule
To add soul to the interface, use a subtle **Linear Gradient** for primary actions and Hero headers:
*   **Primary CTA Gradient:** `primary` (#002046) to `primary_container` (#0f3566) at a 135-degree angle.
*   **Glassmorphism:** For floating modals or navigation overlays, use `surface_container_lowest` with 80% opacity and a `24px` backdrop-blur. This ensures the "peaceful" background colors bleed through, softening the interface.

---

## 3. Typography: The Voice of Authority and Grace
We pair **Manrope** (Display/Headline) with **Inter** (Body) to create a sophisticated, modern hierarchy.

*   **Display & Headlines (Manrope):** These are your "Editorial" voices. Use `display-lg` (3.5rem) for dashboard greetings or empty-state headers. The wide, geometric nature of Manrope conveys modern stability.
*   **Body & Labels (Inter):** Inter is used for high-legibility data tasks. 
    *   `body-md` (0.875rem) is the standard for data tables.
    *   `label-sm` (0.6875rem) in `on-surface-variant` is used for metadata, ensuring the UI remains uncluttered.

**Styling Tip:** For church names or "Spiritual Insights" sections, use `headline-sm` with increased letter-spacing (0.05em) to give the text a premium, "curated" feel.

---

## 4. Elevation & Depth: Tonal Layering
Avoid traditional drop shadows which can look "muddy."

*   **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` card on a `surface-container-low` background. This creates a clean, sophisticated "Step-up."
*   **Ambient Shadows:** If a card must float (e.g., a "New Member" quick-action modal), use a diffused shadow: 
    *   `box-shadow: 0 20px 40px rgba(0, 32, 70, 0.06);` (Using a tinted version of `primary`).
*   **The Ghost Border:** If a border is required for accessibility in data tables, use `outline-variant` (#c4c6cf) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components & Data Visualization

### Data Tables (The Reporting Ledger)
*   **Header:** Use `surface-container-high` for the header row background. No vertical lines.
*   **Rows:** Alternate between `surface` and `surface-container-lowest` (Zebra striping is forbidden; use whitespace `spacing-4` instead).
*   **Typography:** All numerical data should use tabular figures to ensure alignment.

### Form Inputs (The Intake)
*   **Style:** Inputs should be "Soft-Infilled." Use `surface-container` as the background with a `0.375rem (md)` corner radius.
*   **Focus State:** Shift the background to `surface-container-lowest` and add a `2px` ghost border of `primary`.
*   **Labels:** Use `label-md` placed 0.5rem above the input field, never inside.

### Visualizing Faith (Charts)
*   **Bar Charts:** Use `primary` for the main data set and `secondary_fixed_dim` for comparative data. Use the `xl (0.75rem)` roundedness on the top of bars to soften the "data-heavy" feel.
*   **Pie Charts:** Use a "Donut" style with a wide inner radius. The center of the donut should display the `title-lg` total, making the data feel editorial and "glanceable."

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`). `0.5rem (lg)` roundedness.
*   **Secondary:** Ghost style. No background, `primary` text, and a `10% opacity` primary border.
*   **Tertiary:** `on_surface_variant` text with no border. Used for "Cancel" or "Dismiss" to lower visual noise.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `spacing-12` or `spacing-16` between major sections to allow the design to "breathe."
*   **Do** use `primary_fixed` (#d6e3ff) for "Light-touch" backgrounds behind icons to signify importance without being heavy.
*   **Do** use asymmetric layouts (e.g., a 2/3 width main feed with a 1/3 width sidebar that has a different surface color).

### Don’t
*   **Don’t** use black (#000000). Use `on_surface` (#181c1e) for text to maintain a soft, premium feel.
*   **Don’t** use icons with varying stroke weights. Use a consistent 1.5pt or 2pt rounded line icon set.
*   **Don’t** crowd the screen. If a table has more than 8 columns, use a "drill-down" pattern or horizontal scroll within a surface-container.