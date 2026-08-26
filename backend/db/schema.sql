-- ============================================================
-- SatyaSetu — Phase 1 Database Schema
-- Run this in: Supabase → SQL Editor → New Query → Run
--
-- IMPORTANT:
--   This uses Supabase Auth (auth.users) as the identity source.
--   The user_profiles table extends auth.users with app-level data.
--
-- Do NOT run this on a production database with existing data
-- without reviewing the DROP TABLE statements at the top.
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: user_profiles
-- Extends Supabase Auth users with application role and profile.
-- Linked 1:1 to auth.users via id.
-- Role is ALWAYS read from this table by the backend — never
-- trusted from frontend or JWT claims.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('BIDDER', 'PROCUREMENT_OFFICER')),
    full_name   TEXT,
    organization TEXT,
    designation TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS
    'Application-level user profiles. Role is authoritative here — never trust role from JWT or frontend.';

COMMENT ON COLUMN public.user_profiles.role IS
    'BIDDER or PROCUREMENT_OFFICER. Backend always reads from here for RBAC.';

-- ============================================================
-- TABLE: tenders
-- Stores government procurement tender records.
-- Source can be SYNTHETIC (Phase 1), GEM_PUBLIC (Phase 2), etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenders (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_number        TEXT UNIQUE NOT NULL,
    title                TEXT NOT NULL,
    organization         TEXT NOT NULL,
    department           TEXT,
    category             TEXT,
    description          TEXT,
    source               TEXT NOT NULL DEFAULT 'SYNTHETIC',
    status               TEXT NOT NULL DEFAULT 'OPEN'
                            CHECK (status IN ('OPEN', 'EVALUATION', 'CLOSED', 'AWARDED')),
    estimated_value      BIGINT,           -- in paise (smallest unit) or raw INR integer
    submission_deadline  TIMESTAMPTZ,
    publish_date         DATE,
    bid_validity_days    INTEGER,
    evaluation_type      TEXT,
    delivery_location    TEXT,
    delivery_period_days INTEGER,
    warranty_months      INTEGER,
    emd_amount           BIGINT,
    created_by           UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tenders IS
    'Procurement tender records. Phase 1 uses SYNTHETIC source. Phase 2 will add GEM_PUBLIC source.';

COMMENT ON COLUMN public.tenders.estimated_value IS
    'Estimated tender value in INR (integer). Future: store in paise for precision.';

COMMENT ON COLUMN public.tenders.source IS
    'Data origin: SYNTHETIC (Phase 1), GEM_PUBLIC (Phase 2+), MANUAL, etc.';

-- ============================================================
-- TABLE: tender_documents
-- Stores uploaded tender document metadata.
-- Actual files live in Supabase Storage bucket: tender-documents
-- OCR/processing is NOT implemented in Phase 1.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tender_documents (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id         UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    storage_path      TEXT,               -- path within Supabase Storage bucket
    mime_type         TEXT,
    file_size         BIGINT,             -- in bytes
    processing_status TEXT NOT NULL DEFAULT 'UPLOADED'
                        CHECK (processing_status IN ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED')),
    uploaded_by       UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tender_documents IS
    'Uploaded tender document metadata. Files stored in Supabase Storage bucket tender-documents. Processing not yet implemented (Phase 5+).';

COMMENT ON COLUMN public.tender_documents.processing_status IS
    'UPLOADED: file received. PROCESSING: OCR/AI in progress. PROCESSED: complete. FAILED: error. Phase 1 only uses UPLOADED.';

-- ============================================================
-- TABLE: vendors
-- Vendor/company profiles. May or may not have a user account.
-- user_id links to auth user if the vendor has registered.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendors (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    legal_name   TEXT NOT NULL,
    display_name TEXT,
    status       TEXT NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vendors IS
    'Vendor company profiles. user_id is nullable — a vendor may exist before registering an account.';

COMMENT ON COLUMN public.vendors.user_id IS
    'Links to user_profiles if the vendor has a registered user account. Nullable.';

-- ============================================================
-- TABLE: bid_submissions
-- A bid is a vendor''s participation in a tender.
-- One vendor can only submit one bid per tender (UNIQUE constraint).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bid_submissions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id    UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
    vendor_id    UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN (
                        'DRAFT', 'SUBMITTED', 'UNDER_EVALUATION',
                        'QUALIFIED', 'DISQUALIFIED', 'CLARIFICATION_REQUESTED'
                    )),
    submitted_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bid_per_tender_vendor UNIQUE (tender_id, vendor_id)
);

COMMENT ON TABLE public.bid_submissions IS
    'A vendor''s bid for a specific tender. One vendor can submit exactly one bid per tender.';

-- ============================================================
-- TABLE: vendor_documents
-- Stores uploaded bidder document metadata.
-- Actual files live in Supabase Storage bucket: vendor-documents
-- OCR/classification not yet implemented.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendor_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_submission_id   UUID REFERENCES public.bid_submissions(id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    original_filename   TEXT NOT NULL,
    storage_path        TEXT,             -- path within Supabase Storage bucket
    mime_type           TEXT,
    file_size           BIGINT,           -- in bytes
    document_type       TEXT,             -- PAN_CERTIFICATE, GST_CERTIFICATE, etc. (future classification)
    processing_status   TEXT NOT NULL DEFAULT 'UPLOADED'
                          CHECK (processing_status IN ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED')),
    uploaded_by         UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vendor_documents IS
    'Uploaded bidder document metadata. Files in Supabase Storage bucket vendor-documents. document_type classification is Phase 7+.';

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenders_status           ON public.tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_tender_number    ON public.tenders(tender_number);
CREATE INDEX IF NOT EXISTS idx_bid_submissions_tender   ON public.bid_submissions(tender_id);
CREATE INDEX IF NOT EXISTS idx_bid_submissions_vendor   ON public.bid_submissions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_docs_vendor       ON public.vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_docs_bid          ON public.vendor_documents(bid_submission_id);
CREATE INDEX IF NOT EXISTS idx_tender_docs_tender       ON public.tender_documents(tender_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_tenders_updated_at
    BEFORE UPDATE ON public.tenders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_bid_submissions_updated_at
    BEFORE UPDATE ON public.bid_submissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: auto-create user_profile on auth.users INSERT
-- When a user signs up via Supabase Auth, create a profile row.
-- Default role is BIDDER — officers must be manually assigned.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'BIDDER'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
