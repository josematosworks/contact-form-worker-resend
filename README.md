# Contact Form Worker with Resend Integration

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/josematosworks/contact-form-worker-resend/deploy.yml?branch=main)

Welcome to the **Contact Form Worker with Resend Integration** project! This Cloudflare Worker handles submissions from a contact form, sending the collected data via the Resend API. It ensures secure handling of environment variables, implements rate limiting to prevent abuse, and automates deployments using GitHub Actions.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Local Development](#local-development)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Secure Environment Management**: Sensitive variables are managed through GitHub Secrets to prevent exposure in the repository.
- **Automated Deployments**: Deploy your Worker to Cloudflare seamlessly using GitHub Actions.
- **Resend API Integration**: Handles contact form submissions and sends them via the Resend API.
- **CORS Handling**: Ensures that only requests from allowed origins are processed.
- **Rate Limiting**: Limits the number of submissions per day per IP address to prevent abuse.
- **Key-Value Storage (KV)**: Utilizes Cloudflare Workers KV to store and manage rate-limiting data, ensuring submissions are tracked per IP address.
- **Error Handling**: Provides meaningful responses for various error scenarios.
- **Logging and Observability**: Monitors Worker performance and logs activities for easier debugging.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **GitHub Account**: To manage repository secrets and workflows.
- **Cloudflare Account**: To deploy Workers.
- **Resend API Account**: To handle email sending.
- **Node.js**: Version 16 or higher installed on your local machine.

## Installation

1. **Fork the Repository to Your GitHub Account**

    Click the "Fork" button at the top-right corner of the repository page to create a copy of this repository under your own GitHub account.

2. **Clone Your Forked Repository**

    ```bash
    git clone https://github.com/yourusername/contact-form-worker-resend.git
    cd contact-form-worker-resend
    ```

3. **Install Dependencies**

    ```bash
    npm install
    ```

## Configuration

### 1. Manage Environment Variables

To keep your sensitive information secure, a mix of `wrangler.toml` and GitHub Secrets is used.

#### a. `wrangler.toml`

Ensure that your `wrangler.toml` does **not** contain sensitive variables. Only include non-sensitive configurations.

```toml
name = "contact-form-worker-resend"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[vars]
RESEND_API_ENDPOINT = "https://api.resend.com/emails"
ALLOWED_ORIGIN = "https://josematoswork.com"
EMAIL_FROM = "Contact Form <noreply@josematoswork.com>"
EMAIL_TO = "developer@josematoswork.com"
LIMIT_PER_DAY = 5

[observability]
enabled = true
head_sampling_rate = 1

kv_namespaces = [
  { binding = "KV_STORE", id = "e7b2796cab684a898b4f54235645e74d", preview_id = "e7b2796cab684a898b4f54235645e74d" }
]
```

### 2. GitHub Secrets

Set the following secrets in your GitHub repository to manage sensitive information:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with permissions to deploy Workers.
- `RESEND_API_KEY`: Your Resend API key for sending emails.
- Any other required secrets based on your environment.

## Usage

### Sending a Contact Form Submission

To send a contact form submission, make a POST request to the Worker endpoint with the following JSON payload:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "Hello, I would like to get in touch!"
}
```

### Example with `curl`

```bash
curl -X POST https://your-worker-domain.workers.dev/submit \
  -H "Content-Type: application/json" \
  -d '{
        "name": "John Doe",
        "email": "john.doe@example.com",
        "message": "Hello, I would like to get in touch!"
      }'
```

### Response

- **Success (200 OK)**

  ```json
  {
    "status": "success",
    "message": "Your message has been sent successfully."
  }
  ```

- **Error (e.g., 400 Bad Request)**

  ```json
  {
    "status": "error",
    "message": "Invalid email address."
  }
  ```

## Deployment

Deployment is automated using GitHub Actions. Whenever you push changes to the `main` branch, the workflow defined in `.github/workflows/deploy.yml` will trigger and deploy your Worker to Cloudflare.

### Steps:

1. **Push Changes to Main Branch**

   Ensure your changes are committed and pushed to the `main` branch.

   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions Workflow**

   The `deploy.yml` workflow will handle the deployment process automatically.

## Local Development

For local testing and development, you can use the following commands:

- **Start Development Server**

  ```bash
  npm run dev
  ```

  This command runs `wrangler dev`, allowing you to test your Worker locally.

### Using a `.env` File

Create a `.env` file in the root of your project to manage environment variables locally. **Ensure that `.env` is listed in your `.gitignore` to prevent it from being committed.**

```env
ALLOWED_ORIGIN=https://josematoswork.com
EMAIL_FROM="Contact Form <noreply@josematoswork.com>"
EMAIL_TO="developer@josematoswork.com"
RESEND_API_ENDPOINT="https://api.resend.com/emails"
RESEND_API_KEY=your_resend_api_key
LIMIT_PER_DAY=5
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

## Security

- **Environment Variables**: Sensitive information is managed through GitHub Secrets and is not exposed in the repository.
- **`.gitignore`**: Ensure that files like `.env` and `wrangler.toml` (if containing sensitive data) are listed in `.gitignore` to prevent accidental commits.
- **GitHub Actions**: Permissions are restricted using the `CLOUDFLARE_API_TOKEN` with minimal required permissions.
- **Rate Limiting**: Implements daily submission limits to prevent abuse and potential denial-of-service attacks.
- **Input Validation**: Validates and sanitizes all incoming data to prevent injection attacks.
- **CORS Configuration**: Restricts access to allowed origins to enhance security.

## Troubleshooting

### Common Issues

- **Deployment Failures**
  - **Error**: `Unauthorized` during deployment.
  - **Solution**: Ensure that your `CLOUDFLARE_API_TOKEN` has the necessary permissions and is correctly set in GitHub Secrets.

- **Rate Limiting Triggered**
  - **Error**: `Too many requests` message after reaching the submission limit.
  - **Solution**: Wait until the rate limit resets or adjust the `LIMIT_PER_DAY` in your environment variables as needed.

- **Email Not Sending**
  - **Error**: Emails are not being received despite successful submissions.
  - **Solution**: Verify that your `RESEND_API_KEY` is correct and that Resend service is operational. Check the Worker logs for any errors related to the Resend API.

## License

This project is licensed under the [MIT License](LICENSE).

---
**© 2024 José Matos**
