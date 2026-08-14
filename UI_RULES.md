# UI Rules — LMS Frontend

Single source of truth for frontend UI conventions. Read this before touching any UI code.

## Tech Stack (one library per purpose)

- **Tailwind CSS v4** for all styling. No CSS-in-JS, no external UI frameworks (MUI, Ant, etc.).
- **shadcn-style UI kit** in `frontend/src/components/ui/` — all primitives live there. Pages never re-invent buttons, inputs, modals, tables, etc.
- **Radix UI** primitives only where the kit uses them (dialog, dropdown-menu, checkbox, label, slot, progress). Native `<select>` wrapper for dropdowns.
- **lucide-react** for all icons (one icon library).
- **React Hook Form + zod** no longer used — forms are **plain React state + zod schemas** (see Forms below).
- **dayjs** removed — use native `Date` or existing date helpers only.
- Do not install a library unless the kit or an existing pattern requires it. Uninstall anything that becomes unused.

## Theming & Tokens

- Every color/visual value comes from `frontend/src/index.css` tokens. **Never hardcode hex, rgb, or hsl literals** anywhere in JSX (including inline `style={{}}` for colors). Dynamic accent values must reference tokens, e.g. `hsl(var(--clr-blue))`, `hsl(var(--clr-green) / 0.25)`.
- **Two token families:**
  - `--clr-*` — SMIT brand/semantic palette (navy, blue, green, red, amber, slate, etc.), with `-bg`, `-border`, `-dark`, `-darker`, `-light` variants. Both light and dark variants are defined.
  - shadcn semantic tokens — `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--ring`, `--primary`, `--destructive`, etc.
- Both modes are defined in `index.css`; Tailwind exposes them as utilities (`bg-card`, `text-muted-foreground`, `bg-clr-blue`, ...). Use semantic tokens for chrome, `--clr-*` for SMIT-branded accents.
- **Dark mode** is a real toggle (`ThemeContext`, stored in `localStorage`). New UI must read tokens so it works in both modes automatically — never hardcode a "light-only" color.
- One semantic meaning → one color. Green = success/present, red = error/absent, amber = warning, blue = primary actions.

## Design Patterns

- Reuse the SMIT portal look: Poppins (global), soft radii (`rounded-lg`), 1px borders, `shadow-sm` on cards, compact density.
- Cards: `rounded-lg border bg-card shadow-sm`. Page headers: `text-2xl font-semibold tracking-tight text-foreground` + muted subtitle.
- Status colors via the `Badge` component — use its `tone` prop (success / warning / error / info / muted), never hand-rolled colored pills.
- Tables: use `DataTable` (TanStack Table wrapper). Empty/loading/error states: use `LoadingState`, `EmptyState`, `ErrorState`.
- Layouts (`AdminLayout`, `StudentLayout`) own the nav chrome (sidebar, header, user dropdown, mobile nav). Pages render only their own content.

## Forms

- Plain React state + a zod schema (see `src/lib/schemas.js`). Validate on submit (and per-field once touched if desired). No RHF.
- Use the kit: `FormField`, `Input`, `Select`, `Checkbox`, `Label`. Error text is `text-xs text-destructive`. Required markers are `<span className="text-destructive">*</span>`.
- Modal-based forms use `Modal` + `ConfirmDialog` for destructive confirmations.
- FormField/Select callbacks pass **raw values** (strings / booleans), not events — except plain `Input` `onChange` which passes the event.

## Component Kit API (quick reference)

- `Button` — `variant` (default/destructive/outline/secondary/ghost/link/success), `size` (default/sm/lg/icon), `asChild`.
- `Badge` — `tone` (success/warning/error/info/muted), optional `label`, `icon`.
- `StatCard` — `label`, `value`, `trend`/`subtitle` (+`subtitleColor`), `icon`, `iconBg`/`iconBorder`/`iconColor` (dynamic tokens allowed via `hsl(var(--clr-*))`).
- `Modal` — `open`, `onClose`, `title`, `maxWidth`, `hideDividers`, `footer`.
- `DataTable` — `data`, `columns` (TanStack), `isLoading`, `emptyMessage`.
- `Select` — `label`, `options`, `value`, `onChange(value)`, `placeholder`, `error`.
- `Toast` — `toast.success/error/info`; `ConfirmDialog` — `open`, `onConfirm`, `onCancel`, `confirmColor`.
- `Pagination`, `SearchBar`, `FilterBar`, `Alert`, `Skeleton`, `Avatar`, `PlaceholderPage` — see `components/ui/` for props.

## Rules of Thumb

1. Never copy MUI patterns back in; if you need a MUI-style behavior, build it with the kit.
2. Preserve business logic when restyling — restyles must not change validation, routing, or API calls.
3. No unused imports/variables (oxlint warning-level; keep clean).
4. No comments unless they explain non-obvious logic.
5. When adding a new color intent, add it as a token in `index.css` (both modes) — do not scatter literals.
