# Satyaseetu API Contracts

## Initial Phase 1 Contracts
Authentication:
- POST /api/auth/login
- GET /api/auth/me

Tenders:
- GET /api/tenders
- POST /api/tenders
- GET /api/tenders/{id}

Users/Vendors:
- GET /api/vendors
- POST /api/vendors

Health:
- GET /api/health

## Later Contracts
- POST /api/tenders/import
- POST /api/tenders/{id}/documents
- GET /api/tenders/{id}/requirements
- POST /api/tenders/{id}/analyze
- GET /api/tenders/{id}/bidders
- POST /api/vendors/{id}/documents
- POST /api/documents/{id}/process
- POST /api/compliance/run
- GET /api/tenders/{id}/compliance
- GET /api/requirements/{id}/evidence
- GET /api/bidders/{id}/compliance
- POST /api/reviews/{id}/approve
- POST /api/reviews/{id}/override
- GET /api/reports/{tenderId}
- GET /api/audit/{tenderId}

Adapt exact paths to the implementation, but keep contracts documented.
