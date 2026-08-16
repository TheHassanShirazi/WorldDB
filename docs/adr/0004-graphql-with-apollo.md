# GraphQL with Apollo, in a single Next.js deployable

The API is GraphQL, served by Apollo Server inside Next.js route handlers and consumed by Apollo Client. There is no separate backend service.

Two reasons, and the second is as real as the first. The domain fits GraphQL unusually well — a graph of heterogeneous nodes with variable-depth traversal is close to the canonical case, and DataLoader has genuine work to do here batching Relationship lookups. But this project is also a portfolio piece, and demonstrating GraphQL is an explicit goal rather than a side effect.

## Considered options

- **Next.js route handlers or server actions.** Less setup and entirely sufficient for a single-deployable app of this size. Rejected because it would not meet the second goal.
- **GraphQL Yoga instead of Apollo Server.** Lighter and arguably the better library; Apollo Client on the frontend does not require Apollo on the backend. Rejected because Apollo is the more recognisable name, which matters given why GraphQL was chosen.
