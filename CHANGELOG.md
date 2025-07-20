## [1.0.8](https://github.com/tonmate/tonmate/compare/v1.0.7...v1.0.8) (2025-07-20)

### Documentation

* add Calude.md ([a1c3a76](https://github.com/tonmate/tonmate/commit/a1c3a76264ae1b8c17c8e207cce3e9c01cadf10b))

### Code Refactoring

* remove global AI API keys in favor of per-user provider configuration ([5aa38ae](https://github.com/tonmate/tonmate/commit/5aa38aee7ce1f4305b2c1f176daaa13e4decc0bd))
* remove hardcoded OpenAI API key in favor of per-user configuration ([d803aab](https://github.com/tonmate/tonmate/commit/d803aabbb625ebc0f9dbe0282114928e92c52111))

## [1.0.7](https://github.com/tonmate/tonmate/compare/v1.0.6...v1.0.7) (2025-07-20)

### Code Refactoring

* **2:** optimize Docker setup with multi-stage builds and system Chromium ([a8caa15](https://github.com/tonmate/tonmate/commit/a8caa15168d71d612b884c972ee494c714eb605a))

## [1.0.6](https://github.com/tonmate/tonmate/compare/v1.0.5...v1.0.6) (2025-07-19)

### CI

* add GitHub Container Registry authentication step in deployment workflow ([7475669](https://github.com/tonmate/tonmate/commit/7475669e1b5530ef03f2a0e74e7eb40f3365026d))

## [1.0.5](https://github.com/tonmate/tonmate/compare/v1.0.4...v1.0.5) (2025-07-19)

### Bug Fixes

* use environment-specific docker compose file when pulling images ([02e1ad5](https://github.com/tonmate/tonmate/commit/02e1ad58a55cc8b2fd170d87643a0cc7d2e0bbd5))

### Code Refactoring

* simplify DB migrations by running inside existing app container instead of spawning new one ([f806e8f](https://github.com/tonmate/tonmate/commit/f806e8f556dbc24c7c86ba5ac98ecea90a9c6e5b))

## [1.0.4](https://github.com/tonmate/tonmate/compare/v1.0.3...v1.0.4) (2025-07-19)

### Code Refactoring

* improve SSH deployment script with cleaner environment variable handling ([b3fd85b](https://github.com/tonmate/tonmate/commit/b3fd85bce67e17883ee51a2f5e2dcdc69508b8ea))

## [1.0.3](https://github.com/tonmate/tonmate/compare/v1.0.2...v1.0.3) (2025-07-19)

### Code Refactoring

* improve deploy workflow with better logging and error handling ([2a28c16](https://github.com/tonmate/tonmate/commit/2a28c169e61aaa4fe614c2175cae80722b8cade2))

## [1.0.2](https://github.com/tonmate/tonmate/compare/v1.0.1...v1.0.2) (2025-07-18)

### Bug Fixes

* enable automatic deployment when semantic-release publishes new version ([472579d](https://github.com/tonmate/tonmate/commit/472579debe0f2e672ab6da7be745208e925107b4))

### Styles

* clean up CI/CD workflow with consistent formatting and reduced comments ([4b31d4f](https://github.com/tonmate/tonmate/commit/4b31d4f8bde1762ad4e88c79521662fcc4225fd8))

### Code Refactoring

* remove deployments-repo input and add image-name parameter to deployment workflow ([ebcd4d5](https://github.com/tonmate/tonmate/commit/ebcd4d5964161da935d96c91d7e2658136b0d6bd))
* remove redundant environment variables and workflow inputs in CI/CD pipeline ([23ed9fb](https://github.com/tonmate/tonmate/commit/23ed9fb92b4a0f03bbaa313ea523839a1c709c84))
* restructure CI/CD workflows into reusable components ([57f2e22](https://github.com/tonmate/tonmate/commit/57f2e22410e1bbd90cb42e088dbf5de6c8ff05f7))

### CI

* reorganize workflow inputs and standardize node version configuration ([a8a2506](https://github.com/tonmate/tonmate/commit/a8a25060515366e929423fee6f776e97a6a8b71f))
* simplify workflow inputs by removing unused registry and deployments-repo parameters ([3d14054](https://github.com/tonmate/tonmate/commit/3d1405425e979a65325897965da726423cff3552))
* update GitHub Actions permissions to include issues and pull requests access ([31aaae0](https://github.com/tonmate/tonmate/commit/31aaae08ebc6f787fc0fee37f908b655ccc32370))

## 1.0.0 (2025-07-18)

### Features

* add comprehensive project setup with UI components, monitoring, and deployment configs ([cbe98ae](https://github.com/tonmate/tonmate/commit/cbe98ae0db6804e8850c193ccd5767f6f5729aae))
* add Docker database commands and initial schema migration ([dcde403](https://github.com/tonmate/tonmate/commit/dcde40332db593b7c4b9028d2c4995feffc0e86c))
* add NextAuth secret configuration and environment template ([177cfb3](https://github.com/tonmate/tonmate/commit/177cfb3ed852fbf0cad7c264e9cd3ffd96b97aaa))
* add settings page with LLM provider configuration and API key management ([9bcb605](https://github.com/tonmate/tonmate/commit/9bcb605e6a052df3e5a7746f5930c660238a5b74))
* add website crawling and knowledge processing system ([4b357e9](https://github.com/tonmate/tonmate/commit/4b357e9e8ba110fc7a3469211bf1efee654caf12))
* clean Next.js implementation with modern UI ([c4e2458](https://github.com/tonmate/tonmate/commit/c4e24588db2fdb2b3e5f3bf8ff56443d33cb3474))
* implement conversation management with persistent chat history ([cdd0722](https://github.com/tonmate/tonmate/commit/cdd072298ba996700c41a8385f391839a87a16ce))
* implement universal support agent with knowledge base integration ([a13eb1f](https://github.com/tonmate/tonmate/commit/a13eb1fa905c2356421ab053b3acbc16ad452889))
* switch from cycjimmy/semantic-release-action to direct semantic-release execution ([44ba551](https://github.com/tonmate/tonmate/commit/44ba5510c148d5093b184195e63777fe72bb51f5))

### Bug Fixes

* Resolve dotenv dependency conflict for Vercel deployment ([b89474c](https://github.com/tonmate/tonmate/commit/b89474c46433408f7f05420ba707db2b7d42eb2c))
* update Docker image name and authentication token in CI/CD workflow ([a94a1e4](https://github.com/tonmate/tonmate/commit/a94a1e4991dfbf4e521ccc1090692423091e4b30))
* use personal access token for semantic-release git operations ([3c92ca8](https://github.com/tonmate/tonmate/commit/3c92ca888e609b685d663f844e50d4bf133deb6e))

### Documentation

* add comprehensive development roadmap with priorities and timelines ([5ae0c90](https://github.com/tonmate/tonmate/commit/5ae0c90da50bb16bf354bed9f8d2f2b3fcd3990b))
* add NextAuth and Prisma database integration details to README ([8775b36](https://github.com/tonmate/tonmate/commit/8775b36255e230fdc6e3d1e75269d438c767ec81))

### Code Refactoring

* migrate ESLint config from flat config to CommonJS format ([9e96d07](https://github.com/tonmate/tonmate/commit/9e96d07bb8b4a2814ee3f45b71b554b673d5ad51))
* remove SQLite support and make PostgreSQL the only database option ([6f17561](https://github.com/tonmate/tonmate/commit/6f17561445e1482fd5c5d7b27cf8e7a5158bff95))
* remove unused routes and update agent params type to Promise ([74badb5](https://github.com/tonmate/tonmate/commit/74badb523346009803e3961a3d786fb520fac7a1))
* reorganize project structure and consolidate documentation into docs folder ([d721875](https://github.com/tonmate/tonmate/commit/d7218753008e199ecca189c06b0567b20f158dcd))

### Build System

* add prisma db push to build script for schema sync ([15daa24](https://github.com/tonmate/tonmate/commit/15daa24a332e8b2c6a7fea7c5ff6448a9003f47e))

### CI

* add required permissions for GitHub container registry and security events ([0d8fb54](https://github.com/tonmate/tonmate/commit/0d8fb54ac164e7bbf1baac0d29efd9d4fde06d43))
* configure secure environment variables and document GitHub secrets setup ([97995d3](https://github.com/tonmate/tonmate/commit/97995d3d2cc503b70ffd7dd82afa7906c55e4e72))
* consolidate GitHub Actions workflows into unified pipeline ([b6f3d72](https://github.com/tonmate/tonmate/commit/b6f3d728a58d90cdf12483b62aac0a012e131867))
* grant write permissions for issues/PRs and enable semantic-release debug output ([2578fbd](https://github.com/tonmate/tonmate/commit/2578fbdfc84be9d37c4988a5f43b124facecb710))
* grant write permissions to GitHub Actions workflow for content access ([28ce0c7](https://github.com/tonmate/tonmate/commit/28ce0c7e76686346757a84b2a0bf3eeee06a3da8))
* implement semantic release with automated versioning and tagging ([75fb501](https://github.com/tonmate/tonmate/commit/75fb5011bd8f2ccb3a9cc1489026b4ef1567e39e))
* set up GitHub Actions workflows for Docker builds and VPS deployments ([196f347](https://github.com/tonmate/tonmate/commit/196f3474b6aa8b51c8e718edd5d6212fe36f0dc0))
* specify Dockerfile path in build-push-action step ([4026239](https://github.com/tonmate/tonmate/commit/402623904dab33be4139687341a4bdc6ec7fb5cd))
* update CI/CD workflow to use secrets for database and token configuration ([ceb1d8d](https://github.com/tonmate/tonmate/commit/ceb1d8d6e60f1b93f30811a92e2b83a1f70f3ea7))
* use database URL from secrets and improve migrations workflow ([a995dfb](https://github.com/tonmate/tonmate/commit/a995dfbbfd9c020eb88d133ac0402a7f51eb11f2))
