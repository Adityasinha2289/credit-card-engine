import { SEO } from '../components/SEO';
import { ContentPage, RelatedLinks } from '../site/ContentPage';

export function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy | RenoCred"
        description="Read how RenoCred handles, protects, and respects your privacy and personal data."
        canonicalUrl="https://www.renocred.com/privacy"
      />
      <ContentPage
        eyebrow="Legal"
        title="Privacy policy"
        lede="A plain-language overview of the information RenoCred handles and the services that process it. RenoCred is in active development, and this page will grow with it."
        aside={<RelatedLinks links={[{ label: 'Terms of service', to: '/terms' }, { label: 'Contact', to: '/contact' }]} />}
      >
        <h2>Information you provide</h2>
        <p>When you use the RenoCred app, you may enter financial information such as your income range, monthly spending by category, the credit cards you hold, transactions, budgets, savings goals and subscriptions.</p>
        <p>You add cards by choosing them from our catalogue. We never ask for a full card number or CVV; you can optionally add a card's last four digits so SMS alerts can be matched to it.</p>

        <h2>Accounts and storage</h2>
        <p>We use Clerk to manage sign-in and Supabase to store your account data. Database access rules restrict each record to the account that owns it.</p>

        <h2>Taqdeer, the assistant</h2>
        <p>When you ask Taqdeer a question while signed in, the question, recent conversation turns and relevant facts about your cards and spending summary are sent to Google's Gemini API to generate the answer.</p>

        <h2>Reminders and notifications</h2>
        <p>If you turn on subscription reminders, we send emails through Resend. If you enable push notifications, your browser's push subscription is stored so we can deliver them; you can switch either off at any time.</p>

        <h2>Analytics and monitoring</h2>
        <p>To improve the product and fix bugs, we use:</p>
        <ul>
          <li><strong>PostHog</strong> for product analytics, to understand how people use the platform.</li>
          <li><strong>Sentry</strong> for error tracking and performance monitoring.</li>
        </ul>
        <p>These services may collect technical information about your device, browser, and interactions with the app.</p>

        <h2>Credit reports</h2>
        <p>RenoCred does not pull your credit report. Eligibility estimates rely only on the information you choose to share.</p>
      </ContentPage>
    </>
  );
}
