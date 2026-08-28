-- ============================================================
-- SatyaSetu — Final Seed Data (GeM Real Tender & Demo Bidders)
-- Run this AFTER schema.sql and rls.sql in Supabase SQL Editor.
--
-- Contains 5 Real GeM Tenders (all OPEN), 4 Demo Vendors,
-- Bid Submissions (4 + 2 + 2 mapping), and Tender Document Metadata.
-- Fully idempotent with ON CONFLICT DO NOTHING and NOT EXISTS guards.
-- ============================================================

-- ============================================================
-- 1. REAL GEM TENDERS (5 Open Tenders)
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
    'GEM/2026/B/7903799',
    'Supply and Installation of Industrial Temperature Monitoring Equipment',
    'Government Procurement Department',
    'Central Instrumentation Division',
    'Industrial Equipment / Monitoring Systems',
    'Supply, installation, testing, and commissioning of industrial-grade temperature monitoring systems across 12 locations. Equipment must comply with IS/IEC standards and include 3-year comprehensive warranty with on-site support.',
    'GEM_PUBLIC',
    'OPEN',
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
    'GEM/2026/B/7878577',
    'Procurement of Network Security Appliances',
    'National Information Technology Board',
    'Cybersecurity Division',
    'IT Equipment / Network Security',
    'Procurement and deployment of enterprise-grade network security appliances including next-generation firewalls, intrusion detection systems, and centralized security management.',
    'GEM_PUBLIC',
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
    'GEM/2026/B/7676747',
    'Annual Maintenance Contract for HVAC Systems',
    'Public Works Department',
    'Building Maintenance Division',
    'Maintenance Services / HVAC',
    'Annual maintenance contract for centralized HVAC systems across 5 government office complexes.',
    'GEM_PUBLIC',
    'OPEN',
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
    'GEM/2026/B/7261466',
    'Supply of Laboratory Chemical Reagents and Glassware',
    'Council of Scientific and Industrial Research',
    'Central Procurement Cell',
    'Laboratory Supplies / Chemicals',
    'Supply of analytical grade chemical reagents, laboratory glassware, and consumables for research laboratories.',
    'GEM_PUBLIC',
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
    'GEM/2026/B/7364888',
    'Development of Citizen Grievance Portal',
    'Department of Administrative Reforms',
    'e-Governance Division',
    'IT Services / Software Development',
    'Design, development, deployment, and maintenance of a citizen grievance management web portal with mobile application.',
    'GEM_PUBLIC',
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
-- 2. DEMO VENDORS (8 Companies Matching Pre-Created Accounts)
-- ============================================================
INSERT INTO public.vendors (legal_name, display_name, status)
VALUES
    ('Apex Creative Solutions Pvt. Ltd.',    'Apex Creative Solutions',    'ACTIVE'),
    ('AstraEdge Technology Pvt. Ltd.',       'AstraEdge Technology',       'ACTIVE'),
    ('CreoVista Digital Services Pvt. Ltd.', 'CreoVista Digital Services', 'ACTIVE'),
    ('InnovaSphere Technologies Pvt. Ltd.',  'InnovaSphere Technologies',  'ACTIVE'),
    ('Nexora Digital Consulting Pvt. Ltd.',  'Nexora Digital Consulting',  'ACTIVE'),
    ('Nova Media Services Pvt. Ltd.',        'Nova Media Services',        'ACTIVE'),
    ('PixelSpring Labs Pvt. Ltd.',           'PixelSpring Labs',           'ACTIVE'),
    ('Vertex Digital Solutions Pvt. Ltd.',   'Vertex Digital Solutions',   'ACTIVE')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. DEMO BID SUBMISSIONS (Exact 4 + 2 + 2 Bidder Mapping)
--   Tender 1 (GEM/2026/B/7903799) -> 4 Bidders (ABC, Bharat, National Process, Reliable)
--   Tender 2 (GEM/2026/B/7878577) -> 2 Bidders (ABC, Bharat)
--   Tender 3 (GEM/2026/B/7676747) -> 2 Bidders (ABC, Bharat)
--   Tender 4 (GEM/2026/B/7261466) -> 0 Bidders
--   Tender 5 (GEM/2026/B/7364888) -> 0 Bidders
-- ============================================================

-- Tender 1 -> 4 Bidders
INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'SUBMITTED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7903799'
  AND (v.display_name = 'ABC Engineering' OR v.legal_name LIKE 'ABC Engineering%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'UNDER_EVALUATION', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7903799'
  AND (v.display_name = 'Bharat Industrial' OR v.legal_name LIKE 'Bharat Industrial%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'SUBMITTED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7903799'
  AND (v.display_name = 'National Process Equipments' OR v.legal_name LIKE 'National Process%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'QUALIFIED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7903799'
  AND (v.display_name = 'Reliable Instruments' OR v.legal_name LIKE 'Reliable Instruments%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

-- Tender 2 -> 2 Bidders
INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'QUALIFIED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7878577'
  AND (v.display_name = 'ABC Engineering' OR v.legal_name LIKE 'ABC Engineering%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'UNDER_EVALUATION', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7878577'
  AND (v.display_name = 'Bharat Industrial' OR v.legal_name LIKE 'Bharat Industrial%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

-- Tender 3 -> 2 Bidders
INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'SUBMITTED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7676747'
  AND (v.display_name = 'ABC Engineering' OR v.legal_name LIKE 'ABC Engineering%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

INSERT INTO public.bid_submissions (tender_id, vendor_id, status, submitted_at)
SELECT t.id, v.id, 'QUALIFIED', NOW()
FROM public.tenders t, public.vendors v
WHERE t.tender_number = 'GEM/2026/B/7676747'
  AND (v.display_name = 'Bharat Industrial' OR v.legal_name LIKE 'Bharat Industrial%')
ON CONFLICT (tender_id, vendor_id) DO NOTHING;

-- ============================================================
-- 4. STORAGE BUCKET BOOTSTRAP
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('vendor-documents', 'vendor-documents', true),
    ('tender-documents', 'tender-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object read/insert policies for bucket bootstrap
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read vendor-documents') THEN
        CREATE POLICY "Public Read vendor-documents" ON storage.objects FOR SELECT USING (bucket_id = 'vendor-documents');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert vendor-documents') THEN
        CREATE POLICY "Public Insert vendor-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vendor-documents');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read tender-documents') THEN
        CREATE POLICY "Public Read tender-documents" ON storage.objects FOR SELECT USING (bucket_id = 'tender-documents');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert tender-documents') THEN
        CREATE POLICY "Public Insert tender-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tender-documents');
    END IF;
END $$;

-- ============================================================
-- 5. REAL GEM TENDER DOCUMENTS METADATA (Exact Tender Number Lookups)
-- ============================================================
INSERT INTO public.tender_documents (tender_id, original_filename, storage_path, mime_type, file_size, processing_status)
SELECT t.id, 'GEM2026B7903799.pdf', 'GEM2026B7903799.pdf', 'application/pdf', 132298, 'PROCESSED'
FROM public.tenders t WHERE t.tender_number = 'GEM/2026/B/7903799'
AND NOT EXISTS (SELECT 1 FROM public.tender_documents WHERE original_filename = 'GEM2026B7903799.pdf');

INSERT INTO public.tender_documents (tender_id, original_filename, storage_path, mime_type, file_size, processing_status)
SELECT t.id, 'GEM2026B7878577.pdf', 'GEM2026B7878577.pdf', 'application/pdf', 119381, 'PROCESSED'
FROM public.tenders t WHERE t.tender_number = 'GEM/2026/B/7878577'
AND NOT EXISTS (SELECT 1 FROM public.tender_documents WHERE original_filename = 'GEM2026B7878577.pdf');

INSERT INTO public.tender_documents (tender_id, original_filename, storage_path, mime_type, file_size, processing_status)
SELECT t.id, 'GEM2026B7676747.pdf', 'GEM2026B7676747.pdf', 'application/pdf', 100261, 'PROCESSED'
FROM public.tenders t WHERE t.tender_number = 'GEM/2026/B/7676747'
AND NOT EXISTS (SELECT 1 FROM public.tender_documents WHERE original_filename = 'GEM2026B7676747.pdf');

INSERT INTO public.tender_documents (tender_id, original_filename, storage_path, mime_type, file_size, processing_status)
SELECT t.id, 'GEM2026B7261466.pdf', 'GEM2026B7261466.pdf', 'application/pdf', 140093, 'PROCESSED'
FROM public.tenders t WHERE t.tender_number = 'GEM/2026/B/7261466'
AND NOT EXISTS (SELECT 1 FROM public.tender_documents WHERE original_filename = 'GEM2026B7261466.pdf');

INSERT INTO public.tender_documents (tender_id, original_filename, storage_path, mime_type, file_size, processing_status)
SELECT t.id, 'GEM2026B7364888.pdf', 'GEM2026B7364888.pdf', 'application/pdf', 121497, 'PROCESSED'
FROM public.tenders t WHERE t.tender_number = 'GEM/2026/B/7364888'
AND NOT EXISTS (SELECT 1 FROM public.tender_documents WHERE original_filename = 'GEM2026B7364888.pdf');
