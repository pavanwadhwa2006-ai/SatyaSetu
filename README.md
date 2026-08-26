# Satyaseetu — AI-Powered Integrated Bid Compliance Verification Platform

## Purpose
Satyaseetu is an AI-assisted procurement compliance and decision-support platform for GeM procurement workflows. It is not a replacement for GeM and does not make the final procurement decision.

## Current Goal
Build a technically realistic, end-to-end internal-hackathon MVP from the existing Satyaseetu prototype.

## Core Workflow
Tender → Requirements → Bidders → Documents → Extracted Evidence → Verification → Rules → Compliance → Review → Report → Audit

## Product Principle
AI assists the Procurement Officer; it does not replace the Procurement Officer.

## Current Phase
Phase 1 — Foundation: database, authentication, backend/API foundation, RBAC, storage foundation, project integration.

## Source of Truth
See `docs/MASTER_ARCHITECTURE.md` and the provided SIH26100 master architecture document.

## Rules
- Do not fabricate live government API integrations.
- Use synthetic bidder data/documents for the prototype.
- Use real/public tender documents where appropriate.
- Keep AI separate from deterministic compliance rules.
- Preserve source evidence and auditability.
- Never hardcode final compliance results.
