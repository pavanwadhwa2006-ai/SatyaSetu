-- ============================================================
-- SatyaSetu — Phase 1 Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor.
--
-- All data is SYNTHETIC and for demonstration purposes only.
-- No real government identifiers, no real company data.
-- Identifiers deliberately use SYNTHETIC- prefix.
--
-- NOTE: Seed users (auth.users rows) must be created separately
-- using the Supabase Auth admin API or the seed.py script.
-- This SQL only seeds tenders and vendors (no auth dependency).
-- ============================================================

-- ============================================================
-- SYNTHETIC TENDERS (mirrors existing mock data from src/data/tenders.ts)
-- These are the 5 tenders the prototype UI already shows.
-- ============================================================
INSERT INTO public.tenders (
    tender_number, title, organization, department, category,
    description, source, status, estimated_value,
    submission_deadline, publish_date, bid_validity_days,
    evaluation_type, delivery_location, delivery_period_days,
    warranty_months, emd_amount
)
VALUES
(
    'SYNTHETIC-TENDER-001',
    'Supply and Installation of Industrial Temperature Monitoring Equipment',
    'Government Procurement Department',
    'Central Instrumentation Division',
    'Industrial Equipment / Monitoring Systems',
    'Supply, installation, testing, and commissioning of industrial-grade temperature monitoring systems across 12 locations. Equipment must comply with IS/IEC standards and include 3-year comprehensive warranty with on-site support. [SYNTHETIC DATA — FOR DEMONSTRATION ONLY]',
    'SYNTHETIC',
    'EVALUATION',
    18500000,
    '2026-09-20 23:59:59+05:30',
    '2026-08-01',
    90,
    'Quality and Cost Based Selection (QCBS)',
    'Multiple locations across India',
    120,
    36,
    370000
),
(
    'SYNTHETIC-TENDER-002',
    'Procurement of Network Security Appliances',
    'National Information Technology Board',
    'Cybersecurity Division',
    'IT Equipment / Network Security',
    'Procurement and deployment of enterprise-grade network security appliances including next-generation firewalls, intrusion detection systems, and centralized security management. [SYNTHETIC DATA — FOR DEMONSTRATION ONLY]',
    'SYNTHETIC',
    'OPEN',
    45000000,
    '2026-09-30 23:59:59+05:30',
    '2026-08-10',
    120,
    'Least Cost Selection (LCS)',
    'New Delhi, India',
    90,
    60,
    900000
),
(
    'SYNTHETIC-TENDER-003',
    'Annual Maintenance Contract for HVAC Systems',
    'Public Works Department',
    'Building Maintenance Division',
    'Maintenance Services / HVAC',
    'Annual maintenance contract for centralized HVAC systems across 5 government office complexes. [SYNTHETIC DATA — FOR DEMONSTRATION ONLY]',
    'SYNTHETIC',
    'CLOSED',
    7500000,
    '2026-08-30 23:59:59+05:30',
    '2026-07-20',
    60,
    'Quality and Cost Based Selection (QCBS)',
    'Mumbai, Maharashtra',
    365,
    12,
    150000
),
(
    'SYNTHETIC-TENDER-004',
    'Supply of Laboratory Chemical Reagents and Glassware',
    'Council of Scientific and Industrial Research',
    'Central Procurement Cell',
    'Laboratory Supplies / Chemicals',
    'Supply of analytical grade chemical reagents, laboratory glassware, and consumables for research laboratories. [SYNTHETIC DATA — FOR DEMONSTRATION ONLY]',
    'SYNTHETIC',
    'OPEN',
    3200000,
    '2026-09-15 23:59:59+05:30',
    '2026-08-15',
    60,
    'Least Cost Selection (LCS)',
    'Pune, Maharashtra',
    45,
    0,
    64000
),
(
    'SYNTHETIC-TENDER-005',
    'Development of Citizen Grievance Portal',
    'Department of Administrative Reforms',
    'e-Governance Division',
    'IT Services / Software Development',
    'Design, development, deployment, and maintenance of a citizen grievance management web portal with mobile application. [SYNTHETIC DATA — FOR DEMONSTRATION ONLY]',
    'SYNTHETIC',
    'OPEN',
    28000000,
    '2026-10-05 23:59:59+05:30',
    '2026-08-18',
    120,
    'Quality and Cost Based Selection (QCBS)',
    'New Delhi, India',
    180,
    24,
    560000
)
ON CONFLICT (tender_number) DO NOTHING;

-- ============================================================
-- SYNTHETIC VENDORS (mirrors existing mock bidders from src/data/bidders.ts)
-- These are the 4 synthetic vendors the prototype demonstrates.
-- user_id is NULL because no auth users exist at this stage.
-- The seed.py script links user_id after creating auth users.
-- ============================================================
INSERT INTO public.vendors (legal_name, display_name, status)
VALUES
    ('ABC Engineering Pvt. Ltd. [SYNTHETIC]',      'ABC Engineering',              'ACTIVE'),
    ('Bharat Industrial Systems Ltd. [SYNTHETIC]', 'Bharat Industrial',            'ACTIVE'),
    ('National Process Equipments Pvt. Ltd. [SYNTHETIC]', 'National Process Equipments', 'ACTIVE'),
    ('Reliable Instruments Pvt. Ltd. [SYNTHETIC]', 'Reliable Instruments',         'ACTIVE')
ON CONFLICT DO NOTHING;
