import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading_with_color(doc, text, level, color_rgb):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = color_rgb
        run.font.name = 'Georgia'
    return h

def create_document():
    doc = docx.Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Palette
    COLOR_INK = RGBColor(0x1A, 0x18, 0x16)       # #1A1816
    COLOR_GOLD = RGBColor(0xB3, 0x88, 0x38)      # #B38838
    COLOR_MUTED = RGBColor(0x5C, 0x56, 0x4E)     # #5C564E
    COLOR_OXBLOOD = RGBColor(0x7A, 0x20, 0x2E)  # #7A202E

    # Title Page / Header
    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("THE ANTIQUARIAN GUILD • ARCHITECTURAL WHITEPAPER")
    r_badge.font.name = 'Courier New'
    r_badge.font.size = Pt(9.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = COLOR_GOLD

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("The Antiquarian Guild\nArchitecture, Domain Philosophy & Concurrency Whitepaper")
    r_title.font.name = 'Georgia'
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_INK

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Engineering a High-Concurrency Collectible E-Commerce System for Rare Books, First Editions, and Archival Manuscripts")
    r_sub.font.name = 'Georgia'
    r_sub.font.italic = True
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = COLOR_MUTED

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = p_meta.add_run("Published by the Senior Curatorial & Software Engineering Group • October 2026")
    r_meta.font.name = 'Courier New'
    r_meta.font.size = Pt(9)
    r_meta.font.color.rgb = COLOR_MUTED

    doc.add_paragraph() # spacing

    # Callout Box: Executive Abstract
    tbl_callout = doc.add_table(rows=1, cols=1)
    tbl_callout.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_callout.autofit = False
    tbl_callout.columns[0].width = Inches(6.5)
    c = tbl_callout.cell(0, 0)
    set_cell_background(c, "F7F3E9")
    set_cell_margins(c, top=160, bottom=160, left=240, right=240)
    
    cp = c.paragraphs[0]
    cr1 = cp.add_run("EXECUTIVE ABSTRACT: ")
    cr1.font.bold = True
    cr1.font.size = Pt(10)
    cr1.font.name = 'Georgia'
    cr1.font.color.rgb = COLOR_OXBLOOD
    
    cr2 = cp.add_run(
        "Commercial e-commerce architectures assume fungible, multi-unit inventory where price and catalog uniformity reign. "
        "The antiquarian book and manuscript trade operates under the polar opposite constraint: every specimen is singular (Quantity = 1), "
        "value is determined by forensic defect accounting and provenance, and buyers require contemplative hold periods. "
        "This document details the engineering specifications, mathematical invariants, database concurrency locks, "
        "cryptographic authenticity protocols, and anti-snipe auction mechanics powering The Antiquarian Guild."
    )
    cr2.font.size = Pt(9.5)
    cr2.font.name = 'Georgia'
    cr2.font.color.rgb = COLOR_INK

    doc.add_paragraph()

    # Section 1
    add_heading_with_color(doc, "1. The Founding Thesis: Why Standard E-Commerce Fails", 1, COLOR_OXBLOOD)
    
    p = doc.add_paragraph()
    p.add_run(
        "Standard retail software platforms like Amazon, Shopify, or Magento are optimized for deep inventories ($N > 1$) "
        "of mass-produced goods. In the rare book and manuscript domain, traditional e-commerce models fail catastrophically across four fundamental vectors:"
    )
    
    bullet_points = [
        ("Absolute Singularity (Quantity = 1): ", "Every collectible item is physically unique. There are no duplicate copies of an 1818 Frankenstein in contemporary calf, an 1897 Dracula inscribed by Bram Stoker on publication day, or an original 1623 Shakespeare First Folio leaf."),
        ("Defect-Driven Forensic Value: ", "In mass merchandise, wear and tear is categorized as defective. In antiquarian books, aging characteristics—such as uncorrected typo states ('chatter' on p. 60 of Gatsby), deckle paper edges, foxing patterns, and unclipped dust jackets—are the primary determinants of valuation and historical authenticity."),
        ("The Contemplation Window: ", "Discerning institutional curators, university librarians, and private collectors do not purchase high-value rarities ($5,000 to $450,000) on impulse. They require dedicated time to examine microscopic ink analysis, inspect high-resolution photographs, and confirm provenance records before completing checkout."),
        ("The Double-Selling Hazard: ", "Under standard high-concurrency conditions, two competing collectors who click checkout simultaneously on a single unique volume trigger double-billing, fulfillment embarrassment, and administrative disruption. Strict database transaction guarantees are mandatory.")
    ]
    for bold_prefix, text in bullet_points:
        bp = doc.add_paragraph(style='List Bullet')
        r_b = bp.add_run(bold_prefix)
        r_b.bold = True
        r_b.font.color.rgb = COLOR_INK
        r_t = bp.add_run(text)
        r_t.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Section 2
    add_heading_with_color(doc, "2. Physical Forensics & Domain Taxonomy", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run("Every specimen admitted to The Antiquarian Guild is collated across more than 30 bibliographic dimensions. Below is the grading hierarchy governed by the Antiquarian Booksellers' Association of America (ABAA) and International League of Antiquarian Booksellers (ILAB):")

    # Table of Condition Grades
    tbl_grades = doc.add_table(rows=6, cols=3)
    tbl_grades.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_grades.columns[0].width = Inches(1.5)
    tbl_grades.columns[1].width = Inches(1.8)
    tbl_grades.columns[2].width = Inches(3.2)

    headers = ["Condition Grade", "Code / Nomenclature", "Forensic Definition & Standard"]
    for i, h in enumerate(headers):
        cell = tbl_grades.cell(0, i)
        set_cell_background(cell, "1A1816")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.name = 'Georgia'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    grades_data = [
        ("Fine", "F / As New", "Appears crisp and unread. Leaves pristine, binding completely square, no foxing, fading, or edge wear."),
        ("Very Good", "VG", "An exceptional collectible copy showing small signs of shelf handling. Completely intact hinges and unmarred text."),
        ("Good", "G", "The traditional trade term for a complete, honest used copy with expected age toning and sound binding."),
        ("Fair", "Fair / Reading Copy", "Complete text block but exhibiting noticeable wear, slight spine slant, or moderate foxing."),
        ("Poor", "P / Defective", "Heavily worn copy with detached boards, heavy staining, or missing endpapers; preserved purely for textual rarity.")
    ]

    for row_idx, data in enumerate(grades_data, start=1):
        bg_color = "FDFBF7" if row_idx % 2 == 1 else "F7F3E9"
        for col_idx, text in enumerate(data):
            cell = tbl_grades.cell(row_idx, col_idx)
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Georgia'
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_INK
            else:
                r.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Section 3
    add_heading_with_color(doc, "3. The 15-Minute Concurrency Reservation Engine", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run(
        "To reconcile the contemplation requirement with zero-collision safety, the platform implements an atomic 15-minute reservation mechanism. "
        "When a collector places a volume into their acquisition portfolio, an exclusive database lock is registered."
    )

    p_box = doc.add_paragraph()
    r_code = p_box.add_run(
        "MATHEMATICAL STATE INVARIANT:\n"
        "Status ∈ { AVAILABLE, RESERVED, SOLD, IN_AUCTION }\n"
        "Let R be an active reservation: R.reservedUntil > now()\n"
        "If R exists and R.sessionId ≠ currentSessionId => RESERVATION REJECTED (HTTP 409 Conflict)\n"
        "If now() >= R.reservedUntil => STALE HOLD PURGED, Status ← AVAILABLE"
    )
    r_code.font.name = 'Courier New'
    r_code.font.size = Pt(9)
    r_code.font.color.rgb = COLOR_INK

    p_sub = doc.add_paragraph()
    p_sub.add_run(
        "Key Transactional Safeguards:\n"
        "1. Atomic Serializable Isolation: The reservation logic is wrapped in an isolated database transaction (prisma.$transaction). No two threads can check availability and create a reservation simultaneously.\n"
        "2. Real-Time Heartbeat Synchronization: The client polls /api/cart/status while displaying a synchronous countdown timer. When remaining time is under 3 minutes, the UI shifts into an urgent amber/red alert state.\n"
        "3. Automatic Stale Hold Reclamation: Expired reservations are swept on every incoming request without requiring unreliable external cron daemons."
    )

    doc.add_paragraph()

    # Section 4
    add_heading_with_color(doc, "4. Payment Integrity & Idempotent Checkout", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run(
        "Checkout is integrated with the Razorpay payment infrastructure operating in test sandbox mode, "
        "backed by cryptographic signature validation and state-machine transitions."
    )

    steps = [
        ("Step 1: Order Initiation (/api/checkout/create-razorpay-order)", "The server validates that all items in the visitor's cart have unexpired reservations assigned to their sessionId. Total valuation is computed strictly on the backend to prevent client-side manipulation. A pending Order is created in the database with a human-readable identifier (e.g. ORD-2026-89412)."),
        ("Step 2: Cryptographic Signature Verification (/api/checkout/verify)", "Upon client completion in the Razorpay checkout gateway, the payload is transmitted to the server where an HMAC-SHA256 signature is evaluated: Signature = HMAC_SHA256(order_id + '|' + payment_id, secret). If valid, an atomic transaction transitions the order to PAID, updates all associated books to SOLD, and purges the cart reservations."),
        ("Step 3: Webhook Idempotency (/api/checkout/webhook)", "If network interruption prevents the buyer's browser from completing the callback, Razorpay's asynchronous webhooks deliver payment.captured events. The listener verifies the cryptographic webhook signature and finalizes the order idempotently without duplicating financial records.")
    ]
    for title, desc in steps:
        p = doc.add_paragraph()
        r1 = p.add_run(title + "\n")
        r1.font.bold = True
        r1.font.name = 'Georgia'
        r1.font.color.rgb = COLOR_INK
        r2 = p.add_run(desc)
        r2.font.name = 'Georgia'
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Section 5
    add_heading_with_color(doc, "5. Anti-Snipe Timed Auctions", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run(
        "For landmark institutional specimens (e.g., the 1623 Shakespeare First Folio leaf or the 1896 Kelmscott Press Chaucer), "
        "the platform supports timed online auctions featuring anti-snipe auto-extension mechanics."
    )

    p_anti = doc.add_paragraph()
    r_anti_code = p_anti.add_run(
        "ANTI-SNIPE AUTO-EXTENSION FORMULA:\n"
        "Let Δt = auction.endTime - now()\n"
        "If Δt ≤ 5 minutes (300 seconds):\n"
        "    auction.endTime ← now() + 5 minutes\n"
        "    auction.currentBid ← incomingBid\n"
        "Constraint: incomingBid ≥ auction.currentBid + auction.bidIncrement"
    )
    r_anti_code.font.name = 'Courier New'
    r_anti_code.font.size = Pt(9)
    r_anti_code.font.color.rgb = COLOR_OXBLOOD

    p = doc.add_paragraph()
    p.add_run(
        "This guarantees that competing human collectors always have at least 5 minutes to contemplate and respond to incoming bids, "
        "eliminating unfair automated sniper bot advantages."
    )

    doc.add_paragraph()

    # Section 6
    add_heading_with_color(doc, "6. Cryptographic Certificates of Authenticity", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run(
        "Every certified volume receives a permanent digital deed of authenticity accessible at /certificate/[certificateNumber]. "
        "The certificate incorporates:"
    )

    cert_items = [
        ("Unique Certificate Number: ", "A deterministic call number format: CERT-[YEAR]-[SLUG]-[SUFFIX] (e.g. CERT-1925-GATSBY-3128)."),
        ("SHA-256 Digital Fingerprint: ", "A cryptographic hash generated over Title + Author + Publication Year + Edition Statement + Appraiser Credentials."),
        ("Dynamic QR Code Matrix: ", "A server-generated QR matrix linking physical printed certificates directly to the live public ledger."),
        ("Physical Forensics Statement: ", "Microscopic ink testing results, paper substrate categorization, and binding structure notes."),
        ("Archival Print Layout: ", "A specialized CSS print stylesheet rendering a museum-grade certificate with gold double-fillet borders, watermark guild seals, and examiner signature blocks.")
    ]
    for b_title, b_desc in cert_items:
        bp = doc.add_paragraph(style='List Bullet')
        r_b = bp.add_run(b_title)
        r_b.bold = True
        r_b.font.color.rgb = COLOR_INK
        r_d = bp.add_run(b_desc)
        r_d.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Section 7
    add_heading_with_color(doc, "7. Technology Stack & Architecture Matrix", 1, COLOR_OXBLOOD)

    # Tech Stack Table
    tbl_tech = doc.add_table(rows=8, cols=3)
    tbl_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_tech.columns[0].width = Inches(1.5)
    tbl_tech.columns[1].width = Inches(2.0)
    tbl_tech.columns[2].width = Inches(3.0)

    tech_headers = ["Layer", "Technology Selected", "Engineering Rationale"]
    for i, h in enumerate(tech_headers):
        cell = tbl_tech.cell(0, i)
        set_cell_background(cell, "1A1816")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.name = 'Georgia'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    tech_data = [
        ("Framework", "Next.js 16 (App Router)", "Hybrid SSR for instant catalog crawling & SEO; dynamic client components for active reservation countdowns."),
        ("Styling", "Tailwind CSS v4", "Bespoke editorial parchment/ink palette (#FDFBF7, #1A1816, #B38838) with deckle borders."),
        ("Typography", "Cormorant Garamond & Inter", "Editorial serif headings evoke classical library press; clean sans-serif ensures legible provenance reading."),
        ("Database", "SQLite / PostgreSQL via Prisma", "Strict relational integrity, cascading deletions, and serializable ACID transactions."),
        ("Auth & RBAC", "NextAuth (Credentials & JWT)", "Role-based separation between Registered Collectors and Senior Curators (Admin House)."),
        ("Payments", "Razorpay SDK (Sandbox)", "Full test mode support with test card helpers and HMAC SHA-256 signature verification."),
        ("Test Suite", "Vitest", "Sub-second execution of concurrency locks, expiration sweeps, and anti-snipe logic.")
    ]

    for row_idx, data in enumerate(tech_data, start=1):
        bg_color = "FDFBF7" if row_idx % 2 == 1 else "F7F3E9"
        for col_idx, text in enumerate(data):
            cell = tbl_tech.cell(row_idx, col_idx)
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.name = 'Georgia'
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = COLOR_INK
            else:
                r.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Section 8
    add_heading_with_color(doc, "8. Verification & Integration Test Suite", 1, COLOR_OXBLOOD)
    p = doc.add_paragraph()
    p.add_run(
        "The core domain invariants were tested and verified using automated integration suites in Vitest. "
        "All 6 test cases passed without regression:"
    )

    tests_list = [
        ("Test 1: 15-Minute Reservation Creation", "PASSED", "Verified that an available volume is locked to the requester's session for exactly 15 minutes and transitions book status to RESERVED."),
        ("Test 2: Double-Booking Conflict Prevention", "PASSED", "Verified that a concurrent attempt by a secondary collector to reserve the same volume is rejected with HTTP 409 Conflict."),
        ("Test 3: Expiration Reclamation", "PASSED", "Verified that once a reservation's reservedUntil lapses, a new collector can successfully claim the volume."),
        ("Test 4: Double-Selling Prevention on Checkout", "PASSED", "Verified that finalized orders atomically transition the volume to SOLD and reject all subsequent reservation attempts."),
        ("Test 5: Minimum Bid Increment Validation", "PASSED", "Verified that auction bids lower than currentBid + bidIncrement are rejected."),
        ("Test 6: Anti-Snipe 5-Minute Auto-Extension", "PASSED", "Verified that placing a valid bid with less than 5 minutes remaining extends the auction closing time by 5 minutes.")
    ]

    for name, status, desc in tests_list:
        p = doc.add_paragraph(style='List Bullet')
        r_name = p.add_run(name + " [" + status + "]: ")
        r_name.bold = True
        r_name.font.color.rgb = RGBColor(0x23, 0x3D, 0x30) # forest green
        r_desc = p.add_run(desc)
        r_desc.font.color.rgb = COLOR_MUTED

    doc.add_paragraph()

    # Footer note
    p_end = doc.add_paragraph()
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_end = p_end.add_run("— End of Technical Whitepaper • The Antiquarian Guild LLC —")
    r_end.font.name = 'Courier New'
    r_end.font.size = Pt(9)
    r_end.font.color.rgb = COLOR_GOLD

    output_path = "c:\\Users\\jeffe\\Downloads\\ecommerce\\The_Antiquarian_Guild_Technical_Whitepaper.docx"
    doc.save(output_path)
    print(f"Document saved successfully to {output_path}")

if __name__ == "__main__":
    create_document()
