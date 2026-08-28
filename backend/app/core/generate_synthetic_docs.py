"""
SatyaSetu — Synthetic Bidder Document Generator (Phase 4)
Generates 29 realistic, professional, synthetic procurement submission PDFs
across 5 bidder packages and 3 tenders based strictly on Phase 3 Ground Truth.

Output directory: data/synthetic/
"""

import os
import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Base output path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
OUTPUT_ROOT = os.path.join(PROJECT_ROOT, "data", "synthetic")

WATERMARK_TEXT = "SYNTHETIC DATA — FOR HACKATHON DEMONSTRATION ONLY"


class NumberedCanvas(canvas.Canvas):
    """Canvas that adds official header, footer, page number, and synthetic watermark."""

    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()

        # Top Watermark Banner
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#7f1d1d"))
        self.setStrokeColor(colors.HexColor("#fca5a5"))
        self.setFillColorRGB(0.99, 0.95, 0.95)
        self.rect(36, A4[1] - 28, A4[0] - 72, 16, fill=True, stroke=True)
        self.setFillColor(colors.HexColor("#991b1b"))
        self.drawCentredString(A4[0] / 2.0, A4[1] - 22, f"*** {WATERMARK_TEXT} ***")

        # Bottom Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, A4[0] - 36, 32)
        self.drawString(36, 20, "SatyaSetu Procurement Verification Platform — Synthetic Dataset Layer")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 36, 20, page_str)

        # Diagonal Background Watermark
        self.setFont("Helvetica-Bold", 42)
        self.setFillColor(colors.Color(0.85, 0.85, 0.85, alpha=0.18))
        self.translate(A4[0] / 2.0, A4[1] / 2.0)
        self.rotate(45)
        self.drawCentredString(0, 0, "SYNTHETIC DEMO ONLY")

        self.restoreState()


def get_custom_styles():
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,  # Center
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1e3a5f"),
        alignment=1,
        spaceAfter=12,
    )

    header_org = ParagraphStyle(
        "HeaderOrg",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1e3a5f"),
        alignment=1,
    )

    header_sub = ParagraphStyle(
        "HeaderSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=8,
    )

    body_bold = ParagraphStyle(
        "DocBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    notice_box = ParagraphStyle(
        "NoticeBox",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "header_org": header_org,
        "header_sub": header_sub,
        "body": body_style,
        "body_bold": body_bold,
        "th": table_header,
        "td": table_cell,
        "td_bold": table_cell_bold,
        "notice": notice_box,
    }


def create_pdf(filepath, elements):
    """Build PDF document using standard A4 margins and NumberedCanvas."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44,
    )
    doc.build(elements, canvasmaker=NumberedCanvas)


# ============================================================
# 1. T1-B2: NEXUS INFOTECH & TRADING PVT LTD (Tender 1)
# ============================================================

def generate_nexus_docs(out_dir, s):
    docs_metadata = []

    # Doc 1: CA Turnover Certificate (₹3.80L avg)
    fn = "Nexus_CA_Turnover_Cert.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("SHARMA & AGRAWAL CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("F-4, MI Road, Jaipur - 302001 • ICAI Reg: 014522C • Email: info@sharmaagrawalca.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("TO WHOMSOEVER IT MAY CONCERN", s["subtitle"]),
        Paragraph("ANNUAL TURNOVER & NET WORTH CERTIFICATE", s["title"]),
        Paragraph("Ref: SA/CERT/2026/088 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 28th July 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("This is to certify that we have examined the audited books of accounts, balance sheets, and financial statements of <b>M/s Nexus Infotech & Trading Private Limited</b> (CIN: U72900RJ2021PTC074521, PAN: AABCN1234F) having its registered office at B-12, Malviya Industrial Area, Jaipur, Rajasthan 302017.", s["body"]),
        Paragraph("Based on our verification, the annual audited financial turnover of the company for the last three consecutive financial years is as follows:", s["body"]),
        Spacer(1, 4),
        Table(
            [
                [Paragraph("Financial Year", s["th"]), Paragraph("Annual Turnover (INR)", s["th"]), Paragraph("Audited Status", s["th"])],
                [Paragraph("FY 2023-2024", s["td"]), Paragraph("₹ 3,50,000.00", s["td_bold"]), Paragraph("Audited & Tax Return Filed", s["td"])],
                [Paragraph("FY 2024-2025", s["td"]), Paragraph("₹ 3,90,000.00", s["td_bold"]), Paragraph("Audited & Tax Return Filed", s["td"])],
                [Paragraph("FY 2025-2026", s["td"]), Paragraph("₹ 4,00,000.00", s["td_bold"]), Paragraph("Audited & Tax Return Filed", s["td"])],
                [Paragraph("<b>Three-Year Average</b>", s["th"]), Paragraph("<b>₹ 3,80,000.00 (Three Lakh Eighty Thousand Only)</b>", s["th"]), Paragraph("<b>Average Turnover</b>", s["th"])],
            ],
            colWidths=[140, 220, 160],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 10),
        Paragraph("Certified that the average annual turnover of Nexus Infotech & Trading Pvt Ltd for the past three financial years is INR 3,80,000/-", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("For <b>Sharma & Agrawal</b><br/>Chartered Accountants (FRN: 014522C)<br/><br/><b>CA Alok Sharma</b><br/>Partner (M. No. 412890)<br/>UDIN: 26412890AAAAAX9912", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-CA-TURNOVER", "file": fn, "pages": 1})

    # Doc 2: OEM CSI Turnover Statement (₹38.00L)
    fn = "OEM_CSI_Turnover_Statement.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("COMPUTERS AND STRUCTURES INC. (CSI) INDIA DISTRIBUTOR", s["header_org"]),
        Paragraph("Regional Channel Support Desk • New Delhi • Email: support@csi-india-channel.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("OEM REGIONAL ANNUAL TURNOVER STATEMENT", s["title"]),
        Paragraph("Ref: CSI/IND/FIN/2026-44 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 15th June 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("To Procurement Authorities / GeM Tender Evaluation Committees,", s["body"]),
        Paragraph("This statement confirms the Indian regional territory distribution turnover for CSI software product licensing (ETABS, SAFE, SAP2000).", s["body"]),
        Table(
            [
                [Paragraph("Reporting Period", s["th"]), Paragraph("Regional Segment Turnover (INR)", s["th"])],
                [Paragraph("FY 2023 - 2026 (Annual Average)", s["td"]), Paragraph("₹ 38,00,000.00 (Thirty-Eight Lakhs INR)", s["td_bold"])],
            ],
            colWidths=[200, 320],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("OEM Indian regional distributor operations turnover reported at INR 38,00,000 for audited period.", s["body"]),
        Spacer(1, 20),
        Paragraph("Authorized Signatory<br/>CSI Regional Distributor Operations", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-OEM-TURNOVER", "file": fn, "pages": 1})

    # Doc 3: Expired Generic MAF
    fn = "Nexus_Reseller_MAF_Generic.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("CSI SOFTWARE REGIONAL DISTRIBUTION NETWORK", s["header_org"]),
        Paragraph("Channel Partner Management • New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("CERTIFICATE OF CHANNEL PARTNERSHIP", s["title"]),
        Paragraph("Certificate Ref: CSI/CP/2024-0512 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date of Issue: 10th May 2024", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("This is to certify that <b>M/s Nexus Infotech & Trading Private Limited</b>, Jaipur, is appointed as a non-exclusive Channel Partner for marketing and reselling standard educational/commercial licenses of CSI products.", s["body"]),
        Spacer(1, 6),
        Table(
            [
                [Paragraph("Authorization Scope", s["th"]), Paragraph("General Non-Exclusive Commercial Reseller", s["td"])],
                [Paragraph("Tender Specific Reference", s["th"]), Paragraph("None (General Reseller Agreement)", s["td"])],
                [Paragraph("Effective Date", s["th"]), Paragraph("10th May 2024", s["td"])],
                [Paragraph("Validity Expiration Date", s["th"]), Paragraph("<b>09th May 2025 (One Year Validity)</b>", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 10),
        Paragraph("Authorized Channel Partner certificate issued on 10 May 2024, valid for one year (valid until 09-May-2025). General reseller authorization.", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("Channel Manager<br/>CSI Partner Network", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-MAF", "file": fn, "pages": 1})

    # Doc 4: Past Order from Horizon Techworks (Private client, ₹2.40L)
    fn = "PO_Horizon_Techworks.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("HORIZON TECHWORKS PRIVATE LIMITED", s["header_org"]),
        Paragraph("CIN: U74999RJ2022PTC082111 • Plot 18, Mansarovar, Jaipur 302020", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PURCHASE ORDER", s["title"]),
        Paragraph("PO Number: HT-2025-88 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 20th November 2025", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("To: <b>M/s Nexus Infotech & Trading Private Limited</b>, B-12, Malviya Ind. Area, Jaipur.", s["body"]),
        Paragraph("We are pleased to place this purchase order for the following software licenses:", s["body"]),
        Table(
            [
                [Paragraph("Item Description", s["th"]), Paragraph("Qty", s["th"]), Paragraph("Unit Price (INR)", s["th"]), Paragraph("Total Amount (INR)", s["th"])],
                [Paragraph("ETABS Standalone Software License Subscription", s["td"]), Paragraph("1", s["td"]), Paragraph("₹ 2,40,000.00", s["td"]), Paragraph("₹ 2,40,000.00", s["td_bold"])],
                [Paragraph("<b>Total Value</b>", s["th"]), Paragraph("1", s["th"]), Paragraph("-", s["th"]), Paragraph("<b>₹ 2,40,000.00</b>", s["th"])],
            ],
            colWidths=[240, 50, 110, 120],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Client: Horizon Techworks Private Limited, CIN U74999RJ2022PTC082111, Registered at Mansarovar, Jaipur (Private entity)", s["body"]),
        Paragraph("Purchase Order No. HT-2025-88 dated 20-Nov-2025 for ETABS software licenses, total amount INR 2,40,000/-", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("For Horizon Techworks Pvt Ltd<br/>Authorized Purchase Signatory", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-EXP-PO", "file": fn, "pages": 1})

    # Doc 5: Udyam Registration (Trader)
    fn = "Nexus_Udyam_Registration.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("UDYAM REGISTRATION CERTIFICATE (SYNTHETIC REPLICA)", s["header_org"]),
        Paragraph("Ministry of Micro, Small and Medium Enterprises", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("UDYAM REGISTRATION ACKNOWLEDGEMENT", s["title"]),
        Paragraph("Udyam Reg. No: UDYAM-RJ-14-0012345", s["subtitle"]),
        Table(
            [
                [Paragraph("Name of Enterprise", s["th"]), Paragraph("M/S NEXUS INFOTECH & TRADING PRIVATE LIMITED", s["td_bold"])],
                [Paragraph("Enterprise Type", s["th"]), Paragraph("MICRO ENTERPRISE", s["td_bold"])],
                [Paragraph("Major Activity", s["th"]), Paragraph("<b>TRADING / SERVICES (NON-MANUFACTURING)</b>", s["td_bold"])],
                [Paragraph("National Industry Code (NIC)", s["th"]), Paragraph("47411 - Retail sale of computers and standard software in specialized stores", s["td"])],
                [Paragraph("Address", s["th"]), Paragraph("B-12, Malviya Industrial Area, Jaipur, Rajasthan 302017", s["td"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 10),
        Paragraph("Enterprise Classification: Micro. Major Activity: Trading/Services. EMD claim under MSE exemption.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-UDYAM-MSE", "file": fn, "pages": 1})

    # Doc 6: MII Self-Declaration
    fn = "Nexus_MII_SelfDeclaration.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("NEXUS INFOTECH & TRADING PRIVATE LIMITED", s["header_org"]),
        Paragraph("B-12, Malviya Industrial Area, Jaipur, Rajasthan 302017 • Email: tenders@nexusinfotech.co.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("MAKE IN INDIA (MII) SELF-DECLARATION", s["title"]),
        Paragraph("Date: 15th August 2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Tender Ref: GEM/2026/B/7261466", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("To,<br/>The Director, MNIT Jaipur,<br/>JLN Marg, Jaipur, Rajasthan 302017", s["body"]),
        Spacer(1, 6),
        Paragraph("Subject: Self-Declaration under Public Procurement (Preference to Make in India) Order", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("Dear Sir,<br/><br/>We hereby declare that software offered possesses local value addition in accordance with MII guidelines. We confirm our compliance as a local reseller.", s["body"]),
        Paragraph("Note: This is a self-certification on company letterhead. Formal OEM cost auditor breakdown is not attached.", s["body"]),
        Spacer(1, 20),
        Paragraph("For Nexus Infotech & Trading Pvt Ltd<br/><br/>Rajesh Sharma<br/>Director", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-MII-DECLARATION", "file": fn, "pages": 1})

    # Doc 7: Technical Proposal & Delivery Mode
    fn = "Nexus_Technical_Delivery_Proposal.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("NEXUS INFOTECH & TRADING PRIVATE LIMITED", s["header_org"]),
        Paragraph("B-12, Malviya Industrial Area, Jaipur • Support: support@nexusinfotech.co.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("TECHNICAL PROPOSAL & SERVICE SUPPORT UNDERTAKING", s["title"]),
        Paragraph("Tender: GEM/2026/B/7261466 (Structural Software Suite)", s["subtitle"]),
        Spacer(1, 6),
        Paragraph("<b>1. Deployment & Delivery Mode:</b>", s["body_bold"]),
        Paragraph("Software shall be provisioned via secure electronic software download (ESD) link within 15 days of order confirmation. Digital license keys will be transmitted via email. On-site physical installation and engineering configuration are excluded.", s["body"]),
        Spacer(1, 6),
        Paragraph("<b>2. Service & Maintenance Centre Infrastructure:</b>", s["body_bold"]),
        Paragraph("Technical support provided remotely via central helpdesk in New Delhi during business hours. The bidder does not currently operate an offline physical service centre in Rajasthan.", s["body"]),
        Spacer(1, 20),
        Paragraph("For Nexus Infotech & Trading Pvt Ltd<br/>Rajesh Sharma, Director", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-TECH-DELIVERY", "file": fn, "pages": 1})

    # Doc 8: Unnotarized Non-Blacklisting on Letterhead
    fn = "Nexus_NonBlacklisting_PlainPaper.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("NEXUS INFOTECH & TRADING PRIVATE LIMITED", s["header_org"]),
        Paragraph("B-12, Malviya Industrial Area, Jaipur 302017", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("DECLARATION OF NON-BLACKLISTING", s["title"]),
        Paragraph("Date: 15th August 2026", s["body_bold"]),
        Spacer(1, 10),
        Paragraph("We certify that our company has never been debarred or blacklisted by any government authority. Signed on company letterhead.", s["body"]),
        Paragraph("This declaration is provided on ordinary letterhead. (No non-judicial stamp paper or notary seal attached).", s["body"]),
        Spacer(1, 25),
        Paragraph("For Nexus Infotech & Trading Pvt Ltd<br/><br/>Rajesh Sharma<br/>Director", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T1-B2-NON-BLACKLISTING", "file": fn, "pages": 1})

    return docs_metadata


# ============================================================
# 2. T2-B1: VANGUARD SEATING SYSTEMS PVT LTD (Tender 2)
# ============================================================

def generate_vanguard_docs(out_dir, s):
    docs_metadata = []

    # Doc 1: Audited CA Turnover Certificate (₹49.17L avg with UDIN)
    fn = "Vanguard_Audited_Turnover_Certificate.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GUPTA SHUKLA & ASSOCIATES CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("Civil Lines, Kanpur - 208001 • ICAI Firm Reg: 008912C • Email: contact@guptashuklaca.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("STATUTORY AUDIT & TURNOVER CERTIFICATE", s["title"]),
        Paragraph("Ref: GSA/KAN/2026/0412 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 20th July 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("This is to certify that we have audited the annual accounts of <b>M/s Vanguard Seating Systems Private Limited</b> (CIN: U36100UP2016PTC081234, PAN: AABCV5678G), having its manufacturing unit at Plot 42, Panki Industrial Area, Kanpur, UP 208022.", s["body"]),
        Table(
            [
                [Paragraph("Financial Year", s["th"]), Paragraph("Audited Annual Turnover (INR)", s["th"]), Paragraph("Net Worth (INR)", s["th"])],
                [Paragraph("FY 2023-2024", s["td"]), Paragraph("₹ 46,20,000.00", s["td_bold"]), Paragraph("₹ 82,40,000.00", s["td"])],
                [Paragraph("FY 2024-2025", s["td"]), Paragraph("₹ 49,80,000.00", s["td_bold"]), Paragraph("₹ 94,10,000.00", s["td"])],
                [Paragraph("FY 2025-2026", s["td"]), Paragraph("₹ 51,50,000.00", s["td_bold"]), Paragraph("₹ 1,08,20,000.00", s["td"])],
                [Paragraph("<b>Three-Year Average</b>", s["th"]), Paragraph("<b>₹ 49,17,000.00 (Forty-Nine Lakhs Seventeen Thousand)</b>", s["th"]), Paragraph("<b>Positive & Growing</b>", s["th"])],
            ],
            colWidths=[140, 220, 160],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Average 3-year annual audited turnover of Vanguard Seating Systems Pvt Ltd is INR 49,17,000/- with UDIN 26081234AB12345", s["body_bold"]),
        Paragraph("OEM turnover equals bidder turnover as bidder is direct original equipment manufacturer.", s["body"]),
        Spacer(1, 15),
        Paragraph("For <b>Gupta Shukla & Associates</b><br/>Chartered Accountants (FRN: 008912C)<br/><br/><b>CA R. K. Shukla</b>, Partner<br/>UDIN: 26081234AB12345", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-CA-TURNOVER", "file": fn, "pages": 1})

    # Doc 2: Past Supply Performance (8,000 units)
    fn = "Vanguard_Supply_Performance_8000units.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("VANGUARD SEATING SYSTEMS PRIVATE LIMITED", s["header_org"]),
        Paragraph("Plot 42, Panki Industrial Area, Kanpur, UP • Factory & Supply Office", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PAST PERFORMANCE & SUPPLY STATEMENT", s["title"]),
        Paragraph("Certified Supply Summary for Modular Ergonomic Seat & Back Assemblies", s["subtitle"]),
        Spacer(1, 6),
        Table(
            [
                [Paragraph("Client / PSU Name", s["th"]), Paragraph("Contract Ref", s["th"]), Paragraph("Quantity Supplied", s["th"]), Paragraph("Completion Date", s["th"])],
                [Paragraph("Northern Railway Coach Works", s["td"]), Paragraph("NR-CW-2024-812", s["td"]), Paragraph("3,200 Units", s["td_bold"]), Paragraph("14-Mar-2025", s["td"])],
                [Paragraph("State Road Transport PSU", s["td"]), Paragraph("SRTC-UP-2025-44", s["td"]), Paragraph("2,800 Units", s["td_bold"]), Paragraph("18-Sep-2025", s["td"])],
                [Paragraph("Defense Transit Seating Cell", s["td"]), Paragraph("DTSC-ORD-2026", s["td"]), Paragraph("2,000 Units", s["td_bold"]), Paragraph("10-Feb-2026", s["td"])],
                [Paragraph("<b>Cumulative Total Volume</b>", s["th"]), Paragraph("<b>3 Major Contracts</b>", s["th"]), Paragraph("<b>8,000 Units</b>", s["th"]), Paragraph("<b>100% Executed</b>", s["th"])],
            ],
            colWidths=[160, 120, 110, 130],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Cumulative past verified supply volume across 3 major contracts equals 8,000 completed seat and back rest assemblies.", s["body_bold"]),
        Spacer(1, 15),
        Paragraph("Vikram Singh<br/>Managing Director, Vanguard Seating Systems Pvt Ltd", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-PAST-SUPPLY", "file": fn, "pages": 1})

    # Doc 3: CRAC Certificates & Invoices
    fn = "Vanguard_CRAC_Certificates.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT E-MARKETPLACE (GeM) CONSIGNEE RECEIPT & ACCEPTANCE CERTIFICATE", s["header_org"]),
        Paragraph("GeM CRAC Verification System (Synthetic Replica)", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("CRAC ACCEPTANCE CERTIFICATE", s["title"]),
        Paragraph("CRAC ID: CRAC-2025-UP-901 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 15th March 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Attached: GeM CRAC Acceptance Certificate #CRAC-2025-UP-901 confirming 100% satisfactory inspection and acceptance.", s["body_bold"]),
        Table(
            [
                [Paragraph("Supplier Name", s["th"]), Paragraph("Vanguard Seating Systems Private Limited", s["td_bold"])],
                [Paragraph("Consignee Name", s["th"]), Paragraph("Central Stores Depot, Kanpur", s["td"])],
                [Paragraph("Total Invoiced Units", s["th"]), Paragraph("3,200 Seat Assemblies (Invoice #VSS-2025-104)", s["td"])],
                [Paragraph("Quality Inspection Result", s["th"]), Paragraph("100% Accepted without deviation", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 20),
        Paragraph("Inspecting Officer / Store In-charge<br/>Consignee Acceptance Wing", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-INVOICES-CRAC", "file": fn, "pages": 1})

    # Doc 4: Udyam Manufacturing (Kanpur Plant)
    fn = "Vanguard_Udyam_Manufacturing_Kanpur.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("UDYAM REGISTRATION CERTIFICATE (SYNTHETIC REPLICA)", s["header_org"]),
        Paragraph("Ministry of Micro, Small and Medium Enterprises", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("UDYAM REGISTRATION ACKNOWLEDGEMENT", s["title"]),
        Paragraph("Registration No: UDYAM-UP-48-0056789", s["subtitle"]),
        Table(
            [
                [Paragraph("Name of Enterprise", s["th"]), Paragraph("M/S VANGUARD SEATING SYSTEMS PRIVATE LIMITED", s["td_bold"])],
                [Paragraph("Enterprise Classification", s["th"]), Paragraph("<b>SMALL ENTERPRISE</b>", s["td_bold"])],
                [Paragraph("Major Activity", s["th"]), Paragraph("<b>MANUFACTURING (DIRECT OEM)</b>", s["td_bold"])],
                [Paragraph("National Industry Code (NIC)", s["th"]), Paragraph("31003 - Manufacture of chairs and seats for offices, transit and special vehicles", s["td"])],
                [Paragraph("Manufacturing Plant Location", s["th"]), Paragraph("Plot 42, Panki Industrial Area, Kanpur, Uttar Pradesh 208022", s["td"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Operational manufacturing and quality testing facility located at Plot 42, Panki Industrial Area, Kanpur.", s["body"]),
        Paragraph("Claimed MSE Exemption as primary manufacturing unit registered under Ministry of MSME.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-UDYAM-MFG", "file": fn, "pages": 1})

    # Doc 5: MII CA Certificate (78.4%)
    fn = "Vanguard_MII_CA_Certificate_78.4pct.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GUPTA SHUKLA & ASSOCIATES CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("Civil Lines, Kanpur - 208001", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("LOCAL CONTENT (MAKE IN INDIA) COST AUDIT CERTIFICATE", s["title"]),
        Paragraph("Ref: GSA/MII/2026/109 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 15th July 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("We have audited the Bill of Materials and manufacturing cost records of <b>M/s Vanguard Seating Systems Pvt Ltd</b> for the Seat Assembly and Back Rest Assembly models.", s["body"]),
        Table(
            [
                [Paragraph("Cost Component", s["th"]), Paragraph("Value (INR / Unit)", s["th"]), Paragraph("Percentage Share", s["th"])],
                [Paragraph("Domestic Raw Material & Hardware", s["td"]), Paragraph("₹ 1,840.00", s["td"]), Paragraph("46.0 %", s["td"])],
                [Paragraph("Direct In-House Labor & Processing", s["td"]), Paragraph("₹ 1,296.00", s["td"]), Paragraph("32.4 %", s["td"])],
                [Paragraph("Imported Fasteners / Consumables", s["td"]), Paragraph("₹ 864.00", s["td"]), Paragraph("21.6 %", s["td"])],
                [Paragraph("<b>Total Local Value Addition</b>", s["th"]), Paragraph("<b>₹ 3,136.00</b>", s["th"]), Paragraph("<b>78.4 % (Class-I Local Supplier)</b>", s["th"])],
            ],
            colWidths=[200, 160, 160],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Certified that local content in the manufactured seating assemblies stands at 78.4% meeting Class-I Local Supplier criteria.", s["body_bold"]),
        Spacer(1, 15),
        Paragraph("CA R. K. Shukla, Partner<br/>Gupta Shukla & Associates<br/>UDIN: 26081234MII9012", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-MII-CA-CERT", "file": fn, "pages": 1})

    # Doc 6: Notarized Affidavit on E-Stamp
    fn = "Vanguard_Notarized_Affidavit.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT OF UTTAR PRADESH e-STAMP CERTIFICATE", s["header_org"]),
        Paragraph("Certificate No: IN-UP891234567890 • Stamp Duty Paid: ₹ 100/-", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("AFFIDAVIT OF INTEGRITY & NON-BLACKLISTING", s["title"]),
        Paragraph("Date of Execution: 10th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("I, <b>Vikram Singh</b>, Managing Director of M/s Vanguard Seating Systems Private Limited, having registered address at Plot 42, Panki Industrial Area, Kanpur, solemnly affirm and declare as follows:", s["body"]),
        Paragraph("1. That the bidder has never been blacklisted, debarred, or suspended by ALIMCO, GeM, or any Central/State Government Ministry/Department.", s["body"]),
        Paragraph("2. That all representations, addresses, and manufacturing disclosures made in bid submission are true and complete.", s["body"]),
        Paragraph("Duly sworn before Notary Public on non-judicial e-stamp paper confirming zero debarment or blacklisting.", s["body_bold"]),
        Spacer(1, 25),
        Paragraph("Deponent: Vikram Singh<br/><br/>Sworn and signed before me:<br/><b>Adv. S. K. Awasthi</b><br/>Notary Public, Kanpur Nagar, UP", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B1-NOTARIZED-AFFIDAVIT", "file": fn, "pages": 1})

    return docs_metadata


# ============================================================
# 3. T2-B2: ZENITH ERGONOMICS & COMPONENTS PVT LTD (Tender 2)
# ============================================================

def generate_zenith_docs(out_dir, s):
    docs_metadata = []

    # Doc 1: CA Turnover Certificate (2 years only, ₹20.15L avg)
    fn = "Zenith_CA_Turnover_2Years.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("MEHRA & COMPANY CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("Nehru Place, New Delhi - 110019 • Email: audit@mehraca.com", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("TURNOVER CERTIFICATE (TWO OPERATIONAL YEARS)", s["title"]),
        Paragraph("Ref: MC/DEL/2026/091 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 05th August 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("This is to certify that <b>M/s Zenith Ergonomics & Components Private Limited</b> (CIN: U36999DL2023PTC412345), incorporated in 2023 at 104, Okhla Industrial Estate Phase-III, New Delhi, has the following annual turnover records:", s["body"]),
        Table(
            [
                [Paragraph("Financial Year", s["th"]), Paragraph("Annual Turnover (INR)", s["th"]), Paragraph("Remarks", s["th"])],
                [Paragraph("FY 2024-2025", s["td"]), Paragraph("₹ 18,50,000.00", s["td_bold"]), Paragraph("First Full Operational Year", s["td"])],
                [Paragraph("FY 2025-2026", s["td"]), Paragraph("₹ 21,80,000.00", s["td_bold"]), Paragraph("Second Operational Year", s["td"])],
                [Paragraph("<b>Two-Year Average</b>", s["th"]), Paragraph("<b>₹ 20,15,000.00 (Twenty Lakhs Fifteen Thousand)</b>", s["th"]), Paragraph("<b>2-Year Average Only</b>", s["th"])],
            ],
            colWidths=[150, 220, 150],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Average annual turnover across 2 completed operational financial years is INR 20,15,000/-", s["body_bold"]),
        Spacer(1, 15),
        Paragraph("CA Vishal Mehra, Partner<br/>Mehra & Company, Chartered Accountants", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-CA-TURNOVER", "file": fn, "pages": 1})

    # Doc 2: DPIIT Provisional Application Ack (No Certificate)
    fn = "Zenith_DPIIT_Application_Ack.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("DEPARTMENT FOR PROMOTION OF INDUSTRY AND INTERNAL TRADE (DPIIT)", s["header_org"]),
        Paragraph("Startup India Recognition Portal (Synthetic Acknowledgement)", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PROVISIONAL APPLICATION ACKNOWLEDGEMENT SLIP", s["title"]),
        Paragraph("Application Number: DPIIT-APP-2026-9812 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 12th April 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Dear Applicant,<br/><br/>Your application for Recognition as a Startup has been received and is under scrutiny by the inter-ministerial board.", s["body"]),
        Table(
            [
                [Paragraph("Applicant Entity", s["th"]), Paragraph("Zenith Ergonomics & Components Private Limited", s["td_bold"])],
                [Paragraph("Application Status", s["th"]), Paragraph("<b>UNDER PROCESS / PENDING VERIFICATION</b>", s["td_bold"])],
                [Paragraph("Formal Recognition Certificate", s["th"]), Paragraph("<b>NOT YET ISSUED (Provisional Slip Only)</b>", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 10),
        Paragraph("Application Acknowledgement for Startup Recognition under Process. Formal Certificate pending issuance.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-STARTUP-ACK", "file": fn, "pages": 1})

    # Doc 3: Past Order (3,500 units to Alpha Trading)
    fn = "Zenith_AlphaTrading_PO_3500units.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("ALPHA TRADING & FURNITURE CO.", s["header_org"]),
        Paragraph("Wholesale Furniture Trading • Okhla Industrial Area Phase-II, New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PURCHASE ORDER", s["title"]),
        Paragraph("Order Ref: AT-991 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 18th October 2025", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("To: M/s Zenith Ergonomics & Components Pvt Ltd, Okhla, New Delhi", s["body"]),
        Table(
            [
                [Paragraph("Description", s["th"]), Paragraph("Quantity Ordered", s["th"]), Paragraph("Delivery Terms", s["th"])],
                [Paragraph("Modular Chair Back Rest Assemblies", s["td"]), Paragraph("3,500 Units", s["td_bold"]), Paragraph("Delivery at Okhla warehouse", s["td"])],
            ],
            colWidths=[240, 130, 150],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Purchaser: Alpha Trading & Furniture Co, Okhla Phase-II, New Delhi (Private trading partnership).", s["body"]),
        Paragraph("Supply of 3,500 units of office chair back components against Purchase Order AT-991.", s["body_bold"]),
        Paragraph("Only purchase order submitted; signed delivery inspection certificates and CRAC are not attached.", s["notice"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-EXP-PO", "file": fn, "pages": 1})

    # Doc 4: Expired MAF
    fn = "Zenith_Expired_OEM_MAF.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("ERGOTECH COMPONENTS MANUFACTURING LTD.", s["header_org"]),
        Paragraph("Industrial Area, Manesar, Haryana", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("DEALERSHIP AUTHORIZATION CERTIFICATE", s["title"]),
        Paragraph("Date: 01st December 2024", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("This is to authorize M/s Zenith Ergonomics & Components Pvt Ltd as an authorized reseller of ErgoTech seat components.", s["body"]),
        Table(
            [
                [Paragraph("Effective Date", s["th"]), Paragraph("01st December 2024", s["td"])],
                [Paragraph("Validity Expiration Date", s["th"]), Paragraph("<b>31st December 2025 (EXPIRED)</b>", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 10),
        Paragraph("This authorization is valid from 01-Dec-2024 through 31-Dec-2025 only.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-OEM-MAF", "file": fn, "pages": 1})

    # Doc 5: MII Self-Declaration (52%)
    fn = "Zenith_MII_Self_Declaration.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("ZENITH ERGONOMICS & COMPONENTS PRIVATE LIMITED", s["header_org"]),
        Paragraph("104, Okhla Industrial Estate Phase-III, New Delhi • Email: contact@zenithergonomics.com", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("LOCAL CONTENT SELF-DECLARATION", s["title"]),
        Paragraph("Date: 14th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Self declaration: We confirm that our product contains 52% local content in accordance with MII.", s["body_bold"]),
        Paragraph("We hereby certify that the percentage of local value addition in the supplied items is approximately 52%. (Cost auditor computation sheet not attached).", s["body"]),
        Spacer(1, 20),
        Paragraph("Ananya Gupta<br/>Director, Zenith Ergonomics & Components Pvt Ltd", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-MII-SELF", "file": fn, "pages": 1})

    # Doc 6: Sample Timeline (20-25 Days)
    fn = "Zenith_Sample_Timeline_Undertaking.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("ZENITH ERGONOMICS & COMPONENTS PRIVATE LIMITED", s["header_org"]),
        Paragraph("104, Okhla Industrial Estate Phase-III, New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PROTOTYPE SAMPLE TESTING COMMITMENT", s["title"]),
        Paragraph("Date: 14th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Prototype samples will be manufactured and delivered within 20 to 25 days upon receipt of written intimation.", s["body_bold"]),
        Paragraph("Due to raw material procurement lead times, our factory requires 20 to 25 calendar days to assemble and deliver the requisite testing samples.", s["body"]),
        Spacer(1, 20),
        Paragraph("For Zenith Ergonomics & Components Pvt Ltd<br/>Authorized Signatory", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-SAMPLE-UNDERTAKING", "file": fn, "pages": 1})

    # Doc 7: Non-Blacklisting on Letterhead
    fn = "Zenith_NonBlacklisting_Letterhead.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("ZENITH ERGONOMICS & COMPONENTS PRIVATE LIMITED", s["header_org"]),
        Paragraph("104, Okhla Industrial Estate Phase-III, New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("DECLARATION OF NON-DEBARMENT", s["title"]),
        Paragraph("Date: 14th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Declaration on letterhead: We have not been debarred or blacklisted by any procuring entity.", s["body"]),
        Paragraph("Note: Executed on regular company letterhead without stamp paper.", s["notice"]),
        Spacer(1, 20),
        Paragraph("Ananya Gupta, Director", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T2-B2-NON-BLACKLISTING", "file": fn, "pages": 1})

    return docs_metadata


# ============================================================
# 4. T3-B1: APEX ELECTRICAL SOLUTIONS PVT LTD (Tender 3)
# ============================================================

def generate_apex_docs(out_dir, s):
    docs_metadata = []

    # Doc 1: Audited Turnover (₹5.20L avg with UDIN)
    fn = "Apex_Audited_Turnover_Cert.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("PATEL & SHAH CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("Ashram Road, Ahmedabad - 380009 • ICAI Reg: 012980W • Email: ca@patelshah.in", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("AUDITED TURNOVER & FINANCIAL CERTIFICATE", s["title"]),
        Paragraph("Ref: PS/AHM/2026/0712 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 10th July 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("This is to certify that we have audited the financial statements of <b>M/s Apex Electrical Solutions Private Limited</b> (CIN: U40106GJ2018PTC102345, PAN: AABCA3456K, GSTIN: 24AABCA3456K1ZG) having its registered office at 302, Synergy Tower, Near IP Bhawan, Ghatlodia, Ahmedabad, Gujarat 380061.", s["body"]),
        Table(
            [
                [Paragraph("Financial Year", s["th"]), Paragraph("Audited Annual Turnover (INR)", s["th"]), Paragraph("Filing Status", s["th"])],
                [Paragraph("FY 2023-2024", s["td"]), Paragraph("₹ 4,80,000.00", s["td_bold"]), Paragraph("ITR-6 Filed", s["td"])],
                [Paragraph("FY 2024-2025", s["td"]), Paragraph("₹ 5,10,000.00", s["td_bold"]), Paragraph("ITR-6 Filed", s["td"])],
                [Paragraph("FY 2025-2026", s["td"]), Paragraph("₹ 5,70,000.00", s["td_bold"]), Paragraph("ITR-6 Filed", s["td"])],
                [Paragraph("<b>Three-Year Average</b>", s["th"]), Paragraph("<b>₹ 5,20,000.00 (Five Lakhs Twenty Thousand)</b>", s["th"]), Paragraph("<b>Audited Average</b>", s["th"])],
            ],
            colWidths=[150, 220, 150],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Certified 3-year average annual audited turnover of Apex Electrical Solutions Pvt Ltd is INR 5,20,000/- with UDIN 26040106CD98765", s["body_bold"]),
        Spacer(1, 15),
        Paragraph("CA Hiren Patel, Partner<br/>Patel & Shah, Chartered Accountants<br/>UDIN: 26040106CD98765", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-CA-TURNOVER", "file": fn, "pages": 1})

    # Doc 2: Govt Electrical Experience Certificate (₹8.45L)
    fn = "Apex_Govt_Polytechnic_AMC_Cert.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT POLYTECHNIC AHMEDABAD", s["header_org"]),
        Paragraph("Directorate of Technical Education, Government of Gujarat • Panjrapole, Ahmedabad", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("WORK EXPERIENCE & COMPLETION CERTIFICATE", s["title"]),
        Paragraph("Ref: GP-AMC-2025/CERT-88 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 30th April 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("This is to certify that <b>M/s Apex Electrical Solutions Private Limited</b>, Ahmedabad, has successfully completed the annual electrical repair, maintenance, and transformer servicing contract for our campus.", s["body"]),
        Table(
            [
                [Paragraph("Contract Title", s["th"]), Paragraph("Comprehensive Electrical AMC & Repair Services", s["td_bold"])],
                [Paragraph("Work Order Ref", s["th"]), Paragraph("WO-GP/ELEC/2024-25/1102 dated 02-May-2024", s["td"])],
                [Paragraph("Executed Contract Value", s["th"]), Paragraph("<b>₹ 8,45,000.00 (Eight Lakh Forty-Five Thousand INR)</b>", s["td_bold"])],
                [Paragraph("Service Period", s["th"]), Paragraph("01-May-2024 to 30-Apr-2026 (Two Years)", s["td"])],
                [Paragraph("Performance Rating", s["th"]), Paragraph("Excellent / Satisfactory without any penalties", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Satisfactory completion of Comprehensive Electrical Maintenance Contract #GP-AMC-2025 value INR 8,45,000/-", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("Executive Engineer (Electrical)<br/>Government Polytechnic Ahmedabad", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-GOVT-CONTRACT", "file": fn, "pages": 1})

    # Doc 3: Gujarat Class-A Electrical License (Valid till 2029)
    fn = "Apex_ClassA_Electrical_License_Gujarat.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT OF GUJARAT — ENERGY & PETROCHEMICALS DEPARTMENT", s["header_org"]),
        Paragraph("Office of the Chief Electrical Inspector & Licensing Board • Gandhinagar", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("CLASS-A ELECTRICAL CONTRACTOR LICENSE", s["title"]),
        Paragraph("License No: GUJ/ELEC/A-4590", s["subtitle"]),
        Table(
            [
                [Paragraph("License Holder", s["th"]), Paragraph("APEX ELECTRICAL SOLUTIONS PRIVATE LIMITED", s["td_bold"])],
                [Paragraph("Class & Category", s["th"]), Paragraph("<b>CLASS-A CONTRACTOR (HT & LT INSTALLATIONS)</b>", s["td_bold"])],
                [Paragraph("Registered Office Address", s["th"]), Paragraph("302, Synergy Tower, Near IP Bhawan, Ghatlodia, Ahmedabad 380061", s["td"])],
                [Paragraph("Issue Date", s["th"]), Paragraph("10th June 2019", s["td"])],
                [Paragraph("Validity Expiration Date", s["th"]), Paragraph("<b>09th June 2029 (Active & Valid)</b>", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("License Class: Class-A Contractor. Issued by Licensing Board, Gujarat State. Valid up to 09/06/2029.", s["body_bold"]),
        Paragraph("Operating business premises and service centre located within 2 km of IP Bhawan, Ghatlodia, Ahmedabad.", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-ELEC-LICENSE", "file": fn, "pages": 1})

    # Doc 4: GSTR-3B Filings (Apr, May, Jun 2026)
    fn = "Apex_GSTR3B_Apr_May_Jun2026.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOODS AND SERVICES TAX NETWORK (GSTN) FILING ACKNOWLEDGEMENTS", s["header_org"]),
        Paragraph("GSTIN: 24AABCA3456K1ZG • State: Gujarat (24)", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("GSTR-3B RETURN FILING SUMMARY (Q1 FY 2026-27)", s["title"]),
        Spacer(1, 6),
        Table(
            [
                [Paragraph("Return Period", s["th"]), Paragraph("Form", s["th"]), Paragraph("Filing Date", s["th"]), Paragraph("Acknowledgment ARN", s["th"]), Paragraph("Status", s["th"])],
                [Paragraph("April 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("18-May-2026", s["td"]), Paragraph("AA2404260018912", s["td_bold"]), Paragraph("FILED", s["td_bold"])],
                [Paragraph("May 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("19-Jun-2026", s["td"]), Paragraph("AA2405260029411", s["td_bold"]), Paragraph("FILED", s["td_bold"])],
                [Paragraph("June 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("18-Jul-2026", s["td"]), Paragraph("AA2406260031804", s["td_bold"]), Paragraph("FILED", s["td_bold"])],
            ],
            colWidths=[90, 70, 90, 180, 90],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Filing acknowledgements verified: April 2026 (Filed 18-May), May 2026 (Filed 19-Jun), June 2026 (Filed 18-Jul).", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-GST-RETURNS", "file": fn, "pages": 1})

    # Doc 5: Notarized Affidavit on ₹100 E-Stamp
    fn = "Apex_Notarized_NonBlacklisting_Affidavit.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT OF GUJARAT e-STAMP CERTIFICATE", s["header_org"]),
        Paragraph("Certificate No: IN-GJ901234567890 • Stamp Duty Paid: ₹ 100/-", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("AFFIDAVIT OF NON-BLACKLISTING & STATUTORY COMPLIANCE", s["title"]),
        Paragraph("Date: 12th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("I, <b>Harsh Patel</b>, Director of M/s Apex Electrical Solutions Private Limited, Ghatlodia, Ahmedabad, do hereby solemnly declare that our firm has never been debarred or blacklisted by any government procurement entity.", s["body"]),
        Paragraph("Affidavit executed on e-stamp paper of INR 100 solemnly affirming non-blacklisting and non-debarment.", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("Deponent: Harsh Patel<br/><br/>Sworn before me:<br/><b>Adv. M. C. Mehta</b>, Notary Public, Ahmedabad City", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-NOTARIZED-AFFIDAVIT", "file": fn, "pages": 1})

    # Doc 6: Bank Solvency Certificate
    fn = "Apex_Bank_Solvency_Certificate.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("BANK OF BARODA — GHATLODIA BRANCH", s["header_org"]),
        Paragraph("Synergy Commercial Complex, Ghatlodia, Ahmedabad - 380061", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("FINANCIAL SOLVENCY CERTIFICATE", s["title"]),
        Paragraph("Ref: BOB/GHT/SOL/2026/18 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 01st August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("This is to certify that <b>M/s Apex Electrical Solutions Private Limited</b> maintains Current Account #04520200008891 with our branch. Based on their transactions and banking records, the company is solvent and financially sound up to ₹ 25,00,000/- (Rupees Twenty-Five Lakhs Only).", s["body"]),
        Paragraph("Bank of Baroda certifies that company is solvent and financially sound. No winding-up petitions pending.", s["body_bold"]),
        Spacer(1, 20),
        Paragraph("Chief Manager<br/>Bank of Baroda, Ghatlodia Branch", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-SOLVENCY", "file": fn, "pages": 1})

    # Doc 7: ISI Material Undertaking
    fn = "Apex_ISI_Material_Undertaking.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("APEX ELECTRICAL SOLUTIONS PRIVATE LIMITED", s["header_org"]),
        Paragraph("302, Synergy Tower, Near IP Bhawan, Ghatlodia, Ahmedabad 380061", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("TECHNICAL COMPLIANCE & ISI/BIS MATERIAL UNDERTAKING", s["title"]),
        Paragraph("Tender Ref: GEM/2026/B/7676747 (Electrical Maintenance Services)", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("We confirm that only ISI/BIS certified copper wires, MCBs, MCCBs, and switchgears from approved makes shall be deployed.", s["body_bold"]),
        Paragraph("All replacement components, copper cables, LED fittings, and safety switchgear deployed in the execution of the contract shall strictly comply with Bureau of Indian Standards (BIS/ISI) specifications from approved OEM brands including Polycab, Havells, and Schneider Electric.", s["body"]),
        Spacer(1, 20),
        Paragraph("Harsh Patel<br/>Director, Apex Electrical Solutions Pvt Ltd", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B1-ISI-UNDERTAKING", "file": fn, "pages": 1})

    return docs_metadata


# ============================================================
# 5. T3-B2: VOLTECH POWER & INFRA SERVICES PVT LTD (Tender 3)
# ============================================================

def generate_voltech_docs(out_dir, s):
    docs_metadata = []

    # Doc 1: CA Turnover Certificate (₹2.40L avg)
    fn = "Voltech_CA_Turnover_Cert.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("VERMA & VERMA CHARTERED ACCOUNTANTS", s["header_org"]),
        Paragraph("Nehru Place, New Delhi - 110019 • ICAI Reg: 018992N", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("ANNUAL TURNOVER STATEMENT", s["title"]),
        Paragraph("Ref: VV/DEL/2026/41 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 22nd July 2026", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("We have verified the books of accounts of <b>M/s Voltech Power & Infra Services Private Limited</b> (CIN: U40108DL2019PTC114567), New Delhi.", s["body"]),
        Table(
            [
                [Paragraph("Financial Year", s["th"]), Paragraph("Turnover (INR)", s["th"])],
                [Paragraph("FY 2023-2024", s["td"]), Paragraph("₹ 2,10,000.00", s["td_bold"])],
                [Paragraph("FY 2024-2025", s["td"]), Paragraph("₹ 2,50,000.00", s["td_bold"])],
                [Paragraph("FY 2025-2026", s["td"]), Paragraph("₹ 2,60,000.00", s["td_bold"])],
                [Paragraph("<b>Three-Year Average</b>", s["th"]), Paragraph("<b>₹ 2,40,000.00 (Two Lakh Forty Thousand Only)</b>", s["th"])],
            ],
            colWidths=[200, 320],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Certified 3-year average annual turnover of Voltech Power & Infra Services Pvt Ltd is INR 2,40,000/-", s["body_bold"]),
        Spacer(1, 15),
        Paragraph("CA S. K. Verma, Partner<br/>Verma & Verma, Chartered Accountants", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-CA-TURNOVER", "file": fn, "pages": 1})

    # Doc 2: Delhi GST Certificate (No Gujarat registration)
    fn = "Voltech_GST_Delhi_Registration.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT OF INDIA — GOODS AND SERVICES TAX", s["header_org"]),
        Paragraph("Registration Certificate (Synthetic Replica)", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("GST REGISTRATION CERTIFICATE", s["title"]),
        Paragraph("GSTIN: 07AABCV7890L1ZE", s["subtitle"]),
        Table(
            [
                [Paragraph("Legal Name", s["th"]), Paragraph("VOLTECH POWER & INFRA SERVICES PRIVATE LIMITED", s["td_bold"])],
                [Paragraph("State Jurisdiction", s["th"]), Paragraph("<b>DELHI STATE (STATE CODE 07)</b>", s["td_bold"])],
                [Paragraph("Principal Place of Business", s["th"]), Paragraph("12, Nehru Place Commercial Complex, New Delhi 110019", s["td"])],
                [Paragraph("Gujarat Branch Registration", s["th"]), Paragraph("<b>NONE REGISTERED</b>", s["td_bold"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("GSTIN: 07AABCV7890L1ZE, State: Delhi. No Gujarat branch or registration disclosed.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-GST-CERT", "file": fn, "pages": 1})

    # Doc 3: PO for LED Bulb Supply
    fn = "Voltech_PO_LED_Bulb_Supply.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("CAPITAL COMMERCE CORPORATION", s["header_org"]),
        Paragraph("Commercial Supplies • Connaught Place, New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("PURCHASE ORDER FOR GOODS", s["title"]),
        Paragraph("PO No: CCC-2025-412 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: 14th August 2025", s["body_bold"]),
        Spacer(1, 6),
        Paragraph("To: M/s Voltech Power & Infra Services Pvt Ltd, New Delhi", s["body"]),
        Table(
            [
                [Paragraph("Item Description", s["th"]), Paragraph("Qty", s["th"]), Paragraph("Unit Rate", s["th"]), Paragraph("Total (INR)", s["th"])],
                [Paragraph("Supply of 18W Commercial LED Light Bulbs and Fixtures", s["td"]), Paragraph("500 Units", s["td_bold"]), Paragraph("₹ 240.00", s["td"]), Paragraph("₹ 1,20,000.00", s["td_bold"])],
            ],
            colWidths=[240, 70, 90, 120],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Purchase order for supply of 500 units of 18W LED tube lights and bulbs. No installation/repair service.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-EXP-PO", "file": fn, "pages": 1})

    # Doc 4: Expired Electrical License (Jan 2025)
    fn = "Voltech_Expired_Electrical_License.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOVERNMENT OF NCT OF DELHI — ELECTRICAL LICENSING BOARD", s["header_org"]),
        Paragraph("Labour & Power Department, Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("ELECTRICAL CONTRACTOR LICENSE", s["title"]),
        Paragraph("License No: DL-ELEC-2020-112", s["subtitle"]),
        Table(
            [
                [Paragraph("Licensee", s["th"]), Paragraph("Voltech Power & Infra Services Private Limited", s["td_bold"])],
                [Paragraph("Issue Date", s["th"]), Paragraph("16th January 2020", s["td"])],
                [Paragraph("Validity Expiration Date", s["th"]), Paragraph("<b>15th January 2025 (EXPIRED)</b>", s["td_bold"])],
                [Paragraph("Renewal Status", s["th"]), Paragraph("Not Renewed / Lapsed", s["td"])],
            ],
            colWidths=[180, 340],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("License #DL-ELEC-2020-112, Validity: 16-Jan-2020 to 15-Jan-2025 (EXPIRED).", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-ELEC-LICENSE", "file": fn, "pages": 1})

    # Doc 5: Partial GSTR-3B (May/June missing)
    fn = "Voltech_Partial_GSTR3B_Apr2026.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("GOODS AND SERVICES TAX NETWORK (GSTN) FILING RECORDS", s["header_org"]),
        Paragraph("GSTIN: 07AABCV7890L1ZE • Delhi State", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("GSTR-3B FILING STATUS STATEMENT", s["title"]),
        Spacer(1, 6),
        Table(
            [
                [Paragraph("Return Period", s["th"]), Paragraph("Form", s["th"]), Paragraph("Filing Date", s["th"]), Paragraph("Filing Status", s["th"])],
                [Paragraph("April 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("20-May-2026", s["td"]), Paragraph("FILED (ARN AA0704260019)", s["td_bold"])],
                [Paragraph("May 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("-", s["td"]), Paragraph("<b>PENDING / NOT FILED</b>", s["td_bold"])],
                [Paragraph("June 2026", s["td"]), Paragraph("GSTR-3B", s["td"]), Paragraph("-", s["td"]), Paragraph("<b>PENDING / NOT FILED</b>", s["td_bold"])],
            ],
            colWidths=[120, 80, 120, 200],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]),
        ),
        Spacer(1, 8),
        Paragraph("Returns for May 2026 and June 2026 could not be retrieved from GST portal due to non-filing.", s["body_bold"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-GST-RETURNS", "file": fn, "pages": 1})

    # Doc 6: Non-Blacklisting on Letterhead
    fn = "Voltech_NonBlacklisting_PlainPaper.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("VOLTECH POWER & INFRA SERVICES PRIVATE LIMITED", s["header_org"]),
        Paragraph("12, Nehru Place Commercial Complex, New Delhi 110019", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("NON-BLACKLISTING STATEMENT", s["title"]),
        Paragraph("Date: 15th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Signed declaration on company letterhead confirming company is not blacklisted.", s["body_bold"]),
        Paragraph("We hereby declare that Voltech Power & Infra Services Pvt Ltd is not blacklisted by any government body. (Plain paper statement).", s["body"]),
        Spacer(1, 20),
        Paragraph("Deepak Verma<br/>Managing Director", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-NON-BLACKLISTING", "file": fn, "pages": 1})

    # Doc 7: Technical Material Schedule (Non-ISI)
    fn = "Voltech_Technical_Material_Proposal.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("VOLTECH POWER & INFRA SERVICES PRIVATE LIMITED", s["header_org"]),
        Paragraph("Technical Services Division • New Delhi", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("TECHNICAL MATERIAL SCHEDULE & PROPOSAL", s["title"]),
        Spacer(1, 6),
        Paragraph("Item list contains OEM compatible generic imported MCBs and wiring cables without ISI mark.", s["body_bold"]),
        Table(
            [
                [Paragraph("Equipment / Line Item", s["th"]), Paragraph("Proposed Specification / Brand", s["th"])],
                [Paragraph("LT Distribution MCBs", s["td"]), Paragraph("Generic Imported Unbranded MCB 32A (Non-ISI standard)", s["td"])],
                [Paragraph("Copper Distribution Cables", s["td"]), Paragraph("Commercial grade imported PVC insulated wiring (No BIS stamp)", s["td"])],
            ],
            colWidths=[200, 320],
            style=TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]),
        ),
        Spacer(1, 20),
        Paragraph("Technical In-charge<br/>Voltech Power & Infra Services Pvt Ltd", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-TECH-PROPOSAL", "file": fn, "pages": 1})

    # Doc 8: NCLT Insolvency Disclosure
    fn = "Voltech_NCLT_IBC_Disclosure.pdf"
    fp = os.path.join(out_dir, fn)
    e = [
        Paragraph("VOLTECH POWER & INFRA SERVICES PRIVATE LIMITED", s["header_org"]),
        Paragraph("12, Nehru Place Commercial Complex, New Delhi 110019", s["header_sub"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94a3b8"), spaceAfter=12),
        Paragraph("STATUTORY DISCLOSURE REGARDING ONGOING LITIGATION / IBC PROCEEDINGS", s["title"]),
        Paragraph("Date: 10th August 2026", s["body_bold"]),
        Spacer(1, 8),
        Paragraph("Disclosure: The company is currently undergoing Corporate Insolvency proceedings before NCLT Principal Bench New Delhi in CP(IB) No. 412/2025.", s["body_bold"]),
        Paragraph("Pursuant to Section 9 of the Insolvency and Bankruptcy Code (IBC), 2016, an application admitted before National Company Law Tribunal (NCLT) is currently under hearing.", s["body"]),
        Spacer(1, 20),
        Paragraph("Deepak Verma, Managing Director", s["body"]),
    ]
    create_pdf(fp, e)
    docs_metadata.append({"code": "DOC-T3-B2-LITIGATION-DISCLOSURE", "file": fn, "pages": 1})

    return docs_metadata


def generate_all_synthetic_documents():
    """Main generation orchestrator for all 29 synthetic PDFs across 5 bidder packages."""
    os.makedirs(OUTPUT_ROOT, exist_ok=True)
    styles = get_custom_styles()
    manifest = {
        "datasetVersion": "1.0.0-phase4",
        "generatedFor": "SatyaSetu SIH Demo Dataset",
        "watermark": WATERMARK_TEXT,
        "packages": [],
    }

    bidders_config = [
        ("T1-B2-Nexus", "GEM/2026/B/7261466", "T1-B2", "Nexus Infotech & Trading Private Limited", generate_nexus_docs),
        ("T2-B1-Vanguard", "GEM/2026/B/7364888", "T2-B1", "Vanguard Seating Systems Private Limited", generate_vanguard_docs),
        ("T2-B2-Zenith", "GEM/2026/B/7364888", "T2-B2", "Zenith Ergonomics & Components Private Limited", generate_zenith_docs),
        ("T3-B1-Apex", "GEM/2026/B/7676747", "T3-B1", "Apex Electrical Solutions Private Limited", generate_apex_docs),
        ("T3-B2-Voltech", "GEM/2026/B/7676747", "T3-B2", "Voltech Power & Infra Services Private Limited", generate_voltech_docs),
    ]

    total_docs = 0
    for folder_name, tender_num, bidder_code, legal_name, gen_func in bidders_config:
        pkg_dir = os.path.join(OUTPUT_ROOT, folder_name)
        os.makedirs(pkg_dir, exist_ok=True)
        docs = gen_func(pkg_dir, styles)
        total_docs += len(docs)

        manifest["packages"].append({
            "folder": folder_name,
            "tenderNumber": tender_num,
            "bidderCode": bidder_code,
            "legalName": legal_name,
            "documentCount": len(docs),
            "documents": docs,
        })
        print(f"[OK] Generated {len(docs)} PDFs for {bidder_code} ({legal_name}) in {pkg_dir}")

    manifest_path = os.path.join(OUTPUT_ROOT, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nSUCCESS: Generated all {total_docs} synthetic PDFs across 5 bidder packages.")
    print(f"Manifest written to: {manifest_path}")
    return total_docs, manifest


if __name__ == "__main__":
    generate_all_synthetic_documents()
