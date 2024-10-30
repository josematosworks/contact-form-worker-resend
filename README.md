# Contact Form Worker with Resend Integration

Welcome to the **Contact Form Worker with Resend Integration** project! This Cloudflare Worker handles submissions from a contact form, sending the collected data via the Resend API. It ensures secure handling of environment variables and automates deployments using GitHub Actions.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Local Development](#local-development)
- [Security](#security)
- [License](#license)

## Features

- **Secure Environment Management**: Sensitive variables are managed through GitHub Secrets to prevent exposure in the repository.
- **Automated Deployments**: Deploy your Worker to Cloudflare seamlessly using GitHub Actions.
- **Resend API Integration**: Handles contact form submissions and sends them via the Resend API.
- **CORS Handling**: Ensures that only requests from allowed origins are processed.
- **Error Handling**: Provides meaningful responses for various error scenarios.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **GitHub Account**: To manage repository secrets and workflows.
- **Cloudflare Account**: To deploy Workers.
- **Resend API Account**: To handle email sending.
- **Node.js**: Version 16 or higher installed on your local machine.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/contact-form-worker-resend.git
   cd contact-form-worker-resend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Configuration

### 1. Manage Environment Variables

To keep your sensitive information secure, a mix of `wrangler.toml` and GitHub Secrets is used.

#### a. `wrangler.toml`

Ensure that your `wrangler.toml` does **not** contain sensitive variables. Only include non-sensitive configurations.

## Local Development

For local testing and development, you can use the following commands:

- **Start Development Server**

  ```bash
  npm run dev
  ```

  This command runs `wrangler dev`, allowing you to test your Worker locally.

### Using a `.env` File

Create a `.env` file in the root of your project to manage environment variables locally. **Ensure that `.env` is listed in your `.gitignore` to prevent it from being committed.**

## Security

- **Environment Variables**: Sensitive information is managed through GitHub Secrets and is not exposed in the repository.
- **`.gitignore`**: Ensure that files like `.env` and `wrangler.toml` (if containing sensitive data) are listed in `.gitignore` to prevent accidental commits.
- **GitHub Actions**: Permissions are restricted using the `CF_API_TOKEN` with minimal required permissions.

## License

This project is licensed under the [MIT License](LICENSE).

---
**© 2024 José Matos**
