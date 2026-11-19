import { Canvas, Storyboard } from "tempo-sdk/canvas";
import { defineAsset } from "tempo-sdk/assets";
import { DesignSystemShowcase } from "../../../../src/design-system/Showcase";
import {
  AccordionItem, Brand, Breadcrumbs, Button, Card, ChoiceField, Drawer,
  EmptyState, FeedbackState, Field, IconButton, IconographyPack, LoadingState, MetricCard,
  Modal, Pagination, SelectField, StatusBadge, Tabs, TextAreaField, Toast, Tooltip,
} from "../../../../src/components/system";
import { ApplicationSidebar, CashFlowChart, CashFlowLegend, CreateInvoiceScreen, DashboardFinancialOverview, DashboardScreen, InvoiceListScreen, InvoiceTable } from "../../../../src/components/application";
import { MarketingHeader, PricingCard } from "../../../../src/components/marketing";

export default function LedgerlyDesignSystemCanvas() {
  return (
    <Canvas name="Ledgerly Design System" backgroundColor="#F5F7F6">
      <Storyboard
        id="LedgerlyDesignSystem"
        name="Ledgerly Design System"
        component={DesignSystemShowcase}
        layout={{ x: 0, y: 0 }}
      />
    </Canvas>
  );
}

defineAsset(Brand, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for the Ledgerly wordmark in navigation, product shells, footers and invoices.",
  variants: { Standard: { props: { href: "/" } }, Inverse: { props: { inverse: true, href: "/" } } },
});

defineAsset(Button, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for actions and form submits. Use a link for navigation; reserve one primary action for a surface.",
  variants: {
    Primary: { props: { children: "Continue" } },
    Secondary: { props: { variant: "secondary", children: "Add an invoice" } },
    Outline: { props: { variant: "outline", children: "Cancel" } },
    Ghost: { props: { variant: "ghost", size: "sm", children: "View details" } },
    Destructive: { props: { variant: "danger", children: "Delete draft" } },
    Loading: { props: { isLoading: true, children: "Saving" } },
    Disabled: { props: { disabled: true, children: "Unavailable" } },
  },
});

defineAsset(StatusBadge, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Show a readable status label beside an invoice or review record. Never use color alone to communicate status.",
  variants: {
    Paid: { props: { status: "Paid" } },
    AwaitingPayment: { props: { status: "Awaiting payment" } },
    Overdue: { props: { status: "Overdue" } },
    Draft: { props: { status: "Draft" } },
    ReviewNeeded: { props: { status: "Review needed" } },
  },
});

defineAsset(MetricCard, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for one clearly defined financial metric with a short, factual context line.",
  variants: {
    CashBalance: { props: { label: "Cash balance", value: "$31,258.00", detail: "Oct 2025 — Mar 2026 · net activity" } },
    Collected: { props: { label: "Collected in March", value: "$5,800.00", detail: "2 paid invoices this month", trend: "up" } },
    OpenInvoices: { props: { label: "Open invoices", value: "$2,830.00", detail: "2 invoices · 1 overdue", trend: "down" } },
  },
});

defineAsset(Card, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Group related information on a surface. Add a heading and keep the card focused on one task or subject.",
  variants: { Default: { props: { children: "A focused content surface." } }, Foundation: { props: { className: "foundation-card", children: "Foundation example" } } },
});

defineAsset(Field, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use persistent labels, concise hints and inline errors associated with the input.",
  variants: {
    Default: { props: { label: "Business name", value: "Northstar Studio", readOnly: true } },
    Error: { props: { label: "Email address", value: "not-an-email", error: "Enter a valid email address.", readOnly: true } },
    Disabled: { props: { label: "Invoice number", placeholder: "NS-2026-015", disabled: true } },
    Currency: { props: { label: "Hourly rate", prefix: "$", type: "number", value: "125.00", readOnly: true } },
  },
});

defineAsset(SelectField, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a short, stable option list with a persistent label and an associated validation message when needed.",
  variants: {
    PaymentTerms: { props: { label: "Payment terms", options: [{ value: "net14", label: "Net 14 days" }, { value: "net30", label: "Net 30 days" }], value: "net14" } },
    Customer: { props: { label: "Bill to", options: [{ value: "fieldwork", label: "Fieldwork Studio" }, { value: "pacific", label: "Pacific House" }], value: "fieldwork" } },
  },
});

defineAsset(TextAreaField, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for short contextual notes. Keep labels persistent and preserve the input's natural resize affordance where practical.",
  variants: { InvoiceNote: { props: { label: "Invoice note", rows: 3, value: "Thank you for working with us.", readOnly: true } } },
});

defineAsset(ChoiceField, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use checkboxes for independent choices and radio groups for one choice from a set.",
  variants: { Checkbox: { props: { label: "Include a client reference", checked: true } }, Radio: { props: { label: "Net 14 days", type: "radio", name: "payment-terms", value: "net14", checked: true } } },
});

defineAsset(Breadcrumbs, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Show the current location within a short, hierarchical application path.",
  variants: { InvoiceForm: { props: { items: [{ label: "Invoices", href: "/app/invoices" }, { label: "Create invoice" }] } } },
});

defineAsset(AccordionItem, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a concise answer or secondary detail that can be opened on demand.",
  variants: { Closed: { props: { title: "Who is Ledgerly designed for?", children: "Ledgerly is designed for small-business owners and operators." } }, Open: { props: { title: "Can I review an invoice before saving?", children: "Yes. Review the customer, dates, line items, tax and total in the invoice preview.", defaultOpen: true } } },
});

defineAsset(Toast, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Confirm a reversible action briefly and allow dismissal; use inline feedback for form validation.",
  variants: { Success: { props: { title: "Draft saved", message: "NS-2026-015 is in the invoice list." } }, Error: { props: { title: "Could not save draft", message: "Check the required fields and try again.", tone: "error" } }, Information: { props: { title: "Invoice preview ready", message: "Review the client, dates, items and total.", tone: "info" } } },
});

defineAsset(Modal, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a focused confirmation that needs a clear decision. It traps keyboard focus and closes with Escape.",
  variants: { Confirmation: { props: { title: "Delete this draft?", children: "This sample action cannot be undone.", onClose: () => undefined } } },
});

defineAsset(Drawer, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for related detail that should keep the originating list or form in context. It traps keyboard focus and closes with Escape.",
  variants: { InvoiceDetails: { props: { title: "Invoice details", children: "Review the customer, amount and due date.", onClose: () => undefined } } },
});

defineAsset(LoadingState, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use a small skeleton structure when content is loading and the final layout is known.",
  variants: { InvoiceList: { props: { label: "Loading invoice list" } } },
});

defineAsset(EmptyState, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Explain why a list is empty and offer one next action when an action is available.",
  variants: { NoInvoices: { props: { title: "No invoices yet", description: "Create an invoice and it will appear here." } } },
});

defineAsset(FeedbackState, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use inline success or error feedback to explain a result and, for errors, the next correction.",
  variants: {
    Success: { props: { title: "Draft saved", message: "NS-2026-015 is ready to review." } },
    Error: { props: { title: "Check the due date", message: "Choose a date on or after the issue date.", tone: "error" } },
  },
});

defineAsset(Pagination, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for result sets with multiple pages; disable Previous and Next at the bounds.",
  variants: { MiddlePage: { props: { currentPage: 2, pageCount: 4, onChange: () => undefined } } },
});

defineAsset(Tabs, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a small set of peer views within the same context, with the selected tab announced.",
  variants: { ProductViews: { props: { items: [{ id: "overview", label: "Overview" }, { id: "invoices", label: "Invoices" }], active: "overview", label: "Product views", onChange: () => undefined } } },
});

defineAsset(Tooltip, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a brief supplemental label on a control that already has an accessible name.",
  variants: { SearchHint: { props: { label: "Search invoices", children: "Search" } } },
});

defineAsset(IconButton, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for a compact icon-only action with a concise accessible label.",
  variants: { Help: { props: { label: "Help", children: "?" } }, Close: { props: { label: "Close", children: "×" } } },
});

defineAsset(IconographyPack, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use these Lucide line icons for Ledgerly navigation, invoice actions, financial activity and status. Keep icons paired with labels unless the control has a concise accessible name.",
  variants: {
    CompactPack: { props: { size: "sm" } },
    InterfacePack: { props: { size: "md" } },
    FeaturePack: { props: { size: "lg" } },
  },
});

defineAsset(InvoiceTable, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for invoice records with amounts aligned, readable statuses and a compact mobile summary. Compact mode removes row-detail interaction for embedded previews.",
  variants: { RecentInvoices: { props: { rows: [{ id: "NS-2026-014", client: "Pacific House", issuedAt: "2026-03-19", dueAt: "2026-04-02", amount: 2400, status: "Paid", paidAt: "2026-03-22" }, { id: "NS-2026-013", client: "Fieldwork Studio", issuedAt: "2026-03-15", dueAt: "2026-03-29", amount: 1850, status: "Awaiting payment" }, { id: "NS-2026-012", client: "Merrow & Co.", issuedAt: "2026-02-20", dueAt: "2026-03-06", amount: 980, status: "Overdue" }, { id: "NS-2026-011", client: "Cedar House", issuedAt: "2026-03-03", dueAt: "2026-03-17", amount: 3400, status: "Paid", paidAt: "2026-03-13" }], compact: true } }, InvoiceList: { props: { rows: [{ id: "NS-2026-014", client: "Pacific House", issuedAt: "2026-03-19", dueAt: "2026-04-02", amount: 2400, status: "Paid", paidAt: "2026-03-22" }, { id: "NS-2026-013", client: "Fieldwork Studio", issuedAt: "2026-03-15", dueAt: "2026-03-29", amount: 1850, status: "Awaiting payment" }, { id: "NS-2026-012", client: "Merrow & Co.", issuedAt: "2026-02-20", dueAt: "2026-03-06", amount: 980, status: "Overdue" }, { id: "NS-2026-011", client: "Cedar House", issuedAt: "2026-03-03", dueAt: "2026-03-17", amount: 3400, status: "Paid", paidAt: "2026-03-13" }] } } },
});

defineAsset(CashFlowChart, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for the monthly income and expense comparison. Pair with CashFlowLegend and preserve the accessible chart summary.",
  variants: { Application: { props: { variant: "application" } }, Marketing: { props: { variant: "marketing" } } },
});

defineAsset(CashFlowLegend, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Place beside the shared cash-flow chart so series meaning remains explicit and does not rely on color alone.",
  variants: { WithCurrency: { props: {} }, Compact: { props: { compact: true } } },
});

defineAsset(DashboardScreen, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use as the complete Dashboard composition in the application or a product preview. This is one of the three Ledgerly application screens.",
  variants: { FullApplication: { props: {} }, CompactPreview: { props: { compact: true } } },
});

defineAsset(ApplicationSidebar, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use this shared application sidebar for workspace identity, navigation groups, support and account actions. Keep the active item aligned with the current application view.",
  variants: {
    Dashboard: { props: { view: "dashboard", compact: true } },
    InvoiceList: { props: { view: "invoices", compact: true } },
  },
});

defineAsset(DashboardFinancialOverview, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use the actual Dashboard financial summary layout for cash balance, net income, open invoices and monthly collections. Keep this composition distinct from the generic MetricCard component.",
  variants: { DashboardData: { props: {} } },
});

defineAsset(InvoiceListScreen, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use as the complete Invoice List composition. Compact mode removes the standalone shell for embedded product previews.",
  variants: { FullApplication: { props: {} }, CompactPreview: { props: { compact: true } } },
});

defineAsset(CreateInvoiceScreen, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use as the complete Create Invoice composition. Line items and tax calculate in place; saving adds the draft to the invoice list.",
  variants: { FullApplication: { props: {} }, CompactPreview: { props: { compact: true } } },
});

defineAsset(PricingCard, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use for clearly tiered monthly subscriptions, with a concise audience, price and included features.",
  variants: { Standard: { props: { name: "Independent", descriptor: "For a business of one.", detail: "A clear start for personal client work.", monthlyPrice: 18, features: ["Invoice creation and tracking", "Expense records", "Monthly cash-flow view"], href: "#pricing" } }, Featured: { props: { name: "Studio", descriptor: "For a small, growing team.", detail: "Shared day-to-day finance work.", monthlyPrice: 36, features: ["Everything in Independent", "Shared business workspace", "Expense review and matching"], href: "#pricing", featured: true } } },
});

defineAsset(MarketingHeader, {
  libraries: ["Ledgerly Design System"],
  usageInstructions: "Use the production responsive marketing header, including its desktop navigation, mobile menu, sign-in link and primary action. Use preview mode only when embedding it inside the design-system showcase.",
  variants: {
    Website: { props: { preview: false } },
    DesignSystemPreview: { props: { preview: true } },
  },
});
