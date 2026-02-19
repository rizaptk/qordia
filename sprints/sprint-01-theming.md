# Sprint 1: Core & Theming

## Objective:
Ensure the application's visual identity aligns perfectly with the `CONCEPT.md` brand guide.

### Atomic Tasks:
- [ ] **Global Styles:** Review `src/app/globals.css`.
    - [ ] Verify `--primary`, `--accent`, and `--background` HSL values match `Royal Smart Purple` (#6B5CFF), `Fresh Order Mint` (#2ED1A2), and `Light Background` (#F8FAFC) respectively.
    - [ ] Add `Soft Amber` (#FFB547) to the palette, perhaps as a `warning` or `notification` color variable.
- [ ] **Font:** Confirm `Plus Jakarta Sans` is correctly applied in `src/app/layout.tsx` and `tailwind.config.ts`.
- [ ] **Component Audit:** Review key components (`Button`, `Card`, `Badge`) to ensure they use the theme colors correctly (primary, secondary, accent) instead of hardcoded colors.
- [ ] **Dark Mode:** Ensure dark mode theme in `globals.css` provides a high-contrast, brand-aligned experience.
- [ ] **Logo:** Replace the placeholder SVG in `src/app/page.tsx` with a proper SVG representation of the "QR Flow Symbol" concept from `CONCEPT.md`.
