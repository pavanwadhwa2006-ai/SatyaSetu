/**
 * SatyaSetu — Platform-Wide Dynamic Tender Requirements & AI Bidder Document Guidance
 * Universal Single Source of Truth for Tender Requirements, Bidder Guidance, and AI Verification
 */

export interface DynamicRequirement {
  id: string;
  title: string;
  expectedDocument: string;
  tooltip: string;
  acceptedAliases: string[];
  verificationKeywords: string[];
  description: string;
  mandatory: boolean;
  acceptedFormats: string;
  category?: string;
}

/**
 * Universal Guidance Synthesizer for Any Procurement Requirement
 * Dynamically resolves or synthesizes human-friendly guidance, tooltips, aliases, and AI keywords.
 */
export function synthesizeRequirementGuidance(
  title: string,
  tenderContext?: any
): Omit<DynamicRequirement, "id" | "mandatory" | "acceptedFormats"> {
  const t = title.toLowerCase().trim();

  if (t.includes("experience") || t.includes("work order") || t.includes("past performance")) {
    return {
      title,
      expectedDocument: "Work Order / Completion Certificate (PDF)",
      tooltip: "Upload official contract work orders, service agreements, or completion certificates from Government, PSU, or corporate clients.",
      acceptedAliases: ["Work_Order.pdf", "Completion_Certificate.pdf", "Contract_Agreement.pdf", "Experience_Letter.pdf"],
      verificationKeywords: ["Work Order", "Completion Certificate", "Contract Value", "Client Name", "Scope of Work"],
      description: "Past relevant contract experience and client completion verification.",
    };
  }

  if (t.includes("turnover") || t.includes("financial") || t.includes("balance sheet")) {
    return {
      title,
      expectedDocument: "CA Certified Turnover Certificate (PDF)",
      tooltip: "Upload a Chartered Accountant (CA) certified annual turnover statement with UDIN, covering the last 3 financial years.",
      acceptedAliases: ["CA_Turnover_Certificate.pdf", "Audited_Balance_Sheet.pdf", "Turnover_Statement.pdf"],
      verificationKeywords: ["Chartered Accountant", "UDIN", "Turnover", "Financial Year", "Audited"],
      description: "CA Audited Turnover statement satisfying minimum tender turnover requirement.",
    };
  }

  if (t.includes("affidavit") || t.includes("stamp paper") || t.includes("blacklisted") || t.includes("debarment")) {
    return {
      title,
      expectedDocument: "Notarized Affidavit on Stamp Paper (PDF)",
      tooltip: "Upload a legally sworn and notarized affidavit executed on Rs. 100 Non-Judicial Stamp Paper declaring no debarment/blacklisting or pending court cases.",
      acceptedAliases: ["Notarized_Affidavit.pdf", "Stamp_Paper_Declaration.pdf", "Non_Debarment_Affidavit.pdf"],
      verificationKeywords: ["Affidavit", "Notary Public", "Non-Judicial Stamp Paper", "Rs.100", "No Debarment", "No Legal Proceedings"],
      description: "Notarized affidavit on non-judicial stamp paper declaring legal standing.",
    };
  }

  if (t.includes("liquidation") || t.includes("insolvency") || t.includes("bankrupt") || t.includes("receivership")) {
    return {
      title,
      expectedDocument: "Self Declaration / Solvency Undertaking (PDF)",
      tooltip: "Upload a signed and stamped company declaration on letterhead confirming the bidder is financially sound and not undergoing bankruptcy or liquidation proceedings.",
      acceptedAliases: ["Undertaking_Liquidation.pdf", "Self_Declaration.pdf", "Solvency_Undertaking.pdf"],
      verificationKeywords: ["not under liquidation", "court receivership", "bankruptcy", "Insolvency", "Solvent", "Self Declaration"],
      description: "Official declaration confirming the firm is not facing bankruptcy or liquidation.",
    };
  }

  if (t.includes("atc") || t.includes("additional doc") || t.includes("buyer requested") || t.includes("certificate (requested")) {
    return {
      title,
      expectedDocument: "Buyer Requested Technical Certificate (PDF)",
      tooltip: "Upload specific buyer compliance certifications, ISO certificates, or manufacturer authorizations requested in the Additional Terms & Conditions (ATC).",
      acceptedAliases: ["ATC_Compliance_Certificate.pdf", "ISO_Certificate.pdf", "OEM_Authorization.pdf", "Technical_Compliance.pdf"],
      verificationKeywords: ["ATC Terms", "Technical Compliance", "Certificate", "Specification", "Authorization"],
      description: "Specific buyer certifications or compliance documents requested in ATC.",
    };
  }

  if (t.includes("registration") || t.includes("udyam") || t.includes("msme") || t.includes("incorporation") || t.includes("coi")) {
    return {
      title,
      expectedDocument: "Udyam Certificate / Certificate of Incorporation (PDF)",
      tooltip: "Upload the official MSME Udyam Registration Certificate or Registrar of Companies (RoC) Certificate of Incorporation.",
      acceptedAliases: ["Udyam_Registration.pdf", "Incorporation_Certificate.pdf", "MSME_Certificate.pdf", "Company_Registration.pdf"],
      verificationKeywords: ["UDYAM", "Certificate of Incorporation", "Ministry of MSME", "CIN", "Registrar of Companies"],
      description: "Official statutory company registration certificate.",
    };
  }

  if (t.includes("gst") || t.includes("gstin")) {
    return {
      title,
      expectedDocument: "Active GST Registration Certificate (PDF)",
      tooltip: "Upload official Form GST REG-06 Certificate showing active GSTIN and principal place of business.",
      acceptedAliases: ["GST_Certificate.pdf", "GST_REG_06.pdf", "GSTIN_Proof.pdf"],
      verificationKeywords: ["Form GST REG-06", "GSTIN", "Goods and Services Tax", "Principal Place of Business"],
      description: "Valid GST Registration Certificate (Form GST REG-06).",
    };
  }

  if (t.includes("pan") || t.includes("permanent account")) {
    return {
      title,
      expectedDocument: "Company PAN Card (PDF)",
      tooltip: "Upload clear copy of the 10-digit Permanent Account Number (PAN) card issued by the Income Tax Department.",
      acceptedAliases: ["PAN_Card.pdf", "Company_PAN.pdf"],
      verificationKeywords: ["Income Tax Department", "Permanent Account Number", "PAN"],
      description: "Valid company Permanent Account Number (PAN) Card.",
    };
  }

  // Universal Default Synthesizer for arbitrary custom requirements
  return {
    title,
    expectedDocument: `Certified ${title} (PDF)`,
    tooltip: `Upload an official certified copy of ${title} as mandated by the tender terms and conditions.`,
    acceptedAliases: [`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, "Compliance_Document.pdf", "Certificate.pdf"],
    verificationKeywords: [title, "Certified", "Compliance", "Declaration"],
    description: `Official certified copy of ${title} satisfying tender criteria.`,
  };
}

/**
 * Returns dynamic, bidder-friendly requirement models for any tender.
 * Automatically checks Gemini extracted requirements, document guidance metadata, and eligibility conditions.
 */
export function getDynamicTenderRequirements(tender: any): DynamicRequirement[] {
  if (!tender) return [];

  const extracted = tender.extractedRequirements || tender.extracted_requirements || {};
  const docList: any[] = extracted.required_documents || [];
  const storedGuidance: any[] = extracted.document_guidance || [];
  const eligibility: string[] = extracted.eligibility_conditions || [];

  const requirements: DynamicRequirement[] = [];

  // 1. Process explicit required_documents list
  if (docList && docList.length > 0) {
    docList.forEach((item, index) => {
      const docTitle = typeof item === "string" ? item : item.title || item.name || `Requirement ${index + 1}`;
      const slug = docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const id = `req_${index + 1}_${slug}`.slice(0, 32);

      // Check if precomputed guidance exists in stored guidance
      const precomputed = storedGuidance.find(
        (g: any) =>
          g.requirement?.toLowerCase() === docTitle.toLowerCase() ||
          g.title?.toLowerCase() === docTitle.toLowerCase()
      );

      const synthesized = synthesizeRequirementGuidance(docTitle, tender);

      requirements.push({
        id,
        title: docTitle,
        expectedDocument: precomputed?.expected_document || synthesized.expectedDocument,
        tooltip: precomputed?.tooltip || synthesized.tooltip,
        acceptedAliases: precomputed?.accepted_aliases || synthesized.acceptedAliases,
        verificationKeywords: precomputed?.verification_keywords || synthesized.verificationKeywords,
        description: precomputed?.description || synthesized.description,
        mandatory: typeof item === "object" && item.mandatory !== undefined ? item.mandatory : true,
        acceptedFormats: "PDF",
      });
    });
  }

  // 2. Check eligibility conditions for mandatory statutory declarations (Affidavit, Undertaking, etc.)
  if (eligibility && eligibility.length > 0) {
    eligibility.forEach((cond) => {
      const condLower = cond.toLowerCase();
      if (
        (condLower.includes("affidavit") || condLower.includes("stamp paper") || condLower.includes("blacklisted")) &&
        !requirements.some((r) => r.title.toLowerCase().includes("affidavit") || r.title.toLowerCase().includes("stamp"))
      ) {
        const synth = synthesizeRequirementGuidance("Affidavit on Non-Judicial Stamp Paper", tender);
        requirements.push({
          id: `req_affidavit_stamp_paper`,
          title: "Affidavit on Non-Judicial Stamp Paper",
          expectedDocument: synth.expectedDocument,
          tooltip: synth.tooltip,
          acceptedAliases: synth.acceptedAliases,
          verificationKeywords: synth.verificationKeywords,
          description: synth.description,
          mandatory: true,
          acceptedFormats: "PDF",
        });
      }
      if (
        (condLower.includes("liquidation") || condLower.includes("insolvency") || condLower.includes("bankrupt") || condLower.includes("receivership")) &&
        !requirements.some((r) => r.title.toLowerCase().includes("liquidation") || r.title.toLowerCase().includes("insolvency"))
      ) {
        const synth = synthesizeRequirementGuidance("Undertaking of not being under liquidation", tender);
        requirements.push({
          id: `req_undertaking_liquidation`,
          title: "Undertaking of not being under liquidation",
          expectedDocument: synth.expectedDocument,
          tooltip: synth.tooltip,
          acceptedAliases: synth.acceptedAliases,
          verificationKeywords: synth.verificationKeywords,
          description: synth.description,
          mandatory: true,
          acceptedFormats: "PDF",
        });
      }
    });
  }

  // 3. Fallback to default tender requirements if tender has no extracted requirements
  if (requirements.length === 0) {
    if (tender.requirements && tender.requirements.length > 0) {
      return tender.requirements.map((r: any, idx: number) => {
        const rTitle = r.name || r.title || `Requirement ${idx + 1}`;
        const synth = synthesizeRequirementGuidance(rTitle, tender);
        return {
          id: r.id || `req_${idx + 1}`,
          title: rTitle,
          expectedDocument: synth.expectedDocument,
          tooltip: synth.tooltip,
          acceptedAliases: synth.acceptedAliases,
          verificationKeywords: synth.verificationKeywords,
          description: r.description || synth.description,
          mandatory: r.isMandatory !== false,
          acceptedFormats: "PDF",
        };
      });
    }

    const standardSet = [
      "Experience Criteria",
      "Bidder Turnover",
      "Company Registration / Udyam",
      "Certificate (Requested in ATC)",
      "Affidavit on Non-Judicial Stamp Paper",
    ];

    return standardSet.map((t, idx) => {
      const synth = synthesizeRequirementGuidance(t, tender);
      return {
        id: `req_${idx + 1}`,
        title: t,
        expectedDocument: synth.expectedDocument,
        tooltip: synth.tooltip,
        acceptedAliases: synth.acceptedAliases,
        verificationKeywords: synth.verificationKeywords,
        description: synth.description,
        mandatory: true,
        acceptedFormats: "PDF",
      };
    });
  }

  return requirements;
}
