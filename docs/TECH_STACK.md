# Satyaseetu Technology Stack

## Existing Product Layer
Preserve the current prototype UI where practical.

## Frontend
Preferred direction:
- React / TypeScript
- Existing prototype UI and routing
- Tailwind CSS if already used
- Connect screens to real APIs instead of replacing the design

## Backend
Recommended:
- FastAPI for document/AI services
- REST API contracts
- Modular service boundaries

If the existing project has another backend requirement, document the decision before changing it.

## Database
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- pgvector when semantic/RAG features are introduced

## Document Processing
- PyMuPDF for digital PDFs
- Tesseract OCR for scanned PDFs/images
- Table/document extraction as needed
- python-docx/openpyxl/pandas where document types require them

## AI
Use a selected LLM provider such as Gemini or another approved provider.

AI should use structured outputs and schema validation.

## Verification
Adapter interface:
- verifyGST
- verifyPAN
- verifyUdyam
- verifyCompany
- future authorized connectors

Prototype uses mock connectors.

## Security
- RBAC
- protected APIs
- environment variables
- secure upload validation
- file-size/type restrictions
- restricted document access
- audit logging
