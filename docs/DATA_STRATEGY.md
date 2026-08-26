# Satyaseetu Data Strategy

## Real/Public Data
Use publicly accessible GeM tender/bid documents.

Target:
- Several tenders
- One primary deeply demonstrated tender
- Meaningful compliance requirements

## Synthetic Bidder Data
Create realistic fictional bidder organizations and identifiers.

Scenarios:
1. Fully compliant
2. Missing mandatory document
3. Financial failure
4. Expired certificate
5. Invalid identifier
6. Company-name mismatch
7. Product-model mismatch
8. Technical threshold failure
9. OEM mismatch
10. Ambiguous/conflicting evidence

## Synthetic Documents
Possible document types:
- PAN
- GST Certificate
- Udyam Certificate
- Turnover Certificate
- Experience Certificate
- ISO/other certificate
- OEM Authorization
- Technical Datasheet
- Declaration

Every synthetic document must clearly state:
"SYNTHETIC DOCUMENT — FOR HACKATHON DEMONSTRATION ONLY"

Use fictional entities and identifiers.

## Ground Truth
Maintain a hidden master dataset containing expected facts and expected GREEN/RED/YELLOW outcomes. Do not expose ground-truth data to the processing pipeline as the answer.

## Target Scale
For a strong internal prototype:
- 5–10 bidders for the primary scenario
- 6–10 documents per bidder depending on tender requirements
- Multiple tenders to demonstrate reuse
