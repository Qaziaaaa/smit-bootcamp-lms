# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/attendance.spec.js >> Attendance API >> update attendance status
- Location: api/attendance.spec.js:97:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:5000
Call log:
  - → POST http://localhost:5000/api/auth/login
    - user-agent: Playwright/1.62.1 (x64; debian 13) node/20.19
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 50

```