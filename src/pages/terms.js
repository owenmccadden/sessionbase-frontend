import Head from 'next/head';
import Header from '../components/Header';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service - SessionBase</title>
        <meta name="description" content="SessionBase Terms of Service - Understand the terms and conditions for using our platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Description of Service</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-4">
                  <li>Share and discover AI chat sessions</li>
                  <li>Browse conversations from various AI models</li>
                  <li>Collaborate with the community on AI interactions</li>
                  <li>Access tools for session management and analysis</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">User Responsibilities</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-4">
                  <li>Provide accurate and current information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Not engage in harmful or malicious activities</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Content Policy</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Users are prohibited from posting content that:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-4">
                  <li>Contains harmful, threatening, or harassing material</li>
                  <li>Violates privacy rights or contains personal information</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains malware, viruses, or malicious code</li>
                  <li>Promotes illegal activities or services</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Privacy and Data Protection</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Your privacy is important to us. Please review our{' '}
                  <a href="/privacy" className="text-primary hover:text-primary-hover underline">
                    Privacy Policy
                  </a>{' '}
                  to understand how we collect, use, and protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Termination</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Governing Law</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  These Terms of Service are governed by and construed in accordance with the laws of [Jurisdiction]. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in [Jurisdiction].
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    Email: legal@sessionbase.com<br/>
                    Address: Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the updated terms on our website. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}