# Sprint 1: Core & Theming

## Objective:
Ensure the application's visual identity aligns perfectly with the `CONCEPT.md` brand guide and core UX principles.

### Atomic Tasks:
- [x] **Global Styles:** Review `src/app/globals.css`.
    - [x] Verify `--primary`, `--accent`, and `--background` HSL values match `Royal Smart Purple` (#6B5CFF), `Fresh Order Mint` (#2ED1A2), and `Light Background` (#F8FAFC) respectively.
    - [x] Add `Soft Amber` (#FFB547) to the palette as a `warning` color variable.
- [x] **Font:** Confirm `Plus Jakarta Sans` is correctly applied in `src/app/layout.tsx` and `tailwind.config.ts`.
- [x] **Component Audit:** Review key components (`Button`, `Card`, `Badge`) to ensure they use the theme colors correctly (primary, secondary, accent) instead of hardcoded colors.
- [x] **Dark Mode:** Ensure dark mode theme in `globals.css` provides a high-contrast, brand-aligned experience.
- [x] **Logo:** Replace the placeholder SVG in `src/app/page.tsx` with a proper SVG representation of the "QR Flow Symbol" concept from `CONCEPT.md`.

### UX/UI Polish:
- [x] **Review Component Sizing:** Adjust default header/card padding to be less oversized for a cleaner look.
- [x] **Simplify Headers:** Remove descriptive text from underneath titles in `CardHeader` components across the app to reduce clutter.
- [x] **Final Design Principles:** Ensure all changes align with the "Final Design Direction Summary" from the wireframes:
    - [x] Is it **Fast**? (Performant, no unnecessary animations)
    - [x] Is it **Clean**? (Minimal clutter, good whitespace)
    - [x] Is it **Modern**? (Uses the brand guide correctly)
    - [x] Is it **Friendly**? (Approachable UI, not intimidating)
    - [x] Is it **Stress-free**? (Intuitive for staff during peak hours)
    - [x] Is it **Effortless**? (Frictionless for customers)
