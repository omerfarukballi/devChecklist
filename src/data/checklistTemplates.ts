import { ChecklistItemTemplate } from '../types';

// Helper to create items more concisely
const createItem = (
    id: string,
    projectTypeIds: string[],
    phase: 'planning' | 'coding' | 'testing' | 'deployment' | 'scaling',
    title: string,
    priority: 'critical' | 'high' | 'medium' | 'low',
    description: string,
    details: string,
    tags: string[],
    experience: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'],
    stackSpecific?: string[]
): ChecklistItemTemplate => ({
    id,
    projectTypeIds: projectTypeIds as any[],
    phaseSpecific: [phase],
    title,
    priority,
    description,
    details,
    prompt: `I am building a ${projectTypeIds[0]} project. ${description} \n\nTask: ${title}\nContext: ${details}\n\nPlease provide a detailed implementation guide and code snippets.`,
    tags,
    estimatedMinutes: 30, // Default estimate
    experienceLevels: experience,
    stackSpecific
});

// Group IDs for easier reference
const ID_WEB = ['web-react', 'web-vue', 'web-svelte', 'web-angular', 'static-jamstack', 'wordpress', 'wordpress-plugin', 'shopify'];
const ID_MOBILE = ['mobile-rn', 'mobile-flutter', 'mobile-ios', 'mobile-android'];
const ID_DESKTOP = ['desktop-macos', 'desktop-windows', 'desktop-electron', 'desktop-tauri', 'cli-tool'];
const ID_BACKEND = ['backend-rest', 'backend-graphql', 'backend-grpc', 'microservices', 'realtime'];
const ID_AIML = ['ai-llm', 'ml-timeseries', 'ml-computer-vision', 'ml-nlp', 'ml-general', 'mlops'];
const ID_DATA = ['data-engineering', 'data-analytics', 'data-streaming', 'data-scraping'];
const ID_INFRA = ['devops', 'devops-k8s'];
const ID_OTHER = ['game', 'blockchain', 'browser-extension', 'vscode-extension', 'bot-automation', 'iot-embedded'];

const ALL_PROJECTS = [...ID_WEB, ...ID_MOBILE, ...ID_DESKTOP, ...ID_BACKEND, ...ID_AIML, ...ID_DATA, ...ID_INFRA, ...ID_OTHER];

export const CHECKLIST_TEMPLATES: ChecklistItemTemplate[] = [
    // ==================================================================================
    // WORDPRESS SITE (Specific items from user request)
    // ==================================================================================
    createItem('wp-plan-1', ['wordpress'], 'planning', 'Hosting Selection', 'critical', 'Analyze shared vs managed vs VPS hosting options.', 'Evaluate SiteGround/Kinsta for managed, DigitalOcean for VPS. Check usage limits and TTFB.', ['infra'], undefined, undefined),
    createItem('wp-plan-2', ['wordpress'], 'planning', 'wp-config.php Security', 'critical', 'Secure configuration constants.', 'Set DB_ constants, generate random AUTH_KEYs, ensure WP_DEBUG is false in production.', ['security']),
    createItem('wp-plan-3', ['wordpress'], 'planning', 'Theme Strategy', 'high', 'Decide on page builder vs custom vs block theme.', 'Elementor/Divi for speed vs Custom Theme for performance vs FSE for modern WP.', ['design']),
    createItem('wp-plan-4', ['wordpress'], 'planning', 'Essential Plugins', 'high', 'Define core plugin stack.', 'SEO (RankMath), Cache (WP Rocket), Security (Wordfence), Backup (UpdraftPlus).', ['setup']),
    createItem('wp-plan-5', ['wordpress'], 'planning', 'Child Theme', 'medium', 'Create child theme for handling updates.', 'Prevent customization loss on parent theme updates.', ['setup']),
    createItem('wp-plan-6', ['wordpress'], 'planning', 'Database Prefix', 'medium', 'Change default wp_ table prefix.', 'Change to something random like wp_x9z_ to reduce SQL injection surface.', ['security']),
    createItem('wp-plan-7', ['wordpress'], 'planning', 'SSL & HTTPS', 'critical', 'Enforce SSL in admin and frontend.', 'Add FORCE_SSL_ADMIN to wp-config.php.', ['security']),
    createItem('wp-plan-8', ['wordpress'], 'planning', 'Staging Environment', 'high', 'Setup staging environment.', 'Use WP Staging plugin or host panel staging.', ['devops']),
    createItem('wp-plan-9', ['wordpress'], 'planning', 'Media Strategy', 'medium', 'Define image sizes and optimization.', 'Use add_image_size(), lazy load, and WebP conversion.', ['performance']),
    createItem('wp-plan-10', ['wordpress'], 'planning', 'Firewall (WAF)', 'high', 'Setup Cloudflare or host WAF.', 'Cloudflare free tier + WAF rules to block malicious traffic.', ['security']),
    createItem('wp-plan-11', ['wordpress'], 'planning', 'SMTP Setup', 'medium', 'Configure reliable email delivery.', 'Use WP Mail SMTP with SendGrid or Mailgun, avoid PHP mail().', ['infra']),
    createItem('wp-plan-12', ['wordpress'], 'planning', 'GDPR Compliance', 'medium', 'Setup privacy policy and cookie banner.', 'Ensure forms have consent checkboxes and privacy policy is accessible.', ['legal']),

    createItem('wp-code-1', ['wordpress'], 'coding', 'functions.php Structure', 'medium', 'Organize functions.php efficiently.', 'Use require_once to split logic into enqueue.php, hooks.php, shortcodes.php.', ['architecture']),
    createItem('wp-code-2', ['wordpress'], 'coding', 'Custom Post Types', 'high', 'Register CPTs for custom content.', 'Use register_post_type() with proper labels, supports, and rewrite rules.', ['backend']),
    createItem('wp-code-3', ['wordpress'], 'coding', 'Custom Taxonomies', 'medium', 'Register custom taxonomies.', 'Use register_taxonomy() - decide between hierarchical (cat) vs tag-style.', ['backend']),
    createItem('wp-code-4', ['wordpress'], 'coding', 'ACF JSON Sync', 'high', 'Version control ACF fields.', 'Enable ACF Local JSON to sync field group settings via git.', ['tooling']),
    createItem('wp-code-5', ['wordpress'], 'coding', 'WP_Query Optimization', 'high', 'Optimize custom queries.', 'Use pre_get_posts hook instead of new WP_Query() in templates where possible.', ['performance']),
    createItem('wp-code-6', ['wordpress'], 'coding', 'Asset Enqueueing', 'medium', 'Properly load scripts and styles.', 'Use wp_enqueue_scripts, versioning, and conditional loading via is_singular().', ['frontend']),
    createItem('wp-code-7', ['wordpress'], 'coding', 'Shortcode System', 'low', 'Develop custom shortcodes.', 'Use add_shortcode(), sanitize input attributes, output via wp_kses.', ['backend']),
    createItem('wp-code-8', ['wordpress'], 'coding', 'REST API Endpoints', 'high', 'Create custom API endpoints.', 'Use register_rest_route() with permission_callback and validation.', ['api']),
    createItem('wp-code-9', ['wordpress'], 'coding', 'Nonce Security', 'critical', 'Implement nonce checks.', 'Use wp_nonce_field() in forms and wp_verify_nonce() in processing logic.', ['security']),
    createItem('wp-code-10', ['wordpress'], 'coding', 'Transient Caching', 'high', 'Cache expensive operations.', 'Use set_transient() / get_transient() for external API calls or complex queries.', ['performance']),
    createItem('wp-code-11', ['wordpress'], 'coding', 'Custom Walker', 'medium', 'Customize menu output.', 'Extend Walker_Nav_Menu to create BEM-compatible or custom HTML menus.', ['frontend']),
    createItem('wp-code-12', ['wordpress'], 'coding', 'Custom Blocks', 'high', 'Create Gutenberg blocks.', 'Use @wordpress/scripts and block.json for modern block development.', ['frontend']),
    createItem('wp-code-13', ['wordpress'], 'coding', 'Query Optimization', 'high', 'Avoid slow meta queries.', 'Optimize pre_get_posts and avoid complex meta_query joins.', ['performance']),
    createItem('wp-code-14', ['wordpress'], 'coding', 'Multisite Config', 'medium', 'Configure multisite if needed.', 'Set wp-config constants for subdomain vs subdirectory.', ['infra']),

    createItem('wp-test-1', ['wordpress'], 'testing', 'WP-CLI Testing', 'medium', 'Test migration scripts with WP-CLI.', 'Use wp db export and wp search-replace on staging.', ['tooling']),
    createItem('wp-test-2', ['wordpress'], 'testing', 'Plugin Conflict Test', 'medium', 'Check for plugin conflicts.', 'Disable all plugins, enable one by one to isolate issues.', ['qa']),
    createItem('wp-test-3', ['wordpress'], 'testing', 'Query Monitor', 'high', 'Debug database queries.', 'Use Query Monitor plugin to find slow queries and hook failures.', ['performance']),
    createItem('wp-test-4', ['wordpress'], 'testing', 'PageSpeed Insights', 'high', 'Measure Core Web Vitals.', 'Aim for LCP < 2.5s, FID < 100ms, CLS < 0.1.', ['performance']),
    createItem('wp-test-5', ['wordpress'], 'testing', 'Broken Links', 'low', 'Scanning for 404s.', 'Use wp broken-link-checker or Screaming Frog.', ['qa']),
    createItem('wp-test-6', ['wordpress'], 'testing', 'Cross-browser Test', 'medium', 'Verify UI on browsers.', 'Test Chrome, Firefox, Safari, Edge - check CSS grid/flex compatibility.', ['ui']),
    createItem('wp-test-7', ['wordpress'], 'testing', 'Mobile Responsiveness', 'high', 'Check mobile view.', 'Use Chrome DevTools device mode and real devices.', ['ui']),
    createItem('wp-test-8', ['wordpress'], 'testing', 'WooCommerce Flow', 'critical', 'Test checkout process.', 'Test add to cart, checkout, payment gateway (sandbox), email receipt.', ['ecommerce']),
    createItem('wp-test-9', ['wordpress'], 'testing', 'Accessibility', 'medium', 'Check a11y compliance.', 'Use axe browser extension, check alt text and keyboard nav.', ['accessibility']),
    createItem('wp-test-10', ['wordpress'], 'testing', 'Security Scan', 'critical', 'Scan for vulnerabilities.', 'Run Wordfence scan and check wp-admin access logs.', ['security']),

    createItem('wp-deploy-1', ['wordpress'], 'deployment', 'Staging to Prod', 'critical', 'Migrate database correctly.', 'Run wp search-replace staging.url prod.url --dry-run first.', ['devops']),
    createItem('wp-deploy-2', ['wordpress'], 'deployment', 'Production Config', 'critical', 'Harden wp-config.php.', 'Set WP_DEBUG false, DISALLOW_FILE_EDIT true, DISALLOW_FILE_MODS true.', ['security']),
    createItem('wp-deploy-3', ['wordpress'], 'deployment', 'htaccess Rules', 'high', 'Secure .htaccess.', 'Block xmlrpc.php, prevent directory browsing, protect wp-config.php.', ['security']),
    createItem('wp-deploy-4', ['wordpress'], 'deployment', 'Cache & CDN', 'high', 'Enable caching layers.', 'Activate cache plugin and connect CDN (Cloudflare/BunnyCDN).', ['performance']),
    createItem('wp-deploy-5', ['wordpress'], 'deployment', 'DB Optimization', 'medium', 'Clean up database.', 'Run wp db optimize, remove revisions.', ['maintenance']),
    createItem('wp-deploy-6', ['wordpress'], 'deployment', 'Backup Automation', 'critical', 'Ensure backups run.', 'Verify daily DB and weekly full backups to off-site storage.', ['infra']),
    createItem('wp-deploy-7', ['wordpress'], 'deployment', 'Uptime Monitor', 'medium', 'Setup downtime alerts.', 'Configure UptimeRobot or Better Uptime.', ['monitoring']),
    createItem('wp-deploy-8', ['wordpress'], 'deployment', 'Robots & Sitemap', 'high', 'SEO housekeeping.', 'Check robots.txt and submit XML sitemap to Search Console.', ['seo']),
    createItem('wp-deploy-9', ['wordpress'], 'deployment', 'SSL Auto-renew', 'high', 'Verify Let\'s Encrypt.', 'Ensure cron job for SSL renewal is active.', ['security']),
    createItem('wp-deploy-10', ['wordpress'], 'deployment', 'Admin URL', 'medium', 'Hide login page.', 'Change wp-admin URL to reduce brute force attacks.', ['security']),

    // ==================================================================================
    // macOS App (Specific Items)
    // ==================================================================================
    createItem('mac-plan-1', ['desktop-macos'], 'planning', 'Tech Stack Decision', 'critical', 'Choose between Native vs Electron vs Tauri.', 'Compare performance, binary size, and distribution complexity.', ['arch']),
    createItem('mac-plan-2', ['desktop-macos'], 'planning', 'Target macOS Version', 'high', 'Define deployment target.', 'Minimum macOS 13 (Ventura) vs 14 (Sonoma) based on API needs.', ['setup']),
    createItem('mac-plan-3', ['desktop-macos'], 'planning', 'App Sandbox', 'critical', 'Configure entitlements.plist.', 'Define file access, network, camera/mic permissions early.', ['security']),
    createItem('mac-plan-4', ['desktop-macos'], 'planning', 'Distribution Channel', 'high', 'App Store vs Direct.', 'Understand Notarization requirements for both.', ['release']),
    createItem('mac-plan-5', ['desktop-macos'], 'planning', 'Apple Developer Program', 'critical', 'Setup developer account.', 'Get Team ID, provisioning profiles, and certificates ready.', ['setup']),
    createItem('mac-plan-6', ['desktop-macos'], 'planning', 'UI Framework', 'high', 'SwiftUI vs AppKit.', 'SwiftUI for modern declaritive UI, AppKit if deep system integration needed.', ['ui']),
    createItem('mac-code-1', ['desktop-macos'], 'coding', 'Main App Structure', 'high', 'Setup @main entry.', 'Define WindowGroup and Settings scene.', ['arch']),
    createItem('mac-code-2', ['desktop-macos'], 'coding', 'Navigation Layout', 'medium', 'Implement 3-column layout.', 'Use NavigationSplitView for sidebar-detail pattern.', ['ui']),
    createItem('mac-code-3', ['desktop-macos'], 'coding', 'State Management', 'high', 'Choose state strategy.', 'StateObject vs ObservableObject vs EnvironmentObject usage.', ['arch']),
    createItem('mac-code-4', ['desktop-macos'], 'coding', 'Core Data / SwiftData', 'high', 'Setup persistence.', 'Configure NSPersistentCloudKitContainer for iCloud sync.', ['backend']),
    createItem('mac-code-5', ['desktop-macos'], 'coding', 'Menu Bar Extra', 'medium', 'Create menu bar utility.', 'Use MenuBarExtra API for status bar presence.', ['ui']),
    createItem('mac-code-6', ['desktop-macos'], 'coding', 'File System Access', 'critical', 'Handle sandboxed files.', 'Use Security-Scoped Bookmarks for persistent file access.', ['security']),
    createItem('mac-test-1', ['desktop-macos'], 'testing', 'Instruments Profiling', 'high', 'Profile performance.', 'Use Time Profiler and Leaks instruments.', ['performance']),
    createItem('mac-test-2', ['desktop-macos'], 'testing', 'Notarization Test', 'critical', 'Test distribution flow.', 'Run xcrun notarytool submit to verify signing.', ['release']),
    createItem('mac-deploy-1', ['desktop-macos'], 'deployment', 'DMG Creation', 'medium', 'Package app.', 'Use create-dmg tool with background image.', ['release']),
    createItem('mac-deploy-2', ['desktop-macos'], 'deployment', 'App Store Connect', 'high', 'Prepare metadata.', 'Screenshots for MacBook Pro 14" and 16".', ['release']),

    // ==================================================================================
    // Time Series (Specific Items)
    // ==================================================================================
    createItem('ts-plan-1', ['ml-timeseries'], 'planning', 'Problem Definition', 'critical', 'Define forecast horizon and granularity.', 'Single-step vs Multi-step, Point vs Probabilistic.', ['datascience']),
    createItem('ts-plan-2', ['ml-timeseries'], 'planning', 'Frequency Analysis', 'high', 'Analyze data frequency.', 'Check for irregular vs regular intervals, plan resampling.', ['datascience']),
    createItem('ts-plan-3', ['ml-timeseries'], 'planning', 'Metric Selection', 'medium', 'Choose error metric.', 'MAE vs RMSE vs MASE (for scale independence).', ['datascience']),
    createItem('ts-code-1', ['ml-timeseries'], 'coding', 'Data Loader', 'medium', 'Load and index data.', 'Set pd.DatetimeIndex and frequency.', ['data']),
    createItem('ts-code-2', ['ml-timeseries'], 'coding', 'Missing Values', 'high', 'Handle gaps.', 'Identify missing timestamps, use interpolation or fill strategies.', ['data']),
    createItem('ts-code-3', ['ml-timeseries'], 'coding', 'Stationarity', 'high', 'Check stationarity.', 'Run ADF test, apply differencing or log transform.', ['datascience']),
    createItem('ts-code-4', ['ml-timeseries'], 'coding', 'Feature Engineering', 'critical', 'Create lag features.', 'Generate lags, rolling means, and seasonality flags.', ['datascience']),
    createItem('ts-code-5', ['ml-timeseries'], 'coding', 'Split Strategy', 'critical', 'Time-based split.', 'NEVER shuffle. Use TimeSeriesSplit.', ['data']),
    createItem('ts-code-6', ['ml-timeseries'], 'coding', 'Model: ARIMA', 'high', 'Implement ARIMA/SARIMA.', 'Use auto_arima for parameter search.', ['ml']),
    createItem('ts-code-7', ['ml-timeseries'], 'coding', 'Model: Prophet', 'medium', 'Implement Prophet.', 'Configure seasonality and holidays.', ['ml']),
    createItem('ts-test-1', ['ml-timeseries'], 'testing', 'Walk-forward Validation', 'critical', 'Backtest correctly.', 'Expand train window, keep test window fixed.', ['testing']),
    createItem('ts-test-2', ['ml-timeseries'], 'testing', 'Residual Analysis', 'high', 'Check residuals.', 'Ljung-Box test for autocorrelation.', ['testing']),
    createItem('ts-deploy-1', ['ml-timeseries'], 'deployment', 'Model Serialization', 'medium', 'Save model.', 'Use joblib or mlflow.', ['ops']),
    createItem('ts-deploy-2', ['ml-timeseries'], 'deployment', 'API Endpoint', 'high', 'Serve predictions.', 'FastAPI endpoint with Pydantic validation.', ['api']),

    // ==================================================================================
    // CLI Tool (Specific Items)
    // ==================================================================================
    createItem('cli-plan-1', ['cli-tool'], 'planning', 'Language Decision', 'high', 'Python vs Go vs Rust.', 'Evaluate startup time and distribution (single binary vs pip).', ['arch']),
    createItem('cli-plan-2', ['cli-tool'], 'planning', 'Interface Design', 'medium', 'Design command structure.', 'Subcommands (git style) or flags?', ['ux']),
    createItem('cli-plan-3', ['cli-tool'], 'planning', 'Config Hierarchy', 'medium', 'Plan config loading.', 'Env vars > Local Config > Global Config > Defaults.', ['arch']),
    createItem('cli-code-1', ['cli-tool'], 'coding', 'Entry Point', 'high', 'Setup CLI framework.', 'Click/Typer for Python, Cobra for Go, Clap for Rust.', ['code']),
    createItem('cli-code-2', ['cli-tool'], 'coding', 'Rich Output', 'medium', 'Enhance terminal output.', 'Use Rich/Lipgloss for tables and colors.', ['ux']),
    createItem('cli-code-3', ['cli-tool'], 'coding', 'Progress Feedback', 'medium', 'Add spinners/bars.', 'Indicate long running processes.', ['ux']),
    createItem('cli-code-4', ['cli-tool'], 'coding', 'Signal Handling', 'high', 'Handle Ctrl+C.', 'Graceful shutdown on SIGINT.', ['code']),
    createItem('cli-test-1', ['cli-tool'], 'testing', 'Integration Tests', 'high', 'Test CLI commands.', 'Use testscript or pytest with CliRunner.', ['testing']),
    createItem('cli-deploy-1', ['cli-tool'], 'deployment', 'Cross-compile', 'high', 'Build for OS/Arch.', 'Generate binaries for Linux/Mac/Windows.', ['release']),
    createItem('cli-deploy-2', ['cli-tool'], 'deployment', 'Homebrew Tap', 'medium', 'Create formula.', 'Distribute via brew tap.', ['release']),

    // ==================================================================================
    // Microservices (Specific Items)
    // ==================================================================================
    createItem('ms-plan-1', ['microservices'], 'planning', 'Bounded Contexts', 'critical', 'Define service boundaries.', 'Ensure loose coupling and high cohesion based on DDD.', ['arch']),
    createItem('ms-plan-2', ['microservices'], 'planning', 'Communication Style', 'high', 'Sync vs Async.', 'REST/gRPC for queries, Kafka/RabbitMQ for state changes.', ['arch']),
    createItem('ms-plan-3', ['microservices'], 'planning', 'API Gateway', 'high', 'Select Gateway.', 'Kong or Nginx for routing and auth.', ['infra']),
    createItem('ms-code-1', ['microservices'], 'coding', 'Proto Definitions', 'high', 'Define gRPC contracts.', 'Write .proto files and generate code.', ['code']),
    createItem('ms-code-2', ['microservices'], 'coding', 'Docker Config', 'high', 'Containerize services.', 'Write Dockerfiles and docker-compose.yml.', ['devops']),
    createItem('ms-code-3', ['microservices'], 'coding', 'Health Checks', 'high', 'Implement probes.', 'Liveness and Readiness probes for K8s.', ['ops']),
    createItem('ms-code-4', ['microservices'], 'coding', 'Circuit Breaker', 'medium', 'Resilience.', 'Implement resilience4j or similar.', ['code']),
    createItem('ms-deploy-1', ['microservices'], 'deployment', 'CI Pipelines', 'critical', 'Automate build.', 'Independent CI/CD for each service.', ['devops']),
    createItem('ms-deploy-2', ['microservices'], 'deployment', 'Helm Charts', 'high', 'Templatize manifests.', 'Create Helm charts for deployment.', ['devops']),
    createItem('ms-scale-1', ['microservices'], 'scaling', 'Autoscaling', 'high', 'Configure HPA.', 'Scale pods based on CPU/Memory.', ['ops']),

    // ==================================================================================
    // Data Streaming (Specific Items)
    // ==================================================================================
    createItem('ds-plan-1', ['data-streaming'], 'planning', 'Topic Design', 'critical', 'Plan Kafka topics.', 'Determine partition count based on throughput.', ['arch']),
    createItem('ds-plan-2', ['data-streaming'], 'planning', 'Semantics', 'high', 'Delivery guarantees.', 'At-least-once vs Exactly-once.', ['arch']),
    createItem('ds-code-1', ['data-streaming'], 'coding', 'Producer Config', 'high', 'Optimize producer.', 'Compression (snappy/lz4), linger.ms, batch.size.', ['code']),
    createItem('ds-code-2', ['data-streaming'], 'coding', 'Consumer Logic', 'high', 'Handle consumption.', 'Commit strategies (sync vs async), rebalance listeners.', ['code']),
    createItem('ds-code-3', ['data-streaming'], 'coding', 'Stream Processing', 'high', 'Process events.', 'Flink/Kafka Streams logic, windowing.', ['code']),
    createItem('ds-deploy-1', ['data-streaming'], 'deployment', 'Schema Registry', 'critical', 'Manage schemas.', 'Deploy and configure Schema Registry.', ['infra']),
    createItem('ds-deploy-2', ['data-streaming'], 'deployment', 'Connectors', 'high', 'Setup Kafka Connect.', 'Sinks (S3/DB) and Sources.', ['infra']),

    // ==================================================================================
    // WEB — PLANNING (all web types)
    // ==================================================================================
    ...ID_WEB.map(t => createItem(`web-plan-comp-${t}`, [t], 'planning', 'Component Architecture', 'high', 'Plan component hierarchy and ownership.', 'Draw out the full component tree. Identify stateful vs stateless components, where context lives, and how data flows down via props.', ['design', 'arch'])),
    ...ID_WEB.map(t => createItem(`web-plan-routing-${t}`, [t], 'planning', 'Routing Strategy', 'high', 'Define all app routes.', 'Plan URL parameters, nested routes, lazy-loaded routes, and auth guards. Document route → component mapping.', ['design'])),
    ...ID_WEB.map(t => createItem(`web-plan-state-${t}`, [t], 'planning', 'State Management', 'high', 'Choose state solution.', 'Local state (useState) vs global (Zustand/Redux/Jotai). Map out which data is global vs local vs server state.', ['arch'])),
    ...ID_WEB.map(t => createItem(`web-plan-api-${t}`, [t], 'planning', 'API Integration Plan', 'high', 'Define API communication layer.', 'REST vs GraphQL. Choose fetch/Axios/TanStack Query. Plan standard headers (Auth token), error handling, and retry logic.', ['arch'])),
    ...ID_WEB.map(t => createItem(`web-plan-auth-${t}`, [t], 'planning', 'Authentication Strategy', 'critical', 'Plan auth flow.', 'JWT vs Session vs OAuth. Cookie storage (HttpOnly) vs localStorage. Define refresh token strategy and protected routes.', ['security'])),
    ...ID_WEB.map(t => createItem(`web-plan-design-${t}`, [t], 'planning', 'Design System & Tokens', 'medium', 'Define design tokens.', 'Colors, typography scale, spacing, breakpoints. Choose component library (shadcn, MUI, Ant) or custom design system.', ['design'])),
    ...ID_WEB.map(t => createItem(`web-plan-seo-${t}`, [t], 'planning', 'SEO & Meta Strategy', 'medium', 'Plan SEO requirements.', 'SSR vs SSG vs CSR trade-offs. Define meta tags, OG images, sitemap, robots.txt, and structured data needs.', ['seo'])),
    ...ID_WEB.map(t => createItem(`web-plan-perf-${t}`, [t], 'planning', 'Performance Budget', 'medium', 'Set performance targets.', 'Define Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1. Plan lazy loading, image optimization, and critical CSS.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-plan-env-${t}`, [t], 'planning', 'Environment Config', 'high', 'Plan environment variables.', 'Define .env structure for local/staging/prod. Never commit secrets. Use vault or CI secrets for production.', ['security', 'devops'])),
    ...ID_WEB.map(t => createItem(`web-plan-a11y-${t}`, [t], 'planning', 'Accessibility Requirements', 'medium', 'Plan a11y compliance.', 'Define WCAG 2.1 AA targets. Plan for keyboard navigation, screen reader support, color contrast ratios.', ['accessibility'])),

    // ==================================================================================
    // WEB — CODING
    // ==================================================================================
    ...ID_WEB.map(t => createItem(`web-code-layout-${t}`, [t], 'coding', 'Global Layout Component', 'high', 'Implement main layout.', 'Build persistent header, footer, sidebar. Handle responsive breakpoints. Integrate navigation with active link states.', ['frontend'])),
    ...ID_WEB.map(t => createItem(`web-code-auth-${t}`, [t], 'coding', 'Auth Implementation', 'critical', 'Implement login/logout flows.', 'Token storage in HttpOnly cookies. Protect routes. Implement refresh token rotation. Handle 401 globally in API client.', ['security'])),
    ...ID_WEB.map(t => createItem(`web-code-forms-${t}`, [t], 'coding', 'Form Handling & Validation', 'high', 'Build forms with validation.', 'Use React Hook Form or Formik. Zod/Yup schema validation. Show inline errors. Disable submit on invalid state.', ['frontend'])),
    ...ID_WEB.map(t => createItem(`web-code-apiclient-${t}`, [t], 'coding', 'API Client Layer', 'high', 'Build centralized API client.', 'Axios instance with interceptors or TanStack Query setup. Global error handling, loading states, and auth header injection.', ['arch'])),
    ...ID_WEB.map(t => createItem(`web-code-errorboundary-${t}`, [t], 'coding', 'Error Boundaries & 404', 'high', 'Handle UI errors gracefully.', 'React Error Boundary for component crashes. Custom 404/500 pages. Toast notifications for API errors.', ['reliability'])),
    ...ID_WEB.map(t => createItem(`web-code-dark-${t}`, [t], 'coding', 'Dark Mode Support', 'medium', 'Implement theme switching.', 'CSS variables for color tokens. Persist preference in localStorage. Respect prefers-color-scheme media query.', ['ui'])),
    ...ID_WEB.map(t => createItem(`web-code-i18n-${t}`, [t], 'coding', 'Internationalization', 'low', 'Setup i18n if needed.', 'i18next or next-intl. Extract all strings to translation files. Handle RTL layout for Arabic/Hebrew.', ['i18n'])),
    ...ID_WEB.map(t => createItem(`web-code-images-${t}`, [t], 'coding', 'Image Optimization', 'medium', 'Optimize image delivery.', 'Use next/image or similar. Serve WebP with fallback. Implement lazy loading and responsive srcset.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-code-security-${t}`, [t], 'coding', 'Security Headers & CSP', 'high', 'Implement security headers.', 'Content-Security-Policy, X-Frame-Options, HSTS. Sanitize user input. Prevent XSS with DOMPurify. CSRF protection.', ['security'])),
    ...ID_WEB.map(t => createItem(`web-code-loading-${t}`, [t], 'coding', 'Loading & Skeleton States', 'medium', 'Handle async loading UI.', 'Skeleton screens instead of spinners for content. Use Suspense boundaries. Optimistic updates for mutations.', ['ux'])),

    // ==================================================================================
    // WEB — TESTING
    // ==================================================================================
    ...ID_WEB.map(t => createItem(`web-test-unit-${t}`, [t], 'testing', 'Unit Tests for Utilities', 'high', 'Test pure functions and hooks.', 'Vitest or Jest for utility functions, custom hooks, and store logic. Aim for >80% coverage on business logic.', ['testing'])),
    ...ID_WEB.map(t => createItem(`web-test-comp-${t}`, [t], 'testing', 'Component Testing', 'high', 'Test UI components.', 'React Testing Library. Test user interactions, not implementation details. Mock API calls with MSW.', ['testing'])),
    ...ID_WEB.map(t => createItem(`web-test-e2e-${t}`, [t], 'testing', 'E2E Tests (Playwright/Cypress)', 'high', 'Automate critical user flows.', 'Test signup, login, and main user journeys. Run against staging environment in CI pipeline.', ['testing'])),
    ...ID_WEB.map(t => createItem(`web-test-a11y-${t}`, [t], 'testing', 'Accessibility Testing', 'medium', 'Automated a11y audit.', 'axe-core via @axe-core/react or Playwright axe plugin. Fix all critical violations. Manual keyboard-nav test.', ['accessibility'])),
    ...ID_WEB.map(t => createItem(`web-test-perf-${t}`, [t], 'testing', 'Lighthouse / Web Vitals', 'medium', 'Performance auditing.', 'Run Lighthouse CI in pipeline. Track Core Web Vitals regressions. Budget fails if score drops.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-test-crossbrowser-${t}`, [t], 'testing', 'Cross-browser Testing', 'medium', 'Verify browser compatibility.', 'Test Chrome, Firefox, Safari, Edge. Use Browserstack for real devices. Check CSS grid, flex, and JS API compatibility.', ['qa'])),

    // ==================================================================================
    // WEB — DEPLOYMENT
    // ==================================================================================
    ...ID_WEB.map(t => createItem(`web-deploy-bundle-${t}`, [t], 'deployment', 'Bundle Analysis', 'high', 'Audit bundle size.', 'Use webpack-bundle-analyzer or vite rollup visualizer. Split vendor chunks. Lazy-load routes and heavy components.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-deploy-ci-${t}`, [t], 'deployment', 'CI/CD Pipeline', 'critical', 'Automate build and deploy.', 'GitHub Actions / GitLab CI: lint → test → build → deploy. Block merge on test failures. Deploy preview for PRs.', ['devops'])),
    ...ID_WEB.map(t => createItem(`web-deploy-cdn-${t}`, [t], 'deployment', 'CDN & Caching Strategy', 'high', 'Configure asset caching.', 'Static assets on CDN with long max-age and content hashing. HTML: no-cache or short TTL. Cloudflare/Vercel edge.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-deploy-env-${t}`, [t], 'deployment', 'Secrets & Env Vars', 'critical', 'Secure production config.', 'No secrets in code or git. Use Vercel/Netlify env vars or Vault. Audit .env.example to ensure no real values committed.', ['security'])),
    ...ID_WEB.map(t => createItem(`web-deploy-monitor-${t}`, [t], 'deployment', 'Error Monitoring', 'high', 'Setup Sentry or similar.', 'Sentry for error tracking. Source maps uploaded for readable stack traces. Alert on new error types.', ['monitoring'])),
    ...ID_WEB.map(t => createItem(`web-deploy-seo-final-${t}`, [t], 'deployment', 'SEO Final Checks', 'medium', 'Verify SEO setup.', 'Check robots.txt, sitemap.xml, canonical tags. Submit sitemap to Google Search Console. Verify OG tags with Social Preview tools.', ['seo'])),

    // ==================================================================================
    // WEB — SCALING
    // ==================================================================================
    ...ID_WEB.map(t => createItem(`web-scale-caching-${t}`, [t], 'scaling', 'API Response Caching', 'high', 'Cache expensive API responses.', 'Redis for server-side caching. TanStack Query stale-while-revalidate on client. Define cache invalidation strategy.', ['performance'])),
    ...ID_WEB.map(t => createItem(`web-scale-analytics-${t}`, [t], 'scaling', 'Analytics & Tracking', 'medium', 'Instrument user behavior.', 'Plausible/PostHog for privacy-friendly analytics. Track key funnel events. A/B testing setup if needed.', ['analytics'])),
    ...ID_WEB.map(t => createItem(`web-scale-loadtest-${t}`, [t], 'scaling', 'Load Testing', 'medium', 'Stress test the system.', 'k6 or Artillery for load testing. Define RPS targets. Find bottlenecks before traffic spikes.', ['performance'])),

    // ==================================================================================
    // MOBILE — PLANNING
    // ==================================================================================
    ...ID_MOBILE.map(t => createItem(`mob-plan-nav-${t}`, [t], 'planning', 'Navigation Architecture', 'high', 'Design screen flow.', 'Map out all screens. Decide stack vs tab vs drawer navigators. Define deep link URL scheme and universal links.', ['design'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-perms-${t}`, [t], 'planning', 'Native Permissions Plan', 'critical', 'List and justify permissions.', 'Camera, Microphone, Location (always/in-use), Contacts, Push Notifications. Plan rationale strings for OS permission dialogs.', ['setup'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-state-${t}`, [t], 'planning', 'State & Data Strategy', 'high', 'Plan state management.', 'Global state (Zustand/Redux), local state, and server state (TanStack Query). AsyncStorage vs SQLite for local persistence.', ['arch'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-offlinefirst-${t}`, [t], 'planning', 'Offline-first Strategy', 'high', 'Design for offline use.', 'WatermelonDB or SQLite for offline-first. Define sync strategy when connectivity returns. Handle conflict resolution.', ['reliability'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-push-${t}`, [t], 'planning', 'Push Notification Strategy', 'medium', 'Plan notification flow.', 'Firebase Cloud Messaging (FCM) or APNs direct. Define notification categories, deep links, and opt-in timing.', ['engagement'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-platform-${t}`, [t], 'planning', 'Platform Differences', 'high', 'Document iOS vs Android gaps.', 'Map APIs that behave differently. SafeArea, keyboard behavior, back button, file picker, date picker. Plan platform-specific code.', ['setup'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-store-${t}`, [t], 'planning', 'App Store Requirements', 'high', 'Review store guidelines.', 'Apple App Review guidelines + Google Play policies. Check content rating, privacy nutrition label, in-app purchase rules.', ['release'])),
    ...ID_MOBILE.map(t => createItem(`mob-plan-analytics-${t}`, [t], 'planning', 'Analytics & Crash Tracking', 'medium', 'Plan observability.', 'Firebase Analytics for events + Crashlytics for crash reports. Define key events to track (onboarding, conversion, retention).', ['analytics'])),

    // ==================================================================================
    // MOBILE — CODING
    // ==================================================================================
    ...ID_MOBILE.map(t => createItem(`mob-code-screens-${t}`, [t], 'coding', 'Core Screen Components', 'high', 'Build all main screens.', 'Implement screens with SafeAreaView, KeyboardAvoidingView, ScrollView. Handle gesture navigation and transitions.', ['ui'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-storage-${t}`, [t], 'coding', 'Local Storage Layer', 'high', 'Implement persistence.', 'AsyncStorage for simple KV, SQLite/WatermelonDB for complex data. Abstract storage behind a repository pattern.', ['data'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-network-${t}`, [t], 'coding', 'Network Layer & Offline', 'high', 'Handle connectivity.', 'NetInfo for connectivity detection. Queue failed requests. Show offline banner. Retry on reconnect.', ['reliability'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-auth-${t}`, [t], 'coding', 'Authentication Flow', 'critical', 'Implement auth screens.', 'Login, signup, forgot password, biometric auth (Face ID/Fingerprint). Secure token in SecureStore/Keychain.', ['security'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-push-${t}`, [t], 'coding', 'Push Notification Handling', 'medium', 'Implement push flow.', 'FCM/APNs token registration. Handle foreground, background, and terminated state notifications. Deep link on tap.', ['engagement'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-perf-${t}`, [t], 'coding', 'Performance Optimization', 'high', 'Optimize list and render perf.', 'FlatList with getItemLayout. React.memo, useCallback, useMemo. Avoid anonymous functions in render. Use Flipper profiler.', ['performance'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-animation-${t}`, [t], 'coding', 'Animations & Gestures', 'medium', 'Polish with animations.', 'Reanimated 3 for smooth 60fps animations on UI thread. Gesture Handler for swipe/pan. Shared element transitions.', ['ux'])),
    ...ID_MOBILE.map(t => createItem(`mob-code-deeplink-${t}`, [t], 'coding', 'Deep Linking', 'medium', 'Handle URL deep links.', 'Configure URL scheme (myapp://) and universal links (https://). Parse params and navigate to correct screen.', ['engagement'])),

    // ==================================================================================
    // MOBILE — TESTING
    // ==================================================================================
    ...ID_MOBILE.map(t => createItem(`mob-test-unit-${t}`, [t], 'testing', 'Unit Tests', 'high', 'Test business logic.', 'Jest for utility functions, stores, and hooks. Mock native modules with jest-expo or jest-react-native.', ['testing'])),
    ...ID_MOBILE.map(t => createItem(`mob-test-e2e-${t}`, [t], 'testing', 'E2E Tests (Detox/Maestro)', 'high', 'Automate critical flows.', 'Detox or Maestro for E2E on simulator + real device. Test onboarding, login, and core user journey.', ['testing'])),
    ...ID_MOBILE.map(t => createItem(`mob-test-device-${t}`, [t], 'testing', 'Real Device Testing', 'critical', 'Test on physical devices.', 'Test on low-end Android and old iOS devices. Check performance, memory, and battery drain on real hardware.', ['qa'])),
    ...ID_MOBILE.map(t => createItem(`mob-test-accessibility-${t}`, [t], 'testing', 'Accessibility Testing', 'medium', 'VoiceOver & TalkBack.', 'Enable VoiceOver (iOS) and TalkBack (Android). Test all interactive elements. Add accessibilityLabel, accessibilityHint.', ['accessibility'])),

    // ==================================================================================
    // MOBILE — DEPLOYMENT
    // ==================================================================================
    ...ID_MOBILE.map(t => createItem(`mob-deploy-assets-${t}`, [t], 'deployment', 'App Icons & Splash Screen', 'high', 'Generate all required assets.', 'iOS: 1024x1024 icon. Android: adaptive icon (foreground + background). Splash screen for all screen sizes.', ['design'])),
    ...ID_MOBILE.map(t => createItem(`mob-deploy-signing-${t}`, [t], 'deployment', 'Code Signing & Certificates', 'critical', 'Configure signing for store.', 'iOS: Provisioning profile + Distribution certificate. Android: Keystore file. Store keystore safely — losing it means new app.', ['release'])),
    ...ID_MOBILE.map(t => createItem(`mob-deploy-ci-${t}`, [t], 'deployment', 'CI/CD (EAS/Fastlane)', 'high', 'Automate builds and uploads.', 'EAS Build for Expo apps. Fastlane for native. Automate TestFlight + Play Console internal track uploads.', ['devops'])),
    ...ID_MOBILE.map(t => createItem(`mob-deploy-storemeta-${t}`, [t], 'deployment', 'Store Listing & Metadata', 'high', 'Prepare store presence.', 'Screenshots (all required sizes), preview video, keyword-rich description, support URL, privacy policy URL.', ['marketing'])),
    ...ID_MOBILE.map(t => createItem(`mob-deploy-review-${t}`, [t], 'deployment', 'App Store Review Prep', 'high', 'Prepare for review.', 'Ensure demo account info for reviewers. Remove all debug code. Test exact binary submitted. Check content guidelines.', ['release'])),

    // ==================================================================================
    // MOBILE — SCALING
    // ==================================================================================
    ...ID_MOBILE.map(t => createItem(`mob-scale-crash-${t}`, [t], 'scaling', 'Crash Monitoring', 'critical', 'Track production crashes.', 'Firebase Crashlytics for real-time crash reports. Sentry for symbolicated stack traces. Alert on crash-free sessions drop.', ['monitoring'])),
    ...ID_MOBILE.map(t => createItem(`mob-scale-ota-${t}`, [t], 'scaling', 'OTA Updates', 'medium', 'Push JS updates without store review.', 'Expo Updates or CodePush for over-the-air updates. Define rollout strategy (% rollout). Monitor update adoption rate.', ['devops'])),
    ...ID_MOBILE.map(t => createItem(`mob-scale-ab-${t}`, [t], 'scaling', 'A/B Testing', 'medium', 'Experiment on features.', 'Firebase Remote Config or PostHog for feature flags and A/B experiments. Define success metrics before running.', ['analytics'])),

    // ==================================================================================
    // BACKEND — PLANNING
    // ==================================================================================
    ...ID_BACKEND.map(t => createItem(`be-plan-schema-${t}`, [t], 'planning', 'Database Schema Design', 'critical', 'Design ER diagram.', 'Normalize tables (3NF). Define PKs, FKs, indexes. Choose PostgreSQL for relational, MongoDB for document, Redis for cache.', ['db'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-api-${t}`, [t], 'planning', 'API Contract (OpenAPI)', 'high', 'Define API spec first.', 'Write OpenAPI 3.0 spec before coding. Define endpoints, request/response schemas, error codes. Share with frontend team.', ['api'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-auth-${t}`, [t], 'planning', 'Authentication & Authorization', 'critical', 'Plan auth architecture.', 'JWT (stateless) vs session (stateful). RBAC or ABAC permission model. OAuth 2.0 / OIDC for third-party auth.', ['security'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-ratelimit-${t}`, [t], 'planning', 'Rate Limiting Strategy', 'high', 'Define rate limit rules.', 'Per-IP and per-user limits. Different limits for auth vs public endpoints. Plan 429 response with Retry-After header.', ['reliability'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-caching-${t}`, [t], 'planning', 'Caching Architecture', 'high', 'Plan caching layers.', 'Redis for session, hot data, and rate limiting. CDN for static responses. Define cache invalidation strategies for each resource.', ['performance'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-queue-${t}`, [t], 'planning', 'Job Queue & Async Tasks', 'medium', 'Identify async work.', 'Email sending, image processing, webhooks — move to background jobs. BullMQ/Celery/Sidekiq with Redis backend.', ['arch'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-observability-${t}`, [t], 'planning', 'Observability Plan', 'high', 'Define logging and metrics.', 'Structured JSON logs. Prometheus metrics. Distributed tracing with OpenTelemetry. Define SLIs and error budget.', ['ops'])),
    ...ID_BACKEND.map(t => createItem(`be-plan-security-${t}`, [t], 'planning', 'Security Threat Model', 'critical', 'Identify attack surfaces.', 'OWASP Top 10 review. Input validation, SQL injection, mass assignment, SSRF. Plan penetration testing cadence.', ['security'])),

    // ==================================================================================
    // BACKEND — CODING
    // ==================================================================================
    ...ID_BACKEND.map(t => createItem(`be-code-middleware-${t}`, [t], 'coding', 'Middleware Stack', 'high', 'Implement core middleware.', 'Request ID generation, structured logging, auth verification, rate limiting, CORS, compression. Order matters — auth before business logic.', ['code'])),
    ...ID_BACKEND.map(t => createItem(`be-code-crud-${t}`, [t], 'coding', 'CRUD Controllers', 'high', 'Implement resource handlers.', 'Create, Read (single + list with pagination), Update (full + partial), Delete. Validate input with Zod/Joi. Return consistent response shape.', ['code'])),
    ...ID_BACKEND.map(t => createItem(`be-code-db-${t}`, [t], 'coding', 'Database Access Layer', 'high', 'Abstract DB interactions.', 'Repository pattern or ORM (Prisma/TypeORM/SQLAlchemy). Handle transactions. Use parameterized queries — never raw string interpolation.', ['db'])),
    ...ID_BACKEND.map(t => createItem(`be-code-validation-${t}`, [t], 'coding', 'Input Validation & Sanitization', 'critical', 'Validate all inputs.', 'Validate body, params, query string. Sanitize before processing. Return 400 with field-level errors. Never trust client data.', ['security'])),
    ...ID_BACKEND.map(t => createItem(`be-code-errors-${t}`, [t], 'coding', 'Error Handling', 'high', 'Centralize error handling.', 'Global error handler middleware. Consistent error schema: {code, message, details}. Never leak stack traces in production.', ['reliability'])),
    ...ID_BACKEND.map(t => createItem(`be-code-jobs-${t}`, [t], 'coding', 'Background Jobs', 'medium', 'Implement async processing.', 'BullMQ/Sidekiq workers for emails, webhooks, reports. Implement retry with exponential backoff. Dead letter queue for failed jobs.', ['reliability'])),
    ...ID_BACKEND.map(t => createItem(`be-code-webhooks-${t}`, [t], 'coding', 'Webhook System', 'medium', 'Send and receive webhooks.', 'Outbound: retry failed deliveries, HMAC signature. Inbound: verify signature, process async, return 200 immediately.', ['api'])),
    ...ID_BACKEND.map(t => createItem(`be-code-pagination-${t}`, [t], 'coding', 'Pagination & Filtering', 'high', 'Implement list endpoints.', 'Cursor-based pagination for large datasets (avoid OFFSET). Support filtering by fields. Limit max page size to prevent abuse.', ['api'])),

    // ==================================================================================
    // BACKEND — TESTING
    // ==================================================================================
    ...ID_BACKEND.map(t => createItem(`be-test-unit-${t}`, [t], 'testing', 'Unit Tests', 'high', 'Test business logic in isolation.', 'Jest/pytest for service layer logic. Mock database and external services. Test edge cases and error paths.', ['testing'])),
    ...ID_BACKEND.map(t => createItem(`be-test-integration-${t}`, [t], 'testing', 'Integration Tests', 'high', 'Test real DB interactions.', 'Test with real database (Docker). Use transactions + rollback to isolate tests. Test service + DB layer together.', ['testing'])),
    ...ID_BACKEND.map(t => createItem(`be-test-api-${t}`, [t], 'testing', 'API Contract Tests', 'high', 'Test HTTP endpoints.', 'Supertest/httpx to test all endpoints. Test happy path + validation errors + auth failures. Run against test DB.', ['testing'])),
    ...ID_BACKEND.map(t => createItem(`be-test-security-${t}`, [t], 'testing', 'Security Testing', 'high', 'Test for vulnerabilities.', 'OWASP ZAP scan. Test auth bypass, injection, mass assignment. Check headers with securityheaders.com.', ['security'])),
    ...ID_BACKEND.map(t => createItem(`be-test-load-${t}`, [t], 'testing', 'Load Testing', 'medium', 'Stress test endpoints.', 'k6 or Locust for load testing. Identify throughput limits. Test DB connection pool exhaustion under load.', ['performance'])),

    // ==================================================================================
    // BACKEND — DEPLOYMENT
    // ==================================================================================
    ...ID_BACKEND.map(t => createItem(`be-deploy-docker-${t}`, [t], 'deployment', 'Docker & Containerization', 'high', 'Containerize the application.', 'Multi-stage Dockerfile for small prod image. Non-root user. Health check instruction. .dockerignore to exclude secrets.', ['devops'])),
    ...ID_BACKEND.map(t => createItem(`be-deploy-ci-${t}`, [t], 'deployment', 'CI/CD Pipeline', 'critical', 'Automate deployments.', 'GitHub Actions: lint → test → build → deploy. Zero-downtime rolling deploys. Rollback strategy on failure.', ['devops'])),
    ...ID_BACKEND.map(t => createItem(`be-deploy-secrets-${t}`, [t], 'deployment', 'Secrets Management', 'critical', 'Secure all credentials.', 'AWS Secrets Manager / HashiCorp Vault / Doppler. Inject as env vars at runtime. Rotate secrets regularly. Audit access.', ['security'])),
    ...ID_BACKEND.map(t => createItem(`be-deploy-migrations-${t}`, [t], 'deployment', 'Database Migration Strategy', 'critical', 'Safe schema migrations.', 'Backward-compatible migrations only. Never drop columns in same deploy. Use Flyway/Liquibase/Alembic. Test migrations on staging.', ['db'])),
    ...ID_BACKEND.map(t => createItem(`be-deploy-health-${t}`, [t], 'deployment', 'Health & Readiness Probes', 'high', 'Implement health endpoints.', '/health: basic liveness check. /ready: checks DB + dependencies. Used by load balancer and Kubernetes probes.', ['ops'])),

    // ==================================================================================
    // BACKEND — SCALING
    // ==================================================================================
    ...ID_BACKEND.map(t => createItem(`be-scale-cache-${t}`, [t], 'scaling', 'Distributed Caching', 'high', 'Scale with Redis cluster.', 'Redis Cluster for high availability. Cache computed results. Define TTLs. Use cache-aside pattern. Monitor hit/miss ratio.', ['performance'])),
    ...ID_BACKEND.map(t => createItem(`be-scale-db-${t}`, [t], 'scaling', 'Database Scaling', 'high', 'Scale database layer.', 'Read replicas for read-heavy loads. Connection pooling (PgBouncer). Partition large tables. Archive old data to cold storage.', ['db'])),
    ...ID_BACKEND.map(t => createItem(`be-scale-queue-${t}`, [t], 'scaling', 'Async Queue Scaling', 'medium', 'Scale worker processes.', 'Horizontal scaling of job workers. Priority queues for critical tasks. Monitor queue depth and consumer lag.', ['reliability'])),
    ...ID_BACKEND.map(t => createItem(`be-scale-monitor-${t}`, [t], 'scaling', 'Monitoring & Alerting', 'critical', 'Production observability.', 'Grafana + Prometheus dashboards. Alert on p99 latency, error rate, queue depth. On-call rotation with PagerDuty/Opsgenie.', ['ops'])),

    // ==================================================================================
    // AI / ML — PLANNING
    // ==================================================================================
    ...ID_AIML.map(t => createItem(`ai-plan-data-${t}`, [t], 'planning', 'Data Source & Quality', 'critical', 'Identify and assess data.', 'Define data sources (S3, DB, APIs). Assess quality: completeness, accuracy, consistency. Calculate data volume and refresh frequency.', ['data'])),
    ...ID_AIML.map(t => createItem(`ai-plan-problem-${t}`, [t], 'planning', 'Problem Formulation', 'critical', 'Frame as ML problem.', 'Classification vs regression vs clustering vs generation. Define target variable, input features, success metrics, and baseline.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-plan-metric-${t}`, [t], 'planning', 'Success Metrics', 'critical', 'Define evaluation metrics.', 'Accuracy vs F1 vs AUC-ROC vs RMSE — choose based on class imbalance and cost of errors. Define business KPIs linked to model performance.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-plan-compute-${t}`, [t], 'planning', 'Compute & Infrastructure', 'high', 'Plan compute needs.', 'GPU vs CPU for training. Cloud: AWS SageMaker, GCP Vertex AI, Azure ML. On-prem GPU cluster. Cost estimation for training runs.', ['infra'])),
    ...ID_AIML.map(t => createItem(`ai-plan-baseline-${t}`, [t], 'planning', 'Establish Baseline', 'high', 'Create simple baseline first.', 'Before complex models, implement naive baseline (mean, most frequent class, simple rule). All models must beat this.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-plan-ethics-${t}`, [t], 'planning', 'Bias & Ethics Review', 'high', 'Assess model fairness.', 'Check training data for demographic bias. Evaluate fairness across protected groups. Define responsible AI principles for this use case.', ['ethics'])),

    // ==================================================================================
    // AI / ML — CODING
    // ==================================================================================
    ...ID_AIML.map(t => createItem(`ai-code-preprocess-${t}`, [t], 'coding', 'Data Preprocessing Pipeline', 'critical', 'Build reproducible data pipeline.', 'Pandas/Polars for tabular. Normalization, encoding, imputation. Save preprocessing steps as fitted transformer for inference.', ['data'])),
    ...ID_AIML.map(t => createItem(`ai-code-eda-${t}`, [t], 'coding', 'Exploratory Data Analysis', 'high', 'Understand data distributions.', 'Plot distributions, correlations, missing value heatmaps. Check class imbalance. Identify outliers and data leakage risks.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-code-features-${t}`, [t], 'coding', 'Feature Engineering', 'high', 'Create informative features.', 'Domain-specific feature creation. Feature selection: correlation, importance, SHAP. Document feature rationale for reproducibility.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-code-train-${t}`, [t], 'coding', 'Model Training & HPO', 'high', 'Train and tune models.', 'Start simple (LogReg/RF), then complex (XGBoost/DNN). Optuna/Ray Tune for hyperparameter optimization. Track all runs with MLflow.', ['ml'])),
    ...ID_AIML.map(t => createItem(`ai-code-eval-${t}`, [t], 'coding', 'Model Evaluation', 'critical', 'Rigorous evaluation.', 'Stratified k-fold CV. Confusion matrix, classification report. Calibration curves. Test on held-out set — no peeking during dev.', ['datascience'])),
    ...ID_AIML.map(t => createItem(`ai-code-experiment-${t}`, [t], 'coding', 'Experiment Tracking', 'high', 'Log all experiments.', 'MLflow or W&B to track: params, metrics, artifacts, code version. Never lose a training run. Compare runs in UI.', ['ops'])),
    ...ID_AIML.map(t => createItem(`ai-code-inference-${t}`, [t], 'coding', 'Inference Optimization', 'medium', 'Speed up prediction.', 'ONNX export, quantization, TensorRT for GPU. Batch inference where possible. Profile latency at p50/p99.', ['performance'])),

    // ==================================================================================
    // AI / ML — TESTING
    // ==================================================================================
    ...ID_AIML.map(t => createItem(`ai-test-data-${t}`, [t], 'testing', 'Data Validation Tests', 'critical', 'Test data pipeline.', 'Great Expectations or pytest for data quality. Test schema, null rates, value ranges, distribution shifts between training batches.', ['testing'])),
    ...ID_AIML.map(t => createItem(`ai-test-model-${t}`, [t], 'testing', 'Model Behavior Tests', 'high', 'Test model predictions.', 'Invariance tests (input perturbation → same output), directional tests (increase X → expect Y), minimum capability tests.', ['testing'])),
    ...ID_AIML.map(t => createItem(`ai-test-regression-${t}`, [t], 'testing', 'Performance Regression Test', 'high', 'Detect model degradation.', 'Store benchmark metrics. Fail deployment if new model scores below threshold on held-out test set.', ['testing'])),

    // ==================================================================================
    // AI / ML — DEPLOYMENT
    // ==================================================================================
    ...ID_AIML.map(t => createItem(`ai-deploy-serve-${t}`, [t], 'deployment', 'Model Serving API', 'high', 'Serve model via API.', 'FastAPI + Uvicorn for Python. TorchServe/TensorFlow Serving for heavy models. BentoML or Seldon for managed serving.', ['ops'])),
    ...ID_AIML.map(t => createItem(`ai-deploy-registry-${t}`, [t], 'deployment', 'Model Registry', 'high', 'Version and track models.', 'MLflow Model Registry or W&B Artifacts. Tag models: staging → production. Store model card with performance metrics.', ['ops'])),
    ...ID_AIML.map(t => createItem(`ai-deploy-canary-${t}`, [t], 'deployment', 'Canary / Shadow Deployment', 'medium', 'Safe model rollout.', 'Shadow mode: run new model in parallel without affecting users. A/B test with traffic split. Monitor before full rollout.', ['reliability'])),
    ...ID_AIML.map(t => createItem(`ai-deploy-monitor-${t}`, [t], 'deployment', 'Model Monitoring', 'critical', 'Detect model drift.', 'Monitor prediction distributions and input feature distributions. Alert on data drift (KL divergence). Trigger retraining pipeline.', ['monitoring'])),

    // ==================================================================================
    // AI / ML — SCALING
    // ==================================================================================
    ...ID_AIML.map(t => createItem(`ai-scale-retrain-${t}`, [t], 'scaling', 'Automated Retraining Pipeline', 'high', 'Automate model refresh.', 'Trigger retraining on data drift or schedule. Automated evaluation gate before promoting to production. Full MLOps loop.', ['ops'])),
    ...ID_AIML.map(t => createItem(`ai-scale-feature-${t}`, [t], 'scaling', 'Feature Store', 'medium', 'Centralize feature computation.', 'Feast or Tecton for feature store. Consistent features between training and inference. Reduce duplication across teams.', ['arch'])),

    // ==================================================================================
    // DEVOPS / INFRA — PLANNING
    // ==================================================================================
    ...ID_INFRA.map(t => createItem(`inf-plan-resource-${t}`, [t], 'planning', 'Resource Requirements', 'high', 'Estimate compute needs.', 'Define CPU, RAM, storage, and network requirements. Choose instance types. Plan for peak load with headroom.', ['ops'])),
    ...ID_INFRA.map(t => createItem(`inf-plan-network-${t}`, [t], 'planning', 'Network Architecture', 'critical', 'Design VPC and network.', 'Public vs private subnets. NAT gateway for outbound. VPN/Direct Connect for on-prem. Security groups as firewall.', ['networking'])),
    ...ID_INFRA.map(t => createItem(`inf-plan-iac-${t}`, [t], 'planning', 'IaC Strategy', 'critical', 'Choose Infrastructure as Code.', 'Terraform for multi-cloud, Pulumi for code-first, CDK for AWS-native. Store state in remote backend (S3 + DynamoDB lock).', ['devops'])),
    ...ID_INFRA.map(t => createItem(`inf-plan-cicd-${t}`, [t], 'planning', 'CI/CD Strategy', 'critical', 'Design deployment pipeline.', 'GitHub Actions / GitLab CI / Jenkins. Define branch strategy (GitFlow vs trunk-based). Plan approval gates for production.', ['devops'])),
    ...ID_INFRA.map(t => createItem(`inf-plan-dr-${t}`, [t], 'planning', 'Disaster Recovery Plan', 'high', 'Define RTO and RPO.', 'RTO (Recovery Time Objective) and RPO (Recovery Point Objective). Multi-region or multi-AZ. Backup frequency and restoration tests.', ['reliability'])),

    // ==================================================================================
    // DEVOPS / INFRA — CODING
    // ==================================================================================
    ...ID_INFRA.map(t => createItem(`inf-code-iac-${t}`, [t], 'coding', 'Infrastructure as Code', 'critical', 'Write Terraform/CDK scripts.', 'Modular Terraform with separate state per environment. Use workspaces or separate dirs. Pin provider versions.', ['devops'])),
    ...ID_INFRA.map(t => createItem(`inf-code-pipeline-${t}`, [t], 'coding', 'CI/CD Pipeline Code', 'high', 'Write pipeline configuration.', 'YAML pipeline: lint → test → build → security scan → deploy. Parallel jobs where possible. Cache dependencies.', ['devops'])),
    ...ID_INFRA.map(t => createItem(`inf-code-monitoring-${t}`, [t], 'coding', 'Monitoring & Alerting Setup', 'high', 'Configure observability stack.', 'Prometheus + Grafana or Datadog. Define SLI metrics. PagerDuty integration. Dashboard for infra health.', ['ops'])),
    ...ID_INFRA.map(t => createItem(`inf-code-security-${t}`, [t], 'coding', 'Security Hardening', 'critical', 'Harden infrastructure.', 'CIS Benchmark compliance. Disable root SSH, use bastion/SSM. Encrypt EBS/S3. Enable CloudTrail/GuardDuty audit logging.', ['security'])),
    ...ID_INFRA.map(t => createItem(`inf-code-backup-${t}`, [t], 'coding', 'Backup Automation', 'high', 'Automate data backups.', 'AWS Backup or custom scripts. DB snapshots, S3 versioning, EFS backups. Test restoration monthly.', ['reliability'])),

    // ==================================================================================
    // DEVOPS / INFRA — TESTING
    // ==================================================================================
    ...ID_INFRA.map(t => createItem(`inf-test-iac-${t}`, [t], 'testing', 'IaC Testing', 'high', 'Validate Terraform plans.', 'Terratest for integration tests. tflint + tfsec for linting and security checks. Checkov for policy as code.', ['testing'])),
    ...ID_INFRA.map(t => createItem(`inf-test-chaos-${t}`, [t], 'testing', 'Chaos Engineering', 'medium', 'Test resilience.', 'AWS Fault Injection Simulator or Gremlin. Kill instances, introduce latency, test failover behavior. Run in staging first.', ['reliability'])),
    ...ID_INFRA.map(t => createItem(`inf-test-dr-${t}`, [t], 'testing', 'DR Drill', 'high', 'Test disaster recovery.', 'Run quarterly DR drills. Restore from backup to different environment. Measure actual RTO vs target. Document gaps.', ['reliability'])),

    // ==================================================================================
    // DEVOPS / INFRA — DEPLOYMENT
    // ==================================================================================
    ...ID_INFRA.map(t => createItem(`inf-deploy-env-${t}`, [t], 'deployment', 'Environment Parity', 'high', 'Keep envs consistent.', 'Dev → Staging → Prod progression. Same Docker images, same config structure. Prevent "works on staging" issues.', ['devops'])),
    ...ID_INFRA.map(t => createItem(`inf-deploy-zerodown-${t}`, [t], 'deployment', 'Zero-downtime Deployments', 'high', 'Deploy without outages.', 'Blue/green or rolling deployments. Health checks before traffic switch. Automated rollback on failed health checks.', ['reliability'])),
    ...ID_INFRA.map(t => createItem(`inf-deploy-secrets-${t}`, [t], 'deployment', 'Secrets Rotation', 'critical', 'Rotate credentials safely.', 'Automate credential rotation with AWS Secrets Manager rotation Lambda. Test rotation before enabling on prod.', ['security'])),

    // ==================================================================================
    // DEVOPS / INFRA — SCALING
    // ==================================================================================
    ...ID_INFRA.map(t => createItem(`inf-scale-auto-${t}`, [t], 'scaling', 'Autoscaling Configuration', 'high', 'Configure automatic scaling.', 'ASG with target tracking (CPU 70%). K8s HPA on custom metrics. Scale-in protection during deployments.', ['ops'])),
    ...ID_INFRA.map(t => createItem(`inf-scale-cost-${t}`, [t], 'scaling', 'Cost Optimization', 'medium', 'Reduce infrastructure costs.', 'Right-size instances. Reserved/Savings Plans for steady workloads. Spot instances for batch jobs. S3 lifecycle policies.', ['ops'])),
    ...ID_INFRA.map(t => createItem(`inf-scale-multiregion-${t}`, [t], 'scaling', 'Multi-region Strategy', 'medium', 'Plan global distribution.', 'Active-active vs active-passive. Route53 latency routing. Data replication lag considerations. Cost vs availability trade-off.', ['reliability'])),

    // ==================================================================================
    // GAME (Unity / Godot)
    // ==================================================================================
    createItem('game-plan-1', ['game'], 'planning', 'Engine & Platform', 'critical', 'Choose game engine and target platforms.', 'Unity for cross-platform (C#), Godot for lightweight (GDScript/C#). Define PC/Console/Mobile targets early.', ['arch']),
    createItem('game-plan-2', ['game'], 'planning', 'Game Design Document', 'critical', 'Write core GDD.', 'Define gameplay loop, genre, mechanics, win/lose conditions, and scope. Use Notion/Confluence.', ['design']),
    createItem('game-plan-3', ['game'], 'planning', 'Project Folder Structure', 'high', 'Organize assets & scripts.', 'Separate Assets/Scripts/Scenes/Audio/Prefabs/Materials. Follow engine conventions.', ['setup']),
    createItem('game-plan-4', ['game'], 'planning', 'Version Control Setup', 'high', 'Configure Git for game assets.', 'Use Git LFS for large binary assets (textures, audio). Add engine-specific .gitignore.', ['tooling']),
    createItem('game-plan-5', ['game'], 'planning', 'Art Style Guide', 'medium', 'Define visual direction.', 'Pixel art vs 3D vs low-poly. Set color palette, resolution, and aspect ratio early.', ['design']),
    createItem('game-plan-6', ['game'], 'planning', 'Audio Strategy', 'medium', 'Plan sound and music.', 'Define SFX vs music sources, licensing (CC0 vs original). Tools: FMOD, Wwise, or engine built-in.', ['design']),
    createItem('game-plan-7', ['game'], 'planning', 'Monetization Model', 'medium', 'Define revenue approach.', 'Free/paid, in-app purchases, ads (AdMob). Check platform store guidelines.', ['business']),
    createItem('game-plan-8', ['game'], 'planning', 'Target Frame Rate', 'high', 'Set performance budgets.', 'Define 30fps vs 60fps target. Mobile: 30fps with battery, Desktop: 60fps+. Profile early.', ['performance']),

    createItem('game-code-1', ['game'], 'coding', 'Scene Management', 'high', 'Implement scene loading.', 'Async scene loading with loading screen. Use SceneManager (Unity) or SceneTree (Godot).', ['arch']),
    createItem('game-code-2', ['game'], 'coding', 'Game Manager / Singleton', 'high', 'Central game state controller.', 'Persistent singleton for score, lives, player data. DontDestroyOnLoad (Unity) or Autoload (Godot).', ['arch']),
    createItem('game-code-3', ['game'], 'coding', 'Player Controller', 'critical', 'Implement player movement.', 'Physics-based vs transform-based movement. Handle input abstraction (keyboard + gamepad + touch).', ['gameplay']),
    createItem('game-code-4', ['game'], 'coding', 'Input System', 'high', 'Abstract input handling.', 'Use Unity New Input System or Godot InputMap. Support multiple input methods.', ['gameplay']),
    createItem('game-code-5', ['game'], 'coding', 'Save System', 'high', 'Implement persistent save.', 'JSON or binary serialization. PlayerPrefs for simple data, custom for complex. Encrypt sensitive data.', ['data']),
    createItem('game-code-6', ['game'], 'coding', 'UI / HUD System', 'high', 'Build game UI.', 'Health bars, score, minimap. Use Canvas (Unity) or Control nodes (Godot). Separate world-space and screen-space UI.', ['ui']),
    createItem('game-code-7', ['game'], 'coding', 'Audio Manager', 'medium', 'Centralize audio playback.', 'Pooling AudioSource components. Control SFX volume vs music volume separately.', ['audio']),
    createItem('game-code-8', ['game'], 'coding', 'Object Pooling', 'high', 'Optimize frequent spawning.', 'Pool bullets, enemies, particles instead of Instantiate/Destroy to avoid GC spikes.', ['performance']),
    createItem('game-code-9', ['game'], 'coding', 'Camera System', 'medium', 'Smooth camera follow.', 'Cinemachine (Unity) or Camera2D smoothing (Godot). Implement screen shake, zoom, deadzone.', ['gameplay']),
    createItem('game-code-10', ['game'], 'coding', 'Enemy AI (State Machine)', 'high', 'Implement enemy behavior.', 'FSM: Idle → Patrol → Chase → Attack → Dead. Use NavMesh (Unity) or NavigationAgent (Godot).', ['ai']),
    createItem('game-code-11', ['game'], 'coding', 'Physics Layers & Tags', 'medium', 'Configure collision matrix.', 'Define layers (Player, Enemy, Ground, Trigger). Avoid unnecessary collision checks.', ['physics']),
    createItem('game-code-12', ['game'], 'coding', 'Shader & Visual Effects', 'low', 'Polish visual effects.', 'Post-processing (bloom, vignette). Particle systems for hits, explosions, ambient.', ['vfx']),

    createItem('game-test-1', ['game'], 'testing', 'Playtesting Sessions', 'critical', 'Conduct regular playtests.', 'Test with target audience. Record sessions, take notes on pain points and fun factor.', ['qa']),
    createItem('game-test-2', ['game'], 'testing', 'Performance Profiling', 'critical', 'Profile CPU & GPU.', 'Use Unity Profiler or Godot Debugger. Target <16ms frame time. Find draw call and GC bottlenecks.', ['performance']),
    createItem('game-test-3', ['game'], 'testing', 'Edge Case Testing', 'high', 'Test boundary conditions.', 'Test respawn, full inventory, max enemies, screen edge movement, offline scenarios.', ['qa']),
    createItem('game-test-4', ['game'], 'testing', 'Device Testing', 'high', 'Test on real hardware.', 'Test on low-end devices if mobile. Check iOS/Android differences, screen notches, safe areas.', ['qa']),
    createItem('game-test-5', ['game'], 'testing', 'Save/Load Testing', 'high', 'Verify persistence.', 'Test save during action, force quit and reload. Test corrupted save recovery.', ['data']),
    createItem('game-test-6', ['game'], 'testing', 'Audio Testing', 'medium', 'Verify all audio triggers.', 'Test all SFX and music transitions. Check audio priority and mute/unmute settings.', ['audio']),

    createItem('game-deploy-1', ['game'], 'deployment', 'Build Pipeline', 'critical', 'Automate builds.', 'Configure CI for automated builds (Unity Cloud Build, GitHub Actions). Create platform-specific build profiles.', ['devops']),
    createItem('game-deploy-2', ['game'], 'deployment', 'Platform Certification', 'critical', 'Meet platform requirements.', 'Review Apple App Store / Google Play / Steam technical requirements and content guidelines.', ['release']),
    createItem('game-deploy-3', ['game'], 'deployment', 'App Store Metadata', 'high', 'Prepare store listing.', 'Screenshots, trailer (30s), description with keywords, age rating questionnaire.', ['marketing']),
    createItem('game-deploy-4', ['game'], 'deployment', 'Analytics Integration', 'medium', 'Track player behavior.', 'Integrate Unity Analytics, Firebase, or GameAnalytics. Track session length, retention, funnel drops.', ['analytics']),
    createItem('game-deploy-5', ['game'], 'deployment', 'Crash Reporting', 'high', 'Monitor production crashes.', 'Integrate Firebase Crashlytics or Sentry. Set up alerts for new crash types.', ['monitoring']),
    createItem('game-deploy-6', ['game'], 'deployment', 'Update Strategy', 'medium', 'Plan post-launch updates.', 'Define hotfix process, content update cadence, and backward compatibility for save files.', ['release']),

    createItem('game-scale-1', ['game'], 'scaling', 'Live Ops Backend', 'high', 'Server-side game config.', 'Remote config for balancing tweaks without full updates. Firebase Remote Config or custom backend.', ['backend']),
    createItem('game-scale-2', ['game'], 'scaling', 'Multiplayer Architecture', 'high', 'Design netcode.', 'Authoritative server vs P2P. Use Netcode for GameObjects (Unity), ENet (Godot), or Photon.', ['arch']),
    createItem('game-scale-3', ['game'], 'scaling', 'Content DLC System', 'medium', 'Plan downloadable content.', 'Addressables (Unity) or dynamic resource loading for DLC packs.', ['arch']),

    // ==================================================================================
    // BLOCKCHAIN / SMART CONTRACT
    // ==================================================================================
    createItem('bc-plan-1', ['blockchain'], 'planning', 'Chain Selection', 'critical', 'Choose blockchain.', 'Ethereum/Polygon for EVM, Solana for high TPS, Cosmos for interop. Consider gas costs and ecosystem.', ['arch']),
    createItem('bc-plan-2', ['blockchain'], 'planning', 'Contract Architecture', 'critical', 'Design contract structure.', 'Upgradeable proxy pattern vs immutable. OpenZeppelin libraries for security.', ['arch']),
    createItem('bc-plan-3', ['blockchain'], 'planning', 'Tokenomics', 'high', 'Define token economics.', 'Supply, distribution, vesting schedule, utility. Model incentive alignment.', ['business']),
    createItem('bc-code-1', ['blockchain'], 'coding', 'Smart Contract Dev', 'critical', 'Write contract in Solidity/Rust.', 'Follow Checks-Effects-Interactions pattern. Use OpenZeppelin for ERC standards.', ['code']),
    createItem('bc-code-2', ['blockchain'], 'coding', 'Re-entrancy Protection', 'critical', 'Guard against re-entrancy.', 'Use ReentrancyGuard. Never call external contracts before state updates.', ['security']),
    createItem('bc-code-3', ['blockchain'], 'coding', 'Access Control', 'critical', 'Implement role-based access.', 'Ownable, AccessControl from OpenZeppelin. Multi-sig for critical functions.', ['security']),
    createItem('bc-code-4', ['blockchain'], 'coding', 'Events & Indexing', 'high', 'Emit events for state changes.', 'Use The Graph or Moralis for event indexing. Events are cheaper than storage.', ['code']),
    createItem('bc-test-1', ['blockchain'], 'testing', 'Unit Tests (Hardhat/Foundry)', 'critical', 'Test all contract logic.', '100% branch coverage. Test edge cases, overflow, and permission violations.', ['testing']),
    createItem('bc-test-2', ['blockchain'], 'testing', 'Security Audit', 'critical', 'External security review.', 'Engage Certik/Trail of Bits/Halborn for audit before mainnet. Fix all critical findings.', ['security']),
    createItem('bc-test-3', ['blockchain'], 'testing', 'Gas Optimization', 'high', 'Minimize transaction costs.', 'Use Hardhat gas reporter. Pack storage slots, use calldata vs memory, batch operations.', ['performance']),
    createItem('bc-deploy-1', ['blockchain'], 'deployment', 'Testnet Deployment', 'critical', 'Deploy to testnet first.', 'Goerli/Sepolia for Ethereum. Verify contracts on Etherscan.', ['devops']),
    createItem('bc-deploy-2', ['blockchain'], 'deployment', 'Multisig Ownership', 'critical', 'Transfer to multisig.', 'Use Gnosis Safe for admin keys. Never use single EOA for production contracts.', ['security']),

    // ==================================================================================
    // BROWSER EXTENSION
    // ==================================================================================
    createItem('ext-plan-1', ['browser-extension'], 'planning', 'Manifest V3 Strategy', 'critical', 'Target MV3 standard.', 'MV3 is required for Chrome. Understand service worker limitations vs background scripts.', ['arch']),
    createItem('ext-plan-2', ['browser-extension'], 'planning', 'Permission Scope', 'critical', 'Minimize permissions.', 'Request only needed permissions. activeTab vs all_urls impacts store approval.', ['security']),
    createItem('ext-plan-3', ['browser-extension'], 'planning', 'Browser Targets', 'high', 'Define browser support.', 'Chrome + Firefox (WebExtensions API). Edge auto-supports Chrome extensions.', ['setup']),
    createItem('ext-code-1', ['browser-extension'], 'coding', 'Service Worker', 'high', 'Background logic.', 'Handle alarms, messages, and storage in service worker. Avoid long-running tasks.', ['code']),
    createItem('ext-code-2', ['browser-extension'], 'coding', 'Content Script', 'high', 'Inject into pages.', 'DOM manipulation and communication with background via chrome.runtime.sendMessage.', ['code']),
    createItem('ext-code-3', ['browser-extension'], 'coding', 'Popup UI', 'medium', 'Build popup interface.', 'Use React/Vanilla JS. Communicate with background for data.', ['ui']),
    createItem('ext-code-4', ['browser-extension'], 'coding', 'Storage API', 'high', 'Persist user data.', 'chrome.storage.sync for settings (synced), chrome.storage.local for large data.', ['data']),
    createItem('ext-test-1', ['browser-extension'], 'testing', 'Cross-browser Testing', 'high', 'Test on Chrome & Firefox.', 'Use web-ext for Firefox testing. Check API compatibility.', ['qa']),
    createItem('ext-deploy-1', ['browser-extension'], 'deployment', 'Chrome Web Store', 'critical', 'Publish to store.', 'Prepare screenshots (1280x800), detailed description, privacy policy URL.', ['release']),
    createItem('ext-deploy-2', ['browser-extension'], 'deployment', 'Auto-update Strategy', 'medium', 'Handle extension updates.', 'Test update_url and version bump process. Notify users of breaking changes.', ['release']),

    // ==================================================================================
    // VS CODE EXTENSION
    // ==================================================================================
    createItem('vsc-plan-1', ['vscode-extension'], 'planning', 'Activation Events', 'critical', 'Define when extension loads.', 'Use onLanguage, onCommand, or workspaceContains. Avoid * (activates always) for performance.', ['arch']),
    createItem('vsc-plan-2', ['vscode-extension'], 'planning', 'Contribution Points', 'high', 'Define package.json contributions.', 'Commands, menus, keybindings, configuration, views — plan all contribution points.', ['setup']),
    createItem('vsc-code-1', ['vscode-extension'], 'coding', 'Extension Entrypoint', 'high', 'Implement activate().', 'Register disposables, commands, and providers in activate(). Deactivate in deactivate().', ['code']),
    createItem('vsc-code-2', ['vscode-extension'], 'coding', 'Language Server Protocol', 'high', 'Implement LSP if needed.', 'Use vscode-languageclient + vscode-languageserver for diagnostics and completions.', ['code']),
    createItem('vsc-code-3', ['vscode-extension'], 'coding', 'Webview Panel', 'medium', 'Custom UI panels.', 'Use Webview API. Implement message passing between extension and webview.', ['ui']),
    createItem('vsc-code-4', ['vscode-extension'], 'coding', 'Configuration API', 'medium', 'User settings.', 'Use workspace.getConfiguration() to read settings. Register configurationDefaults.', ['code']),
    createItem('vsc-test-1', ['vscode-extension'], 'testing', 'Extension Tests', 'high', 'Test with vscode-test.', 'Use @vscode/test-electron runner. Test commands and UI in real VS Code environment.', ['testing']),
    createItem('vsc-deploy-1', ['vscode-extension'], 'deployment', 'Marketplace Publish', 'critical', 'Publish to VS Marketplace.', 'Use vsce package and publish. Prepare icon, README, screenshots, changelog.', ['release']),
    createItem('vsc-deploy-2', ['vscode-extension'], 'deployment', 'Version & Changelog', 'medium', 'Maintain CHANGELOG.md.', 'Follow Keep a Changelog format. Bump version with vsce. Communicate breaking changes.', ['release']),

    // ==================================================================================
    // BOT / AUTOMATION
    // ==================================================================================
    createItem('bot-plan-1', ['bot-automation'], 'planning', 'Trigger Strategy', 'critical', 'Define automation triggers.', 'Scheduled (cron), event-driven (webhook), or on-demand. Choose appropriate trigger mechanism.', ['arch']),
    createItem('bot-plan-2', ['bot-automation'], 'planning', 'Target Platform API', 'high', 'Study target API limits.', 'Rate limits, authentication (OAuth vs API key), webhook vs polling trade-offs.', ['arch']),
    createItem('bot-plan-3', ['bot-automation'], 'planning', 'Error Recovery Plan', 'high', 'Design retry logic.', 'Exponential backoff, dead letter queues, alerting on repeated failures.', ['reliability']),
    createItem('bot-code-1', ['bot-automation'], 'coding', 'Auth & Token Refresh', 'critical', 'Implement secure auth.', 'Store tokens in env vars or secrets manager. Implement OAuth refresh flow.', ['security']),
    createItem('bot-code-2', ['bot-automation'], 'coding', 'Rate Limit Handling', 'high', 'Respect API limits.', 'Implement token bucket or leaky bucket. Parse Retry-After headers.', ['reliability']),
    createItem('bot-code-3', ['bot-automation'], 'coding', 'Idempotency', 'high', 'Prevent duplicate actions.', 'Track processed event IDs. Use atomic operations for state updates.', ['reliability']),
    createItem('bot-code-4', ['bot-automation'], 'coding', 'Logging & Audit Trail', 'high', 'Log all actions taken.', 'Structured logging with timestamps, action, target, result. Useful for debugging and compliance.', ['ops']),
    createItem('bot-test-1', ['bot-automation'], 'testing', 'Sandbox Testing', 'critical', 'Test against sandbox APIs.', 'Use test mode / sandbox accounts. Never test automation on production data.', ['qa']),
    createItem('bot-test-2', ['bot-automation'], 'testing', 'Failure Scenario Tests', 'high', 'Simulate API failures.', 'Test timeout, 429, 500 responses. Verify retry logic and alerting.', ['qa']),
    createItem('bot-deploy-1', ['bot-automation'], 'deployment', 'Secrets Management', 'critical', 'Secure credentials.', 'AWS Secrets Manager, HashiCorp Vault, or GitHub Actions secrets. Never commit tokens.', ['security']),
    createItem('bot-deploy-2', ['bot-automation'], 'deployment', 'Monitoring & Alerts', 'high', 'Track bot health.', 'Alert on failure rate > threshold. Dashboard for actions taken per hour/day.', ['monitoring']),

    // ==================================================================================
    // IOT / EMBEDDED
    // ==================================================================================
    createItem('iot-plan-1', ['iot-embedded'], 'planning', 'Hardware Selection', 'critical', 'Choose MCU/SBC.', 'Raspberry Pi for Linux, ESP32 for BLE/WiFi, STM32 for real-time. Balance cost vs capability.', ['arch']),
    createItem('iot-plan-2', ['iot-embedded'], 'planning', 'Connectivity Protocol', 'critical', 'Define communication.', 'MQTT for IoT messaging, CoAP for constrained devices, HTTP for simple APIs. Choose broker (AWS IoT, Mosquitto).', ['arch']),
    createItem('iot-plan-3', ['iot-embedded'], 'planning', 'Power Budget', 'high', 'Estimate power consumption.', 'Battery vs wired. Deep sleep strategies for battery-powered devices.', ['hardware']),
    createItem('iot-plan-4', ['iot-embedded'], 'planning', 'OTA Update Strategy', 'high', 'Plan firmware updates.', 'A/B partition OTA or rollback-capable update. Verify firmware integrity with hash.', ['reliability']),
    createItem('iot-code-1', ['iot-embedded'], 'coding', 'RTOS / Scheduler', 'high', 'Choose real-time OS.', 'FreeRTOS for MCU, Zephyr for multi-arch. Define task priorities and stack sizes.', ['code']),
    createItem('iot-code-2', ['iot-embedded'], 'coding', 'Sensor Drivers', 'critical', 'Implement sensor reading.', 'I2C/SPI/UART driver implementation. Handle sensor calibration and error states.', ['code']),
    createItem('iot-code-3', ['iot-embedded'], 'coding', 'MQTT Client', 'high', 'Implement messaging.', 'Publish telemetry, subscribe to commands. Handle reconnect on network drop.', ['code']),
    createItem('iot-code-4', ['iot-embedded'], 'coding', 'Watchdog Timer', 'critical', 'Prevent firmware freeze.', 'Hardware watchdog to reboot on hang. Kick watchdog only after successful task cycle.', ['reliability']),
    createItem('iot-code-5', ['iot-embedded'], 'coding', 'Data Buffering', 'high', 'Handle offline periods.', 'Buffer sensor data locally when offline. Flush on reconnect.', ['data']),
    createItem('iot-test-1', ['iot-embedded'], 'testing', 'Hardware-in-Loop Test', 'critical', 'Test with real hardware.', 'Automate tests on real device using pytest-embedded or custom harness.', ['testing']),
    createItem('iot-test-2', ['iot-embedded'], 'testing', 'Network Resilience', 'high', 'Simulate network failures.', 'Test reconnect, message queue draining, and graceful degradation.', ['testing']),
    createItem('iot-deploy-1', ['iot-embedded'], 'deployment', 'Secure Boot', 'critical', 'Verify firmware integrity.', 'Enable secure boot and code signing. Prevent unsigned firmware execution.', ['security']),
    createItem('iot-deploy-2', ['iot-embedded'], 'deployment', 'Fleet Management', 'high', 'Manage device fleet.', 'AWS IoT Device Management, Azure IoT Hub, or Balena for fleet OTA and monitoring.', ['ops']),

    // ==================================================================================
    // DATA ENGINEERING / ANALYTICS / SCRAPING — additional items
    // ==================================================================================
    createItem('de-plan-1', ['data-engineering'], 'planning', 'Pipeline Architecture', 'critical', 'Define ETL/ELT flow.', 'Batch vs streaming. Choose orchestrator (Airflow, Prefect, Dagster). Define SLAs.', ['arch']),
    createItem('de-plan-2', ['data-engineering'], 'planning', 'Data Warehouse Schema', 'high', 'Design star/snowflake schema.', 'Define fact and dimension tables. Choose columnar storage (BigQuery, Redshift, Snowflake).', ['db']),
    createItem('de-code-1', ['data-engineering'], 'coding', 'Ingestion Layer', 'high', 'Build data ingestion.', 'Fivetran/Airbyte for managed connectors or custom ingestion with error handling.', ['code']),
    createItem('de-code-2', ['data-engineering'], 'coding', 'Transformation (dbt)', 'high', 'Model transformations.', 'Use dbt for SQL transformations. Implement tests (not null, unique, relationships).', ['code']),
    createItem('de-code-3', ['data-engineering'], 'coding', 'Data Quality Checks', 'critical', 'Validate data.', 'Great Expectations or dbt tests. Alert on schema drift and null rate spikes.', ['quality']),
    createItem('de-deploy-1', ['data-engineering'], 'deployment', 'Orchestration Deployment', 'high', 'Deploy pipeline scheduler.', 'Deploy Airflow/Prefect to K8s or managed service. Configure retries and SLA alerts.', ['ops']),

    createItem('da-plan-1', ['data-analytics'], 'planning', 'KPI Definition', 'critical', 'Define key metrics.', 'Align on business KPIs before building dashboards. Avoid vanity metrics.', ['business']),
    createItem('da-plan-2', ['data-analytics'], 'planning', 'BI Tool Selection', 'high', 'Choose visualization tool.', 'Looker/Metabase for self-serve, Superset for open-source, Tableau for enterprise.', ['arch']),
    createItem('da-code-1', ['data-analytics'], 'coding', 'SQL Query Optimization', 'high', 'Write efficient queries.', 'Use EXPLAIN ANALYZE. Partition large tables. Avoid SELECT *, use CTEs for readability.', ['performance']),
    createItem('da-code-2', ['data-analytics'], 'coding', 'Dashboard Development', 'high', 'Build interactive dashboards.', 'Filters, drill-downs, and row-level security. Cache expensive queries.', ['ui']),
    createItem('da-deploy-1', ['data-analytics'], 'deployment', 'Access Control', 'critical', 'Secure data access.', 'Row-level security per user/team. Audit who accesses what data.', ['security']),

    createItem('sc-plan-1', ['data-scraping'], 'planning', 'Legal & ToS Review', 'critical', 'Check scraping legality.', 'Review target site ToS and robots.txt. Check GDPR/CCPA implications for collected data.', ['legal']),
    createItem('sc-plan-2', ['data-scraping'], 'planning', 'Anti-bot Strategy', 'high', 'Plan for bot detection.', 'Rotating proxies, user-agent rotation, headless browser vs plain HTTP.', ['arch']),
    createItem('sc-code-1', ['data-scraping'], 'coding', 'Scraper Implementation', 'high', 'Build scraper.', 'Scrapy/Playwright for dynamic sites, httpx + BeautifulSoup for static. Handle pagination.', ['code']),
    createItem('sc-code-2', ['data-scraping'], 'coding', 'Rate Limiting', 'high', 'Be a good citizen.', 'Add delays between requests. Respect crawl-delay in robots.txt. Use randomized intervals.', ['reliability']),
    createItem('sc-code-3', ['data-scraping'], 'coding', 'Data Storage', 'medium', 'Persist scraped data.', 'Store raw HTML + parsed data separately. Use upsert logic to avoid duplicates.', ['data']),
    createItem('sc-deploy-1', ['data-scraping'], 'deployment', 'Proxy Rotation', 'high', 'Configure proxy pool.', 'Bright Data, Oxylabs, or DIY with residential proxies. Implement failover.', ['infra']),

    // ==================================================================================
    // DESKTOP — additional items (Electron, Tauri, Windows)
    // ==================================================================================
    createItem('el-plan-1', ['desktop-electron'], 'planning', 'Main/Renderer Split', 'critical', 'Understand process model.', 'Main process for Node.js APIs, Renderer for UI. Use contextBridge + preload for IPC security.', ['arch']),
    createItem('el-plan-2', ['desktop-electron'], 'planning', 'Auto-update Strategy', 'high', 'Plan app updates.', 'electron-updater with GitHub Releases or S3. Test update flow on all platforms.', ['release']),
    createItem('el-code-1', ['desktop-electron'], 'coding', 'IPC Communication', 'high', 'Secure main-renderer comms.', 'Use ipcRenderer.invoke (not sendSync). Validate all inputs in ipcMain handlers.', ['security']),
    createItem('el-code-2', ['desktop-electron'], 'coding', 'Native OS Integration', 'medium', 'OS-native features.', 'System tray, notifications, file associations, shell.openExternal for links.', ['code']),
    createItem('el-code-3', ['desktop-electron'], 'coding', 'Performance: V8 Snapshot', 'medium', 'Faster startup.', 'Use v8-snapshot or lazy loading to reduce startup time.', ['performance']),
    createItem('el-deploy-1', ['desktop-electron'], 'deployment', 'Code Signing', 'critical', 'Sign for distribution.', 'Apple notarization + Developer ID, Windows EV certificate. Prevents "Unknown publisher" warnings.', ['security']),
    createItem('el-deploy-2', ['desktop-electron'], 'deployment', 'Multi-platform Build', 'high', 'Build for all OS.', 'electron-builder for Windows (NSIS), macOS (DMG), Linux (AppImage/deb). Use CI matrix.', ['devops']),

    createItem('tauri-plan-1', ['desktop-tauri'], 'planning', 'Rust Backend Design', 'critical', 'Define Rust commands.', 'Identify which logic goes in Rust (performance, OS access) vs frontend (UI).', ['arch']),
    createItem('tauri-code-1', ['desktop-tauri'], 'coding', 'Tauri Commands', 'high', 'Expose Rust to frontend.', 'Use #[tauri::command] and invoke() in frontend. Handle errors with Result type.', ['code']),
    createItem('tauri-code-2', ['desktop-tauri'], 'coding', 'App Permissions', 'high', 'Configure tauri.conf.json.', 'Enable only needed capabilities (fs, shell, dialog). Principle of least privilege.', ['security']),
    createItem('tauri-deploy-1', ['desktop-tauri'], 'deployment', 'Bundle & Sign', 'critical', 'Package application.', 'tauri build produces platform installers. Configure code signing in tauri.conf.json.', ['release']),

    createItem('win-plan-1', ['desktop-windows'], 'planning', 'Framework Choice', 'critical', 'WPF vs WinUI 3 vs MAUI.', 'WinUI 3 for modern Windows-only, MAUI for cross-platform .NET, WPF for legacy compat.', ['arch']),
    createItem('win-code-1', ['desktop-windows'], 'coding', 'MVVM Pattern', 'high', 'Implement MVVM.', 'ViewModel with INotifyPropertyChanged, Commands, and data bindings. Use CommunityToolkit.Mvvm.', ['arch']),
    createItem('win-code-2', ['desktop-windows'], 'coding', 'Async/Await UI', 'high', 'Non-blocking UI.', 'Use async Task methods. Never block UI thread. Use Progress<T> for progress reporting.', ['code']),
    createItem('win-deploy-1', ['desktop-windows'], 'deployment', 'MSIX Packaging', 'high', 'Package for distribution.', 'Create MSIX package for Store or sideloading. Configure package identity and capabilities.', ['release']),

];
