# Ledgerly

Ledgerly is a product concept for small-business accounting. This Vite + React workspace contains a responsive marketing website and three connected application screens, using fictional Northstar Studio records in USD.

## Run locally

```bash
npm install
npm run dev
```

## Routes

- `/` — marketing website with interactive product demonstrations
- `/app/dashboard` — business dashboard
- `/app/invoices` — invoice list with status filters, search and detail drawer
- `/app/create-invoice` — invoice form with validation, totals and review drawer

## Shared design system

The implemented tokens live in `src/design-system/tokens.css`; reusable components are in `src/components/`. The editable Tempo showcase is the **Ledgerly Design System** canvas at `tempo/designs/design-system/ledgerly-design-system`; the existing live preview with the landing page and three application routes is `tempo/designs/canvases/Main design`.

Product requirements, implemented system decisions and the living work log are in Tempo Docs.
