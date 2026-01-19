# Azure DevOps Pipeline Setup Guide

> **Solvo Staffing Frontend CI/CD Pipeline**
>
> Setup guide for Angular frontend pipelines using Azure-hosted agents

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Azure DevOps                                  │
│                                                                         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │  Pipeline DEV    │    │  Variable Group  │    │   Environment    │   │
│  │  (release/*)     │ ──▶│  SOLVO_FRONT_DEV │───▶│ solvo-frontend- │   │
│  └──────────────────┘    └──────────────────┘    │      dev         │   │
│           │                                       └─────────────────┘   │
│           ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Azure-hosted Agent (ubuntu-latest)            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │  Node.js   │  │   Build    │  │   Test     │  │  Artifact  │  │   │
│  │  │   Setup    │─▶│  Angular   │─▶│   Jest     │─▶│  Publish │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                              Deployment Targets                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Azure Static │  │ Azure Blob   │  │   AWS S3 +   │                  │
│  │  Web Apps    │  │   Storage    │  │  CloudFront  │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Pipeline Files

| File | Description | Trigger |
|------|-------------|---------|
| `azure-pipelines-dev.yml` | Development Pipeline | `release/*` branches |

**Key Features:**
- ✅ Azure-hosted agents (no infrastructure to manage)
- ✅ Node.js 20 with npm cache
- ✅ Jest unit tests with coverage reporting
- ✅ ESLint code quality checks
- ✅ Runtime environment configuration via `env.json`
- ✅ Build artifacts with semantic versioning

---

## 📋 Step 1: Create Variable Group

1. Go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Configure:
   - **Name**: `SOLVO_FRONT_DEV`
   - **Description**: Solvo Staffing Frontend - Development Environment

### Variables to Create

| Variable | Example Value (DEV) | Secret | Required |
|----------|---------------------|--------|----------|
| `API_BASE_URL` | `https://dev-api.solvo.com/api` | No | ✅ Yes |
| `API_VERSION` | `v1` | No | Optional |
| `PRODUCTION` | `false` | No | Optional |
| `USE_MOCK_SERVICES` | `false` | No | Optional |

### Additional Variables for Deployment (configure based on target)

#### Option A: Azure Static Web Apps
| Variable | Description | Secret |
|----------|-------------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token | ✅ Yes |

#### Option B: Azure Blob Storage
| Variable | Description | Secret |
|----------|-------------|--------|
| `AZURE_SUBSCRIPTION` | Service connection name | No |
| `STORAGE_ACCOUNT` | Storage account name | No |

#### Option C: AWS S3
| Variable | Description | Secret |
|----------|-------------|--------|
| `AWS_SERVICE_CONNECTION` | AWS service connection | No |
| `AWS_REGION` | e.g., `us-east-1` | No |
| `S3_BUCKET` | Bucket name | No |

### Link Variable Group to Pipeline

1. In the Variable Group, click **Pipeline permissions**
2. Click **+** → Select the pipeline
3. Save

---

## 📋 Step 2: Create Environment

1. Go to **Pipelines** → **Environments**
2. Click **+ New environment**
3. Configure:
   - **Name**: `solvo-frontend-dev`
   - **Description**: Solvo Staffing Frontend - Development
   - **Resource**: None (for now)

### Optional: Configure Approvals

1. Click on `solvo-frontend-dev`
2. Click **⋮** → **Approvals and checks**
3. Click **+** → **Approvals**
4. Add approvers if manual approval is required before deploy

---

## 📋 Step 3: Create the Pipeline

1. Go to **Pipelines** → **New pipeline**
2. Select your repository source (Azure Repos Git, GitHub, etc.)
3. Select your repository
4. Choose **Existing Azure Pipelines YAML file**
5. Path: `/.azure-pipelines/azure-pipelines-dev.yml`
6. Click **Continue** → **Run**

### Rename Pipeline (recommended)

1. Click on the pipeline → **⋮** → **Rename/move**
2. Suggested name: `solvo-staffing-frontend-dev`

---

## 📋 Step 4: Configure Deployment Target

The pipeline publishes build artifacts but requires configuration for the actual deployment. Choose one option:

### Option A: Azure Static Web Apps (Recommended)

1. Create an Azure Static Web App in Azure Portal
2. Get the deployment token from **Manage deployment token**
3. Add `AZURE_STATIC_WEB_APPS_API_TOKEN` to the Variable Group
4. Uncomment the Azure Static Web Apps task in the pipeline

### Option B: Azure Blob Storage (Static Website)

1. Create a Storage Account with Static website enabled
2. Create an Azure service connection in Project Settings
3. Add variables to the Variable Group:
   - `AZURE_SUBSCRIPTION`: Service connection name
   - `STORAGE_ACCOUNT`: Storage account name
4. Uncomment the Azure Blob Storage task in the pipeline

### Option C: AWS S3 + CloudFront

1. Create an S3 bucket configured for static website hosting
2. Create an AWS service connection in Project Settings
3. Add variables to the Variable Group:
   - `AWS_SERVICE_CONNECTION`: Service connection name
   - `AWS_REGION`: Region (e.g., `us-east-1`)
   - `S3_BUCKET`: Bucket name
4. Uncomment the AWS S3 task in the pipeline

---

## 🔄 Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PIPELINE: azure-pipelines-dev.yml                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  PR to release/*  →  Stage: BuildAndTest (20min timeout)        │   │
│  │                                                                  │   │
│  │  Job: Build                                                      │   │
│  │  ├── 📥 Checkout repository                                      │   │
│  │  ├── 🟢 Setup Node.js 20                                         │   │
│  │  ├── 📦 Cache node_modules                                       │   │
│  │  ├── 📦 npm ci (install dependencies)                            │   │
│  │  ├── 🔍 npm run lint (ESLint)                                    │   │
│  │  ├── 🧪 npm run test:coverage (Jest)                             │   │
│  │  ├── 📊 Publish Test Results (JUnit XML)                         │   │
│  │  ├── 📊 Publish Code Coverage (LCOV)                             │   │
│  │  ├── 🏗️ npm run build:dev                                        │   │
│  │  └── ✅ Verify build output (index.html, env.json)               │   │
│  │                                                                  │   │
│  │  Job: ValidateConfig                                             │   │
│  │  └── 🔐 Validate Variable Group variables exist                  │   │
│  │                                                                  │   │
│  │  ✅ PR can be approved if all checks pass                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼ (Merge to release/*)                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Push to release/*  →  Stage: DeployDev (20min timeout)         │   │
│  │                                                                  │   │
│  │  Job: BuildForDeploy                                             │   │
│  │  ├── 📥 Checkout repository                                      │   │
│  │  ├── 🟢 Setup Node.js 20                                         │   │
│  │  ├── 📦 Cache node_modules                                       │   │
│  │  ├── 📦 npm ci (install dependencies)                            │   │
│  │  ├── 📝 Generate env.json from Variable Group                    │   │
│  │  ├── 🏗️ npm run build:prod (production build)                    │   │
│  │  ├── 📋 Display build info and size                              │   │
│  │  ├── 📝 Create version.json                                      │   │
│  │  └── 📤 Publish build artifact                                   │   │
│  │                                                                  │   │
│  │  Deployment: DeployToEnvironment                                 │   │
│  │  ├── 📥 Download build artifact                                  │   │
│  │  ├── 📋 Display deployment info                                  │   │
│  │  └── 🚀 Deploy to target (configure in pipeline)                 │   │
│  │                                                                  │   │
│  │  ✅ Automatic deploy to development                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Variable Group: SOLVO_FRONT_DEV                                        │
│  Environment: solvo-frontend-dev                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Runtime Environment Configuration

The frontend uses runtime configuration via `/assets/env.json` instead of compile-time environment files. This allows different environments without rebuilding.

### How It Works

1. **Pipeline** exports variables from Variable Group as environment variables
2. **`npm run generate-env`** runs the script `scripts/generate-env.js`
3. **Script** reads environment variables and generates `public/assets/env.json`
4. **Build** copies `env.json` to the `dist/` output
5. **Runtime** Angular app fetches `env.json` on startup via `RuntimeEnvService`

### Environment Variables Used

| Variable | Default | Description |
|----------|---------|-------------|
| `PRODUCTION` | `false` | Production mode flag |
| `API_BASE_URL` | `http://localhost:3000/api` | Backend API base URL |
| `API_VERSION` | `v1` | API version |
| `USE_MOCK_SERVICES` | `true` | Use mock services instead of real API |

### Generated env.json Example

```json
{
  "production": false,
  "apiBaseUrl": "https://dev-api.solvo.com/api",
  "apiVersion": "v1",
  "useMockServices": false,
  "apiEndpoints": {
    "vacancies": {
      "list": "/vacancies",
      "detail": "/vacancies/:id",
      "state": "/vacancies/:id/state",
      "history": "/vacancies/:id/history"
    },
    "companies": {
      "list": "/companies",
      "detail": "/companies/:id",
      "state": "/companies/:id/state",
      "history": "/companies/:id/history",
      "vacancies": "/companies/:id/vacancies",
      "research": "/companies/:id/research",
      "contacts": "/companies/:id/contacts",
      "contactDetail": "/companies/:companyId/contacts/:contactId",
      "investigate": "/companies/investigate"
    }
  }
}
```

---

## 📊 Test Results & Code Coverage

The pipeline publishes test results and code coverage to Azure DevOps:

### Test Results

- **Format**: JUnit XML
- **Location**: `./test-results/junit.xml`
- **View**: Pipeline run → **Tests** tab

### Code Coverage

- **Format**: LCOV
- **Location**: `./coverage/lcov.info`
- **View**: Pipeline run → **Code Coverage** tab

### Jest Configuration

The project uses `jest-junit` reporter configured in `jest.config.js`:

```javascript
reporters: [
    'default',
    [
        'jest-junit',
        {
            outputDirectory: './test-results',
            outputName: 'junit.xml',
        },
    ],
],
```

---

## 📦 Build Artifacts

### Artifact Structure

```
solvo-frontend-build/
├── index.html
├── main.js
├── polyfills.js
├── styles.css
├── assets/
│   ├── env.json          # Runtime configuration
│   └── logo/
└── version.json          # Build metadata
```

### version.json Contents

```json
{
  "version": "1.0.123",
  "buildId": "123",
  "branch": "release/v1.0",
  "commit": "abc123def456...",
  "buildDate": "2026-01-19T12:00:00Z"
}
```

### Semantic Versioning

- **Format**: `MAJOR.MINOR.BUILD_ID`
- **Example**: `1.0.123`
- Configure in pipeline variables:
  ```yaml
  variables:
    - name: VERSION_MAJOR
      value: '1'
    - name: VERSION_MINOR
      value: '0'
  ```

---

## 💰 Cost Analysis

| Resource | Monthly Cost |
|----------|--------------|
| Azure DevOps | Free (up to 5 users, 1 parallel job) |
| Azure-hosted agents | Free (1800 minutes/month for private projects) |
| **Total** | **$0 USD/month** (within free tier) |

### Additional Costs (if needed)

| Resource | Cost |
|----------|------|
| Extra parallel jobs | ~$40 USD/month each |
| Azure Static Web Apps (Free tier) | $0 |
| Azure Static Web Apps (Standard) | ~$9 USD/month |
| Azure Blob Storage | ~$0.02/GB/month |
| AWS S3 | ~$0.023/GB/month |

---

## 🚨 Troubleshooting

### Pipeline fails on "npm ci"

```
Error: npm ERR! cipm can only install packages when your package.json and package-lock.json are in sync.
```

**Solution**: Commit `package-lock.json` to the repository.

### Tests fail with timeout

```
Error: Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solution**: Increase Jest timeout or check for unresolved promises in tests.

### Build output directory not found

```
ERROR: Build output directory not found: dist/solvo-staffing-frontend/browser
```

**Solution**: Verify `angular.json` output path matches pipeline `DIST_PATH` variable.

### env.json not found in build

```
ERROR: env.json not found in build output
```

**Solution**: Ensure `generate-env` script runs before build:
```bash
npm run generate-env
npm run build:prod
```

### Variable Group not linked

```
Error: Variable group 'SOLVO_FRONT_DEV' could not be found.
```

**Solution**: 
1. Go to **Pipelines** → **Library** → **SOLVO_FRONT_DEV**
2. Click **Pipeline permissions** → Add the pipeline

---

## ✅ Setup Checklist

### Azure DevOps Configuration

- [ ] Variable Group `SOLVO_FRONT_DEV` created
- [ ] `API_BASE_URL` variable added
- [ ] `API_VERSION` variable added (optional)
- [ ] `PRODUCTION` variable added (optional)
- [ ] `USE_MOCK_SERVICES` variable added (optional)
- [ ] Variable Group linked to pipeline
- [ ] Environment `solvo-frontend-dev` created
- [ ] Pipeline created from `azure-pipelines-dev.yml`
- [ ] Pipeline renamed to `solvo-staffing-frontend-dev`

### Deployment Target Configuration

- [ ] Deployment target chosen (Azure Static Web Apps / Blob Storage / AWS S3)
- [ ] Service connection created (if needed)
- [ ] Deployment variables added to Variable Group
- [ ] Deployment task uncommented in pipeline

### First Run Verification

- [ ] PR to `release/*` triggers BuildAndTest stage
- [ ] Tests pass and results appear in Tests tab
- [ ] Code coverage appears in Code Coverage tab
- [ ] Merge to `release/*` triggers DeployDev stage
- [ ] Build artifact published successfully
- [ ] Deployment completes (if configured)

---

## 🔧 Customization

### Change Node.js Version

Edit the pipeline:

```yaml
variables:
  - name: NODE_VERSION
    value: '22'  # Change to desired version
```

### Change Version Numbers

```yaml
variables:
  - name: VERSION_MAJOR
    value: '2'
  - name: VERSION_MINOR
    value: '0'
```

### Add Production Pipeline

Copy `azure-pipelines-dev.yml` to `azure-pipelines-prod.yml` and modify:

1. Change trigger to `main` branch
2. Change Variable Group to `SOLVO_FRONT_PROD`
3. Change Environment to `solvo-frontend-prod`
4. Add approval gates to environment

---

**Version:** 1.0.0 (Angular Frontend Pipeline)
