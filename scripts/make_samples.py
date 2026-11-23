"""Generate three FICTIONAL sample contracts (PDF) at different risk levels for testing.
All company names are invented. Run: python scripts/make_samples.py"""
import os

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

OUT = os.path.join(os.path.dirname(__file__), "..", "samples")
US = "Mthembu Advisory (Pty) Ltd (registration number 2019/481223/07), of 14 Bree Street, Cape Town (\"the Client\")"

CONTRACTS = {
    "01-mutual-nda-karoo-analytics.pdf": {
        "title": "MUTUAL NON-DISCLOSURE AGREEMENT",
        "intro": f"This Agreement is entered into on 1 December 2026 between {US.replace('the Client', 'Mthembu')} and Karoo Analytics (Pty) Ltd (registration number 2016/220981/07), of 3 Dorp Street, Stellenbosch (\"Karoo\"), each a \"Party\".",
        "clauses": [
            ("Purpose", "The Parties wish to explore a joint data-analytics proposal for a municipal client (\"the Purpose\") and may disclose Confidential Information to each other for that Purpose only."),
            ("Confidential Information", "\"Confidential Information\" means all information disclosed by a Party, in any form, that is marked confidential or would reasonably be understood to be confidential, excluding information that is or becomes public through no fault of the recipient, was lawfully known to the recipient beforehand, or is independently developed."),
            ("Obligations", "Each Party shall keep the other Party's Confidential Information confidential, use it only for the Purpose, and disclose it only to employees and advisers who need to know it and are bound by equivalent obligations."),
            ("Personal information", "To the extent Confidential Information includes personal information, each Party shall process it in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA), implement appropriate security safeguards as required by section 19, and notify the other Party without undue delay of any security compromise as contemplated in section 22."),
            ("Term", "This Agreement commences on the date of signature and continues for 2 (two) years. The confidentiality obligations survive for 3 (three) years after termination."),
            ("Return of information", "On written request, each Party shall return or destroy the other Party's Confidential Information within 10 business days."),
            ("No licence", "No licence or ownership of any intellectual property is granted by disclosure. Each Party retains all rights in its own information."),
            ("Liability", "Each Party's total liability under this Agreement is limited to R500 000, except for wilful or deliberate breach of confidentiality."),
            ("Governing law", "This Agreement is governed by the laws of the Republic of South Africa. Disputes shall be referred to arbitration under the rules of the Arbitration Foundation of Southern Africa (AFSA) in Cape Town."),
            ("General", "This Agreement is the entire agreement on its subject matter and may only be amended in writing signed by both Parties."),
        ],
    },
    "02-saas-subscription-umoya-cloud.pdf": {
        "title": "SOFTWARE-AS-A-SERVICE SUBSCRIPTION AGREEMENT",
        "intro": f"This Agreement is made between Umoya Cloud Services (Pty) Ltd (registration number 2018/093310/07), of 22 Jan Smuts Avenue, Johannesburg (\"Umoya\" or \"the Supplier\") and {US}.",
        "clauses": [
            ("Services", "Umoya shall provide the Client with access to its project-management and timesheet platform for up to 40 named users (\"the Services\"), with 99.5% monthly availability."),
            ("Fees", "The Client shall pay a subscription fee of R18 400 per month (excluding VAT), invoiced monthly in advance. Invoices are payable within 30 days of the invoice date. Late payments bear interest at the prime lending rate plus 2% per year."),
            ("Price changes", "Umoya may increase the subscription fee once per year on 60 days' written notice by an amount not exceeding 10% (ten percent)."),
            ("Term and renewal", "The initial term is 12 months from the effective date of 1 January 2027. Thereafter this Agreement renews automatically for successive periods of 12 months unless either party gives written notice of non-renewal at least 90 days before the end of the then-current term."),
            ("Termination", "Either party may terminate this Agreement for material breach not remedied within 30 days of written notice. The Client may not terminate for convenience during the initial term."),
            ("Client data", "The Client retains all rights, title and ownership in all data it uploads to the Services (\"Client Data\"). Umoya receives a limited licence to process Client Data solely to provide the Services. On termination Umoya shall make Client Data available for export for 30 days, then delete it."),
            ("Data protection", "Umoya acts as an operator of the Client in terms of the Protection of Personal Information Act 4 of 2013 (POPIA). Umoya shall process personal information only on the Client's documented instructions, maintain the security safeguards required by section 19, and notify the Client of any security compromise within 72 hours. Client Data is hosted in data centres in the European Union; Umoya shall ensure such transfers comply with section 72 of POPIA."),
            ("Confidentiality", "Each party shall keep the other's confidential information confidential during the term and for 2 years after termination."),
            ("Limitation of liability", "Each party's total aggregate liability under this Agreement shall not exceed the fees paid or payable by the Client in the 12 months preceding the claim, save for breach of confidentiality or data-protection obligations, which is capped at three times that amount."),
            ("Indemnity", "Umoya indemnifies the Client against third-party claims that the Services infringe intellectual property rights."),
            ("Governing law", "This Agreement is governed by the laws of the Republic of South Africa, and the parties submit to the jurisdiction of the High Court of South Africa, Gauteng Division, Johannesburg."),
        ],
    },
    "03-logistics-services-blue-crane.pdf": {
        "title": "MASTER SERVICES AGREEMENT",
        "intro": f"This Master Services Agreement is entered into between Blue Crane Logistics Ltd, a company incorporated in England and Wales (company number 11840266), of 9 Albert Embankment, London (\"the Supplier\") and {US}.",
        "clauses": [
            ("Services", "The Supplier shall provide courier, warehousing and document-storage services for the Client's client files, including physical and scanned records containing the names, identity numbers and contact details of the Client's customers."),
            ("Fees and payment", "Fees are set out in the Supplier's rate card as amended from time to time. Invoices are payable within 15 days. Overdue amounts bear interest at 2% per month, compounded monthly."),
            ("Price changes", "The Supplier may change its rate card at any time on 14 days' notice."),
            ("Term and renewal", "This Agreement has an initial term of 36 months and thereafter renews automatically for further periods of 36 months unless the Client gives written notice of termination not less than 180 days before the end of the then-current term."),
            ("Termination", "The Supplier may terminate this Agreement for convenience on 7 days' written notice. The Client may terminate only for the Supplier's material breach that remains unremedied for 60 days."),
            ("Exclusivity", "During the term and for 12 months thereafter the Client shall not engage any other provider for courier, storage or archiving services in South Africa."),
            ("Data and intellectual property", "All data, records, scans and derived datasets created by the Supplier in performing the Services, including scans of Client records, shall vest in and become the property of the Supplier, which may use them for analytics and product development."),
            ("Liability", "The Supplier's total liability for any claim shall not exceed R10 000. The Client's liability to the Supplier is unlimited."),
            ("Indemnity", "The Client shall indemnify and hold the Supplier harmless against any and all losses, claims and costs arising in any way from the Services, including losses caused by the Supplier's negligence."),
            ("Confidentiality", "The Client shall keep the terms of this Agreement and the Supplier's pricing confidential."),
            ("Governing law", "This Agreement is governed by the laws of England and Wales, and the courts of London shall have exclusive jurisdiction."),
        ],
    },
}


def build(name, c):
    ss = getSampleStyleSheet()
    body = ParagraphStyle("b", parent=ss["BodyText"], fontName="Helvetica", fontSize=10, leading=14, spaceAfter=6)
    head = ParagraphStyle("h", parent=body, fontName="Helvetica-Bold", fontSize=10.5, spaceBefore=6, spaceAfter=2)
    title = ParagraphStyle("t", parent=body, fontName="Helvetica-Bold", fontSize=15, alignment=TA_CENTER, spaceAfter=14)
    note = ParagraphStyle("n", parent=body, fontSize=8, textColor="#888888", alignment=TA_CENTER)

    def footer(canvas, doc):
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillGray(0.5)
        canvas.drawCentredString(A4[0] / 2, 12 * mm, f"SAMPLE CONTRACT: fictional parties, for demonstrating an automated review workflow · page {doc.page}")

    doc = SimpleDocTemplate(os.path.join(OUT, name), pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm,
                            topMargin=20 * mm, bottomMargin=22 * mm, title=c["title"], author="Sample")
    story = [Paragraph(c["title"], title), Paragraph(c["intro"], body), Spacer(1, 4)]
    for i, (h, t) in enumerate(c["clauses"], 1):
        story += [Paragraph(f"{i}. {h}", head), Paragraph(f"{i}.1 {t}", body)]
    story += [Spacer(1, 18), Paragraph("Signed for and on behalf of each party by its duly authorised representative.", body),
              Spacer(1, 26), Paragraph("_________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _________________________", body),
              Spacer(1, 10), Paragraph("All names in this document are fictional.", note)]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for n, c in CONTRACTS.items():
        build(n, c)
        print("wrote", n)
