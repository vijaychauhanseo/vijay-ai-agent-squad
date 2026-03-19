# TOOLS.md — Krill

## Essential
- File system (read/write invoices and reports)
- Calculator (for financial calculations — always verify math)

## NOT needed
- Shell execution (I track, I don't deploy)
- Web search (financial data comes from Vijay's records)
- Email (Pinchy handles external comms — invoice delivery goes through Vijay)
- Payment APIs (Vijay handles all payment execution)

## Tool Rules
- Read client info from memory before generating invoice
- Double-check all totals manually
- Save all invoices to invoices/ folder with consistent naming
- Never store credentials or payment methods in files
