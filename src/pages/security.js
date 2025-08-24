import Head from 'next/head';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';

const securityContent = `# Security Policy

**Last Updated: August 24, 2025**

## Responsible Security Research

We welcome security researchers and ethical hackers to help us keep SessionBase secure. We believe in working together with the security community to protect our users and improve our platform.

## Reporting Vulnerabilities

If you discover a security issue, please email us at [security@sessionbase.ai](mailto:security@sessionbase.ai) with:

- Clear description of the vulnerability and its potential impact
- Step-by-step reproduction instructions
- Screenshots, logs, or proof-of-concept code if applicable
- Your preferred contact method for follow-up

**Our Response:**
- We'll acknowledge your report as soon as possible
- We'll keep you updated on our investigation progress
- We'll work with you on coordinated disclosure timing
- We'll give you credit for the discovery (with your permission)

## Updates to This Policy

We may update this Security Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page.

## Contact

Questions about this policy? Email [security@sessionbase.ai](mailto:security@sessionbase.ai)`;

export default function Security() {
  return (
    <>
      <Head>
        <title>Security Policy - SessionBase</title>
        <meta
          name="description"
          content="SessionBase Security Policy - Learn about our security practices and how to report vulnerabilities responsibly."
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
                  code: ({ children }) => (
                    <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 dark:bg-slate-700 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                }}
              >
                {securityContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}