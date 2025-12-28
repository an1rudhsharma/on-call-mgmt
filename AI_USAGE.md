# AI Usage in Development

## Overview

This project was developed with the assistance of AI tools to accelerate the coding, debugging, and documentation phases. Below is a summary of how AI was leveraged.

## 1. Architectural Scaffolding
AI was used to propose the initial data schema for Prisma. By describing the requirements ("Services have policies, policies have steps with users"), the AI generated a robust `schema.prisma` file with correct relationships (@relation), saving time on boilerplate syntax errors.

## 2. Code Generation vs. Logic
- **Boilerplate:** AI handled the repetitive setup of the Express server, CORS configuration, and basic CRUD routes.
- **Complex Logic:** For the escalation logic (`routes.ts`), AI provided a template for finding the "next step" in an array. I refined this to ensure it correctly handled the "End of Policy" case (when no one else is left to escalate to).

## 3. Debugging
During development, we encountered module resolution errors (e.g., specific to Vite's CSS handling or TSConfig paths). AI analyzed the error messages and suggested targeted fixes, such as adjusting `tsconfig.json` or ensuring `package.json` dependencies were correctly installed in the nested client directory.

## 4. Documentation
AI was instrumental in generating the comprehensive `README.md` and this usage report. It summarized the codebase structure, identified key design decisions (like the lack of background workers), and formatted the information into clean, readable Markdown.

## Conclusion
The AI acted as a "Pair Programmer," handling the tedious setup and syntax lookup tasks, allowing the focus to remain on the business logic of Incident Management. It significantly reduced the time-to-MVP.
