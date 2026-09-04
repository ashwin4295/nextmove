import { LegalDoc, LegalSection } from "../legal";

export default function TermsPage() {
  return (
    <LegalDoc title="Terms">
      <LegalSection title="What this is">
        NextMove is an AI coaching conversation. It is not professional career,
        legal or financial advice. Decisions are yours.
      </LegalSection>
      <LegalSection title="Free and paid">
        The conversation is free until 6 September 2026. The Next Move Pack
        costs ₹299 till 6 September 2026 and ₹999 after that, paid through Razorpay. Because the pack is generated for you
        within minutes, it is not refundable once delivered. If it does not
        arrive within 24 hours, email ashwin4295@gmail.com and we refund or
        resend.
      </LegalSection>
      <LegalSection title="Your content">
        You own what you say and what we write for you. You give us permission
        to process it as described in the privacy page.
      </LegalSection>
      <LegalSection title="Acceptable use">
        One person per conversation, your own profile only, no attempts to break
        or overload the service.
      </LegalSection>
      <LegalSection title="Changes">
        We may change the service and these terms; we will update the date
        below.
      </LegalSection>
      <LegalSection title="Law">
        These terms are governed by the laws of India.
      </LegalSection>
    </LegalDoc>
  );
}
