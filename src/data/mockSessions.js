export const mockSessions = [
  {
    id: "63ecfc9f-4501-4201-96fb-24674bbc5906",
    title: "Building a React Component Library with TypeScript",
    description: "Complete conversation about setting up a modern React component library with TypeScript, Storybook, and automated testing.",
    author: {
      username: "sarah_dev",
      avatarUrl: "https://avatars.githubusercontent.com/u/1234567?v=4"
    },
    tags: ["react", "typescript", "storybook", "testing"],
    messageCount: 47,
    isPrivate: false,
    createdAt: "2024-12-15T10:30:00Z",
    updatedAt: "2024-12-15T14:22:00Z",
    votes: 23,
    views: 156,
    aiModel: "Claude 3.5 Sonnet"
  },
  {
    id: "a1b2c3d4-5678-9012-3456-789012345678",
    title: "Optimizing AWS Lambda Cold Starts",
    description: "Deep dive into Lambda performance optimization, including provisioned concurrency, connection pooling, and memory tuning strategies.",
    author: {
      username: "cloud_architect",
      avatarUrl: "https://avatars.githubusercontent.com/u/2345678?v=4"
    },
    tags: ["aws", "lambda", "performance", "serverless"],
    messageCount: 32,
    isPrivate: false,
    createdAt: "2024-12-14T16:45:00Z",
    updatedAt: "2024-12-14T18:30:00Z",
    votes: 41,
    views: 289,
    aiModel: "GPT-4"
  },
  {
    id: "f9e8d7c6-b5a4-3210-9876-543210987654",
    title: "Database Schema Design for Multi-tenant SaaS",
    description: "Exploring different approaches to multi-tenancy in PostgreSQL, including row-level security, schema separation, and database-per-tenant patterns.",
    author: {
      username: "db_guru",
      avatarUrl: "https://avatars.githubusercontent.com/u/3456789?v=4"
    },
    tags: ["postgresql", "database", "saas", "multi-tenant"],
    messageCount: 28,
    isPrivate: false,
    createdAt: "2024-12-13T09:15:00Z",
    updatedAt: "2024-12-13T11:45:00Z",
    votes: 18,
    views: 203,
    aiModel: "Claude 3.5 Sonnet"
  },
  {
    id: "12345678-abcd-efgh-ijkl-mnopqrstuvwx",
    title: "Implementing OAuth 2.0 with PKCE in Next.js",
    description: "Step-by-step implementation of secure OAuth 2.0 authentication flow with PKCE extension for public clients in a Next.js application.",
    author: {
      username: "security_first",
      avatarUrl: "https://avatars.githubusercontent.com/u/4567890?v=4"
    },
    tags: ["nextjs", "oauth", "security", "authentication"],
    messageCount: 19,
    isPrivate: false,
    createdAt: "2024-12-12T14:20:00Z",
    updatedAt: "2024-12-12T16:10:00Z",
    votes: 35,
    views: 178,
    aiModel: "GPT-4"
  },
  {
    id: "87654321-zyxw-vuts-rqpo-nmlkjihgfedc",
    title: "Advanced Git Workflows for Large Teams",
    description: "Comprehensive guide to Git branching strategies, merge vs rebase workflows, and automation tools for managing large development teams.",
    author: {
      username: "git_master",
      avatarUrl: "https://avatars.githubusercontent.com/u/5678901?v=4"
    },
    tags: ["git", "workflow", "devops", "collaboration"],
    messageCount: 53,
    isPrivate: false,
    createdAt: "2024-12-11T11:30:00Z",
    updatedAt: "2024-12-11T15:45:00Z",
    votes: 67,
    views: 412,
    aiModel: "Claude 3.5 Sonnet"
  },
  {
    id: "abcdef12-3456-7890-abcd-ef1234567890",
    title: "Building Real-time Chat with WebSockets and Redis",
    description: "Creating a scalable real-time chat application using WebSockets, Redis pub/sub, and horizontal scaling techniques.",
    author: {
      username: "realtime_dev",
      avatarUrl: "https://avatars.githubusercontent.com/u/6789012?v=4"
    },
    tags: ["websockets", "redis", "realtime", "scaling"],
    messageCount: 36,
    isPrivate: false,
    createdAt: "2024-12-10T13:45:00Z",
    updatedAt: "2024-12-10T17:20:00Z",
    votes: 29,
    views: 234,
    aiModel: "GPT-4"
  }
];

export const getSessionById = (id) => {
  return mockSessions.find(session => session.id === id);
};

export const getSessionsByTag = (tag) => {
  return mockSessions.filter(session => 
    session.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

export const getSessionsByAuthor = (username) => {
  return mockSessions.filter(session => 
    session.author.username === username
  );
};
