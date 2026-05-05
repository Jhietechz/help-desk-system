# Helpdesk System

## Production Deployment Guide

### 1. Build the Frontend

Run the following command to build the React frontend for production:

```
npm run build
```

This will generate a `dist/` directory with the production-ready static files.

### 2. Environment Variables

Create a `.env` file in the project root with the following variables (example values):

```
# Server
PORT=3000

# JWT Secret
JWT_SECRET=your-very-secret-key

# Email (SMTP) configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your@email.com
SMTP_PASS=yourpassword

# Gemini API Key (if used)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Start the Server

Use a process manager like [PM2](https://pm2.keymetrics.io/) or run directly:

```
npm install --production
node server.ts
```

Or with PM2:

```
npm install -g pm2
npm install --production
pm run build
pm run lint
pm run clean # optional, cleans dist/
pm run build
pm run preview # to preview production build
pm run start # if you have a start script
pm2 start server.ts --interpreter tsx --name kabianga-helpdesk
```

### 4. Static Files

Ensure your server serves the static files from the `dist/` directory in production.

### 5. Security & Best Practices
- Set strong secrets in your `.env` file.
- Use HTTPS in production.
- Regularly update dependencies.
- Monitor server logs and errors.

### 6. Troubleshooting
- Check environment variables are set correctly.
- Review server logs for errors.
- Ensure SMTP credentials are valid for email notifications.

---

For more details, see the code and configuration files in this repository.
