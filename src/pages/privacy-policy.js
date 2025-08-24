import Head from 'next/head';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';

const privacyContent = `# SessionBase Privacy Policy

**Last Updated: August 24, 2025**  

## 1. Introduction

This Privacy Policy ("Policy") describes how SessionBase, Inc. ("SessionBase", "we", "us") collects, uses, and shares personal information of users of our website [https://sessionbase.ai](https://sessionbase.ai) and related products and services (together, the "Services").

By using the Services, you agree to the practices described in this Policy. If you do not agree, please do not use the Services.

## 2. Personal Information We Collect

We collect the following categories of personal information:

### Authentication Information

When you sign in with Google or GitHub via OAuth, we collect:

- Username
- Email address
- Profile photo URL
- Full name
- User ID

### Session Data

When you push sessions from supported platforms (Claude Code, Gemini CLI, Amazon Q Chat) using the SessionBase Command Line Interface ("CLI") or Model Context Protocol ("MCP") server, we collect:

- Session logs, which include messages from you and your AI agent, tool calls, and tool responses.
- Metadata, such as titles, tags, summaries, and visibility flags.

SessionBase is designed to help developers learn from each other by sharing AI coding sessions. **By default, sessions are public and discoverable, so others can benefit from your work. You can change visibility to private at any time.**

**Visibility settings:**

- **Public (default):** Public sessions are accessible via a shareable URL and may also be discoverable by other SessionBase users through features such as the /discover page and search. Public sessions are considered public content, and may be accessed, indexed, reused, or shared by SessionBase or third parties.
- **Private:** Private sessions are only visible to you and are not shared, indexed, or reused by SessionBase.

Users may delete session data at any time via the CLI or the User Interface ("UI").

**User Responsibility:** Users are solely responsible for ensuring that uploaded sessions do not contain confidential, personal, or otherwise sensitive information. SessionBase is not responsible for accidental disclosure of such information if it is included in a public session.

### Waitlist Information

If you sign up for the SessionBase teams waitlist, we collect the email address you provide.

### Automatically Collected Information

We may collect limited technical data when you interact with our Services, including your Internet Protocol (IP) address, browser type, operating system, and access times. We may also use cookies or similar technologies to improve your experience.

## 3. How We Use Your Personal Information

We use personal information to:

- Authenticate and authorize access to the Services.
- Store, manage, and share AI coding sessions.
- Provide customer support.
- Communicate with you about product updates, features, or waitlist status.
- Ensure platform security and prevent misuse.
- Comply with legal obligations.

### Marketing Communications

We may send you product updates, feature announcements, and promotional offers. Where required by law (including in the EU/UK), we send marketing only with your consent. You can withdraw consent or opt out at any time by using the unsubscribe link in our emails or emailing [support@sessionbase.ai](mailto:support@sessionbase.ai). We do not share your personal information with third parties for their own marketing. Even if you opt out of marketing, we may still send transactional or service emails, such as account, security, or legal notices.

## 4. How We Share Your Personal Information

We do not sell your personal information. We may share information only in these circumstances:

- **Service Providers:** With trusted third-party providers that support hosting, storage, analytics, and infrastructure.
- **Legal Requirements:** When necessary to comply with laws, regulations, or lawful requests.
- **Business Transfers:** In connection with a merger, acquisition, or sale of assets, personal information and public content may be transferred to a successor or acquirer, and will be subject to their privacy practices.
- **Public Content:** Public sessions you upload are publicly accessible and may be viewed, indexed, or reused by others. By uploading or leaving a session as public, you understand and agree that SessionBase and third parties may access, analyze, or share that content for research, analytics, or other lawful purposes. Private sessions are excluded from this use.
- **With Your Consent:** If you explicitly choose to share.

## 5. Data Retention and Deletion

Personal information is retained while your account is active.

You can delete session data at any time via the CLI or UI.

You may request full account and data deletion by contacting [support@sessionbase.ai](mailto:support@sessionbase.ai).

## 6. Security of Your Information

We use reasonable security measures to protect personal data. However, no method of electronic storage or transmission is completely secure.

## 7. International Users

The Services are operated in the United States. If you access them from outside the U.S., you consent to the transfer and processing of your information in the U.S.

## 8. Children

The Services are not intended for children under 13, and we do not knowingly collect information from them. If you believe we have collected data from a child under 13, please contact us so we can delete it.

## 9. Do Not Track

We do not currently respond to Do Not Track (DNT) browser signals.

## 10. Updates to This Policy

We may update this Privacy Policy at any time. If we make material changes, we will notify you via email or through the Services. Your continued use of the Services after such updates constitutes acceptance of the revised Privacy Policy.

## 11. Contact Us

If you have questions or requests about this Privacy Policy, please contact us at:

**SessionBase**  
Email: [support@sessionbase.ai](mailto:support@sessionbase.ai)`;

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - SessionBase</title>
        <meta
          name="description"
          content="SessionBase Privacy Policy - Learn how we collect, use, and protect your data."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Header />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {children}
                    </p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="mb-1">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900 dark:text-white">
                      {children}
                    </strong>
                  ),
                }}
              >
                {privacyContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}