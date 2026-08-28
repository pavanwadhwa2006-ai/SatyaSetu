-- ============================================================
-- SatyaSetu — Row Level Security (RLS) Policies
-- Run this AFTER schema.sql in Supabase SQL Editor.
--
-- These policies enforce data access at the database layer.
-- The backend uses service_role key (bypasses RLS) for
-- server-side operations. RLS protects direct Supabase
-- client access from the frontend if ever used.
-- ============================================================

-- Enable RLS on all application tables
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_documents  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- user_profiles policies
-- Users can read and update their own profile.
-- Backend service_role can read all profiles (for RBAC checks).
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- tenders policies
-- Tenders are publicly readable (procurement is public-facing).
-- Only PROCUREMENT_OFFICER role can create/update tenders.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view tenders" ON public.tenders;
CREATE POLICY "Anyone can view tenders"
    ON public.tenders
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Officers can create tenders" ON public.tenders;
CREATE POLICY "Officers can create tenders"
    ON public.tenders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

DROP POLICY IF EXISTS "Officers can update tenders" ON public.tenders;
CREATE POLICY "Officers can update tenders"
    ON public.tenders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

-- ============================================================
-- tender_documents policies
-- Anyone can view tender documents.
-- Officers can upload tender documents.
-- ============================================================
DROP POLICY IF EXISTS "Officers can view tender documents" ON public.tender_documents;
DROP POLICY IF EXISTS "Anyone can view tender documents" ON public.tender_documents;
CREATE POLICY "Anyone can view tender documents"
    ON public.tender_documents
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Officers can insert tender documents" ON public.tender_documents;
CREATE POLICY "Officers can insert tender documents"
    ON public.tender_documents
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

-- ============================================================
-- vendors policies
-- Officers can view all vendors.
-- Bidders can view their own vendor profile.
-- Any authenticated user can create a vendor profile (self-registration).
-- ============================================================
DROP POLICY IF EXISTS "Officers can view all vendors" ON public.vendors;
CREATE POLICY "Officers can view all vendors"
    ON public.vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

DROP POLICY IF EXISTS "Bidders can view own vendor profile" ON public.vendors;
CREATE POLICY "Bidders can view own vendor profile"
    ON public.vendors
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create vendor profile" ON public.vendors;
CREATE POLICY "Authenticated users can create vendor profile"
    ON public.vendors
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendors;
CREATE POLICY "Vendors can update own profile"
    ON public.vendors
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================
-- bid_submissions policies
-- Officers can view all bids for any tender.
-- Bidders can only view their own bids.
-- Bidders can create bids (only for themselves).
-- Officers can update bid submissions (AI verification & decisions).
-- ============================================================
DROP POLICY IF EXISTS "Officers can view all bids" ON public.bid_submissions;
CREATE POLICY "Officers can view all bids"
    ON public.bid_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

DROP POLICY IF EXISTS "Bidders can view own bids" ON public.bid_submissions;
CREATE POLICY "Bidders can view own bids"
    ON public.bid_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.vendors
            WHERE id = vendor_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bidders can create own bids" ON public.bid_submissions;
CREATE POLICY "Bidders can create own bids"
    ON public.bid_submissions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendors
            WHERE id = vendor_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Officers can update bid submissions" ON public.bid_submissions;
CREATE POLICY "Officers can update bid submissions"
    ON public.bid_submissions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

-- ============================================================
-- vendor_documents policies
-- Officers can view all vendor documents.
-- Bidders can only view their own documents.
-- Bidders can upload their own documents.
-- Officers can update vendor document processing/verification status.
-- ============================================================
DROP POLICY IF EXISTS "Officers can view all vendor documents" ON public.vendor_documents;
CREATE POLICY "Officers can view all vendor documents"
    ON public.vendor_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );

DROP POLICY IF EXISTS "Bidders can view own vendor documents" ON public.vendor_documents;
CREATE POLICY "Bidders can view own vendor documents"
    ON public.vendor_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.vendors
            WHERE id = vendor_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Bidders can upload own vendor documents" ON public.vendor_documents;
CREATE POLICY "Bidders can upload own vendor documents"
    ON public.vendor_documents
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendors
            WHERE id = vendor_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Officers can update vendor documents" ON public.vendor_documents;
CREATE POLICY "Officers can update vendor documents"
    ON public.vendor_documents
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'PROCUREMENT_OFFICER'
        )
    );
