import { LegalDoc, LegalSection } from "../legal";

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy">
      <LegalSection title="What we collect">
        Your first name and email. Your LinkedIn URL if you give it. The
        transcript of your conversation, typed or spoken. The result we write
        for you. If you buy the pack, Razorpay&apos;s payment reference; we
        never see your card or UPI details.
      </LegalSection>
      <LegalSection title="Audio">
        Your voice is processed live by our voice providers to run the
        conversation. NextMove does not store recordings.
      </LegalSection>
      <LegalSection title="Who processes it">
        Vapi, Deepgram and Cartesia for the live voice; Anthropic for the
        coaching model; Apify to read a public LinkedIn profile when you give
        the link; Convex and Vercel to host the app and store your data; PostHog
        for product analytics without transcripts; Razorpay for payments; Resend
        for email. None of them are permitted by us to train models on your
        data.
      </LegalSection>
      <LegalSection title="Sharing">
        Your result page is private unless you share the link. Anything you ask
        the coach to keep private never appears on the shareable card. We never
        contact anyone on your behalf.
      </LegalSection>
      <LegalSection title="Retention and deletion">
        We keep your transcript and result so your page keeps working. Email
        ashwin4295@gmail.com from the address you used and we delete everything
        within seven days.
      </LegalSection>
      <LegalSection title="Analytics">
        We record which buttons you use and where you came from. We do not send
        your transcript to analytics.
      </LegalSection>
      <LegalSection title="Contact">ashwin4295@gmail.com</LegalSection>
    </LegalDoc>
  );
}
