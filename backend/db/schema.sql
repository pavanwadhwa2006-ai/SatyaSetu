-- ============================================================
-- SatyaSetu — Final Database Schema (Officer → AI → Bidder Flow)
-- One-time setup only.
-- Future operations happen through backend APIs, not manual SQL.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    role TEXT NOT NULL CHECK (
        role IN ('BIDDER','PROCUREMENT_OFFICER')
    ),

    full_name TEXT,
    organization TEXT,
    designation TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS
'Application user profile extending Supabase Auth.';

-- ============================================================
-- TENDERS
-- Officers publish tenders.
-- Gemini extracts requirements.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenders (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tender_number TEXT UNIQUE NOT NULL,

    title TEXT NOT NULL,

    organization TEXT NOT NULL,

    department TEXT,

    category TEXT,

    description TEXT,

    source TEXT DEFAULT 'MANUAL',

    status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (
        status IN (
            'DRAFT',
            'OPEN',
            'EVALUATION',
            'CLOSED',
            'AWARDED'
        )
    ),

    estimated_value BIGINT,

    submission_deadline TIMESTAMPTZ,

    publish_date DATE,

    bid_validity_days INTEGER,

    evaluation_type TEXT,

    delivery_location TEXT,

    delivery_period_days INTEGER,

    warranty_months INTEGER,

    emd_amount BIGINT,

    extracted_requirements JSONB,

    extraction_status TEXT DEFAULT 'PENDING'
    CHECK (
        extraction_status IN (
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'FAILED'
        )
    ),

    extracted_at TIMESTAMPTZ,

    created_by UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    published_by UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tenders IS
'Officer-published tenders with AI extracted requirements.';

-- ============================================================
-- TENDER DOCUMENTS
-- Metadata only.
-- Files live in Storage bucket: tender-documents
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tender_documents (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tender_id UUID NOT NULL REFERENCES public.tenders(id)
        ON DELETE CASCADE,

    original_filename TEXT NOT NULL,

    storage_path TEXT,

    mime_type TEXT,

    file_size BIGINT,

    processing_status TEXT DEFAULT 'UPLOADED'
    CHECK (
        processing_status IN (
            'UPLOADED',
            'PROCESSING',
            'PROCESSED',
            'FAILED'
        )
    ),

    uploaded_by UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tender_documents IS
'Tender PDF metadata. Actual files are stored in Supabase Storage.';

-- ============================================================
-- VENDORS
-- Company profile.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vendors (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    legal_name TEXT NOT NULL,

    display_name TEXT,

    status TEXT DEFAULT 'ACTIVE'
    CHECK (
        status IN (
            'ACTIVE',
            'INACTIVE',
            'SUSPENDED'
        )
    ),

    is_primary_contact BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.vendors IS
'Vendor company profiles.';

-- ============================================================
-- BID SUBMISSIONS
-- Created automatically when bidder submits.
-- AI writes verification here.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bid_submissions (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tender_id UUID NOT NULL REFERENCES public.tenders(id)
        ON DELETE CASCADE,

    vendor_id UUID NOT NULL REFERENCES public.vendors(id)
        ON DELETE CASCADE,

    status TEXT DEFAULT 'DRAFT'
    CHECK (
        status IN (
            'DRAFT',
            'SUBMITTED',
            'UNDER_EVALUATION',
            'QUALIFIED',
            'DISQUALIFIED',
            'CLARIFICATION_REQUESTED'
        )
    ),

    ai_verification_status TEXT DEFAULT 'PENDING'
    CHECK (
        ai_verification_status IN (
            'PENDING',
            'PROCESSING',
            'VERIFIED',
            'NEEDS_REVIEW'
        )
    ),

    ai_score NUMERIC(5,2),

    ai_summary TEXT,

    verification_results JSONB,

    verified_at TIMESTAMPTZ,

    verified_by UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    submitted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_bid_per_tender_vendor
        UNIQUE(tender_id,vendor_id)
);

COMMENT ON TABLE public.bid_submissions IS
'One vendor may submit exactly one bid per tender.';

-- ============================================================
-- VENDOR DOCUMENTS
-- Uploaded bidder PDFs.
-- OCR stores extracted data here.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vendor_documents (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    bid_submission_id UUID REFERENCES public.bid_submissions(id)
        ON DELETE CASCADE,

    vendor_id UUID NOT NULL REFERENCES public.vendors(id)
        ON DELETE CASCADE,

    original_filename TEXT NOT NULL,

    storage_path TEXT,

    mime_type TEXT,

    file_size BIGINT,

    document_type TEXT,

    extracted_data JSONB,

    processing_status TEXT DEFAULT 'UPLOADED'
    CHECK (
        processing_status IN (
            'UPLOADED',
            'PROCESSING',
            'PROCESSED',
            'FAILED'
        )
    ),

    verification_status TEXT DEFAULT 'PENDING'
    CHECK (
        verification_status IN (
            'PENDING',
            'MATCHED',
            'MISSING',
            'REVIEW'
        )
    ),

    verified_at TIMESTAMPTZ,

    uploaded_by UUID REFERENCES public.user_profiles(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.vendor_documents IS
'Uploaded bidder documents with Gemini OCR extraction.';

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tenders_status
ON public.tenders(status);

CREATE INDEX IF NOT EXISTS idx_tenders_number
ON public.tenders(tender_number);

CREATE INDEX IF NOT EXISTS idx_tenders_extraction_status
ON public.tenders(extraction_status);

CREATE INDEX IF NOT EXISTS idx_bid_tender
ON public.bid_submissions(tender_id);

CREATE INDEX IF NOT EXISTS idx_bid_vendor
ON public.bid_submissions(vendor_id);

CREATE INDEX IF NOT EXISTS idx_bid_ai_status
ON public.bid_submissions(ai_verification_status);

CREATE INDEX IF NOT EXISTS idx_vendor_docs_vendor
ON public.vendor_documents(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_docs_bid
ON public.vendor_documents(bid_submission_id);

CREATE INDEX IF NOT EXISTS idx_vendor_docs_processing
ON public.vendor_documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_tender_docs_tender
ON public.tender_documents(tender_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at=NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tenders_updated_at ON public.tenders;
CREATE TRIGGER trg_tenders_updated_at
BEFORE UPDATE ON public.tenders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_vendors_updated_at ON public.vendors;
CREATE TRIGGER trg_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_bid_updated_at ON public.bid_submissions;
CREATE TRIGGER trg_bid_updated_at
BEFORE UPDATE ON public.bid_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AUTO CREATE USER PROFILE
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN

    INSERT INTO public.user_profiles(
        id,
        role,
        full_name
    )
    VALUES(
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'role',
            'BIDDER'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.email
        )
    )
    ON CONFLICT(id) DO NOTHING;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
