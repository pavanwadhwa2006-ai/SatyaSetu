-- ============================================================
-- SatyaSetu — Phase 2 Seed Data (Actual Tender Dataset)
-- Run this AFTER schema.sql in Supabase SQL Editor.
--
-- Contains the 5 actual GeM tenders for the SatyaSetu project:
-- 1. GEM/2026/B/7261466 — Engineering software (ETABS / SAFE / SAP2000)
-- 2. GEM/2026/B/7364888 — Manufacturing / chair components
-- 3. GEM/2026/B/7676747 — Electrical / maintenance services
-- 4. GEM/2026/B/7878577 — IT project services / QCBS
-- 5. GEM/2026/B/7903799 — Manpower / multimedia services
--
-- This script is idempotent: running it multiple times will not
-- produce duplicate records. It safely replaces legacy placeholder
-- synthetic tenders.
-- ============================================================

-- Clean up any legacy Phase 1 placeholder synthetic tenders
DELETE FROM public.tenders WHERE tender_number LIKE 'SYNTHETIC-TENDER-%';

-- ============================================================
-- ACTUAL GEM TENDERS (5 TARGET TENDERS)
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
    'GEM/2026/B/7261466',
    'Procurement of Structural Engineering Software (ETABS, SAFE, SAP2000)',
    'Central Public Works Department',
    'Structural Engineering & Design Division',
    'Engineering Software / Structural Analysis Software',
    'Supply, installation, licensing, and 1-year comprehensive technical support for structural engineering and analysis software suite (ETABS, SAFE, and SAP2000) for civil and structural infrastructure design.',
    'GEM_PUBLIC',
    'OPEN',
    2450000,
    '2026-09-25 15:00:00+05:30',
    '2026-08-10',
    90,
    'Quality and Cost Based Selection (QCBS)',
    'New Delhi, India',
    30,
    12,
    49000
),
(
    'GEM/2026/B/7364888',
    'Supply and Delivery of Manufacturing / Ergonomic Chair Components',
    'Department of Heavy Industry',
    'Central Furniture & Manufacturing Division',
    'Manufacturing / Office Furniture & Components',
    'Supply, quality testing, and delivery of standardized ergonomic chair components, modular assemblies, heavy-duty gas lifts, and nylon bases for central production facilities.',
    'GEM_PUBLIC',
    'OPEN',
    3800000,
    '2026-09-28 17:00:00+05:30',
    '2026-08-12',
    90,
    'Least Cost Selection (LCS)',
    'Chennai, Tamil Nadu',
    45,
    24,
    76000
),
(
    'GEM/2026/B/7676747',
    'Comprehensive Electrical Infrastructure Maintenance and Operation Services',
    'Public Works Department',
    'Electrical & Mechanical Maintenance Wing',
    'Electrical Services / Facility Maintenance',
    'Comprehensive annual operations, preventive testing, transformer maintenance, and breakdown electrical services for institutional substation and electrical distribution network.',
    'GEM_PUBLIC',
    'OPEN',
    5200000,
    '2026-10-05 16:00:00+05:30',
    '2026-08-15',
    90,
    'Least Cost Selection (LCS)',
    'Mumbai, Maharashtra',
    365,
    12,
    104000
),
(
    'GEM/2026/B/7878577',
    'IT Project Implementation and System Integration Services',
    'National Informatics Centre',
    'e-Governance Project Implementation Division',
    'IT Services / System Integration',
    'Turnkey IT project services including systems architecture, software application development, cloud infrastructure deployment, data migration, and SLA-backed support under QCBS framework.',
    'GEM_PUBLIC',
    'OPEN',
    18500000,
    '2026-10-15 18:00:00+05:30',
    '2026-08-18',
    120,
    'Quality and Cost Based Selection (QCBS)',
    'New Delhi, India',
    180,
    24,
    370000
),
(
    'GEM/2026/B/7903799',
    'Engagement of Specialized Multimedia Production and Technical Manpower Services',
    'Ministry of Information and Broadcasting',
    'Media & Communication Services Wing',
    'Manpower Services / Multimedia & Audio-Visual Services',
    'Provision of creative multimedia production, audio-video post-production, digital campaign design, and certified technical manpower staffing for media outreach operations.',
    'GEM_PUBLIC',
    'OPEN',
    9500000,
    '2026-10-10 15:00:00+05:30',
    '2026-08-20',
    90,
    'Quality and Cost Based Selection (QCBS)',
    'New Delhi / Regional Centers',
    365,
    0,
    190000
)
ON CONFLICT (tender_number) DO UPDATE SET
    title = EXCLUDED.title,
    organization = EXCLUDED.organization,
    department = EXCLUDED.department,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    source = EXCLUDED.source,
    status = EXCLUDED.status,
    estimated_value = EXCLUDED.estimated_value,
    submission_deadline = EXCLUDED.submission_deadline,
    publish_date = EXCLUDED.publish_date,
    bid_validity_days = EXCLUDED.bid_validity_days,
    evaluation_type = EXCLUDED.evaluation_type,
    delivery_location = EXCLUDED.delivery_location,
    delivery_period_days = EXCLUDED.delivery_period_days,
    warranty_months = EXCLUDED.warranty_months,
    emd_amount = EXCLUDED.emd_amount,
    updated_at = NOW();

-- ============================================================
-- TENDER DOCUMENTS (ASSOCIATED METADATA)
-- Associates each actual tender with its primary tender document record
-- ============================================================
INSERT INTO public.tender_documents (
    tender_id, original_filename, storage_path, mime_type, file_size, processing_status
)
SELECT
    t.id,
    'GeM-Bidding-' || REPLACE(REPLACE(t.tender_number, '/', '-'), 'GEM-', '') || '.pdf',
    'tenders/' || REPLACE(t.tender_number, '/', '_') || '/bid_document.pdf',
    'application/pdf',
    524288,
    'UPLOADED'
FROM public.tenders t
WHERE t.tender_number IN (
    'GEM/2026/B/7261466',
    'GEM/2026/B/7364888',
    'GEM/2026/B/7676747',
    'GEM/2026/B/7878577',
    'GEM/2026/B/7903799'
)
AND NOT EXISTS (
    SELECT 1 FROM public.tender_documents td WHERE td.tender_id = t.id
);

-- ============================================================
-- SYNTHETIC VENDORS (PRESERVED FROM PHASE 1)
-- ============================================================
INSERT INTO public.vendors (legal_name, display_name, status)
VALUES
    ('ABC Engineering Pvt. Ltd. [SYNTHETIC]',      'ABC Engineering',              'ACTIVE'),
    ('Bharat Industrial Systems Ltd. [SYNTHETIC]', 'Bharat Industrial',            'ACTIVE'),
    ('National Process Equipments Pvt. Ltd. [SYNTHETIC]', 'National Process Equipments', 'ACTIVE'),
    ('Reliable Instruments Pvt. Ltd. [SYNTHETIC]', 'Reliable Instruments',         'ACTIVE')
ON CONFLICT DO NOTHING;
