import { useState, useEffect } from 'react';

const sessionData = [
  [
    {
      type: "user",
      content: "How do I implement authentication in Next.js with TypeScript?",
    },
    {
      type: "assistant",
      content:
        "I'll help you implement authentication in Next.js with TypeScript. Here are the most common approaches using NextAuth.js:",
      contentType: "text",
    },
    {
      type: "assistant",
      content: `# Authentication Setup

## Installation
First, install the required packages:

\`\`\`bash
npm install next-auth
npm install @next-auth/prisma-adapter prisma @prisma/client
\`\`\`

## Configuration
Create your NextAuth configuration:`,
      contentType: "markdown",
    },
  ],
  [
    {
      type: "user",
      content: "Can you help me debug this React component that's not rendering properly?",
    },
    {
      type: "assistant",
      content: "I'll help you debug the React component. Let me first examine the code to understand the issue.",
      contentType: "text",
    },
    {
      type: "assistant",
      content: "Using tool: Read",
      contentType: "tool",
      toolName: "Read",
    },
    {
      type: "assistant",
      content: `export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div>Loading...</div>
  
  return (
    <div className="profile">
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  )
}`,
      contentType: "code",
      language: "javascript",
      filename: "components/UserProfile.js",
    },
  ],
  [
    {
      type: "user",
      content: "Create a Python script to analyze CSV data and generate insights",
    },
    {
      type: "assistant",
      content: "I'll create a Python script for CSV data analysis. Let me build this step by step.",
      contentType: "text",
    },
    {
      type: "assistant",
      content: "Using tool: Edit",
      contentType: "tool",
      toolName: "Edit",
    },
    {
      type: "assistant",
      content: `import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any

def analyze_csv(filepath: str) -> Dict[str, Any]:
    """
    Analyze CSV data and return insights
    """
    # Load the data
    df = pd.read_csv(filepath)
    
    # Basic statistics
    insights = {
        'shape': df.shape,
        'columns': df.columns.tolist(),
        'missing_values': df.isnull().sum().to_dict(),
        'data_types': df.dtypes.to_dict()
    }
    
    return insights`,
      contentType: "code",
      language: "python",
      filename: "csv_analyzer.py",
    },
  ],
];

export default function DynamicSessionViewer() {
  const [currentSession, setCurrentSession] = useState(0);

  useEffect(() => {
    const sessionInterval = setInterval(() => {
      setCurrentSession((prev) => (prev + 1) % sessionData.length);
    }, 8000);

    return () => clearInterval(sessionInterval);
  }, []);

  const currentMessages = sessionData[currentSession];

  return (
    <div className="p-6 space-y-4 h-80 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      {currentMessages.map((message, index) => (
        <div key={index} className="space-y-3">
          {message.type === "user" ? (
            <div className="flex justify-end">
              <div className="bg-primary-dark text-white rounded-2xl px-4 py-3 max-w-xs text-sm">{message.content}</div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1 dark:bg-primary-light/20 dark:text-primary-light">
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Claude</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">claude-sonnet-4-20250514</span>
                </div>

                {message.contentType === "tool" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3 dark:bg-primary-light/10 dark:border-primary-light/20">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-primary dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-primary-dark dark:text-primary-light">Tool: {message.toolName}</span>
                    </div>
                  </div>
                )}

                {message.contentType === "code" && (
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-300 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{message.filename}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">{message.language}</span>
                      </div>
                      <button className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                    <pre className="p-4 text-sm text-slate-800 dark:text-slate-100 overflow-x-auto bg-white dark:bg-slate-900">
                      <code>{message.content}</code>
                    </pre>
                  </div>
                )}

                {message.contentType === "markdown" && (
                  <div className="bg-white border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-800">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between dark:bg-slate-800 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Markdown Content</span>
                      </div>
                      <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{message.content}</div>
                    </div>
                  </div>
                )}

                {message.contentType === "text" && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-sm text-slate-700 leading-relaxed dark:text-slate-300">{message.content}</p>
                  </div>
                )}

                <button className="text-xs text-slate-500 hover:text-slate-700 mt-2 dark:text-slate-400 dark:hover:text-slate-200">Show Raw Data</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}