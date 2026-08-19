# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/auth.spec.js >> Health >> GET /api/health returns ok
- Location: api/auth.spec.js:13:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:5000
Call log:
  - → GET http://localhost:5000/api/health
    - user-agent: Playwright/1.62.1 (x64; debian 13) node/20.19
    - accept: */*
    - accept-encoding: gzip,deflate,br

```