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
    // GENERIC TEMPLATES FOR VOLUME (High Quality, mapped to groups)
    // ==================================================================================

    // --- Generic Generic Web Planning ---
    ...ID_WEB.map(type => createItem(`gen-web-plan-1-${type}`, [type], 'planning', 'Component Structure', 'high', 'Plan Component Hierarchy.', 'Draw out the component tree, identifying state ownership and props flow.', ['design'])),
    ...ID_WEB.map(type => createItem(`gen-web-plan-2-${type}`, [type], 'planning', 'Routing Strategy', 'high', 'Define App Routes.', 'Plan URL parameters, nested routes, and auth guards.', ['design'])),
    ...ID_WEB.map(type => createItem(`gen-web-plan-3-${type}`, [type], 'planning', 'API Client Setup', 'medium', 'Choose Fetch/Axios/Query.', 'Plan how to handle standard headers like Auth tokens.', ['arch'])),
    ...ID_WEB.map(type => createItem(`gen-web-code-1-${type}`, [type], 'coding', 'Global Layout', 'high', 'Implement Main Layout.', 'Header, Footer, and Navigation implementation.', ['frontend'])),
    ...ID_WEB.map(type => createItem(`gen-web-code-2-${type}`, [type], 'coding', 'Auth Context', 'high', 'Implement Authentication.', 'Login/Logout flows, token storage (HttpOnly cookie preferred).', ['security'])),
    ...ID_WEB.map(type => createItem(`gen-web-test-1-${type}`, [type], 'testing', 'Unit Tests', 'medium', 'Test Utilities.', 'Write unit tests for helper functions and hooks.', ['testing'])),
    ...ID_WEB.map(type => createItem(`gen-web-deploy-1-${type}`, [type], 'deployment', 'Build Optimization', 'high', 'Analyze bundle.', 'Check for large dependencies and implement splitting.', ['performance'])),

    // --- Generic Mobile ---
    ...ID_MOBILE.map(type => createItem(`gen-mob-plan-1-${type}`, [type], 'planning', 'Navigation Map', 'high', 'Screen Flow Diagram.', 'Map out stack vs tab navigators.', ['design'])),
    ...ID_MOBILE.map(type => createItem(`gen-mob-plan-2-${type}`, [type], 'planning', 'Native Permissions', 'critical', 'List Permissions.', 'Camera, Location, Push Notifications - verify needs.', ['setup'])),
    ...ID_MOBILE.map(type => createItem(`gen-mob-code-1-${type}`, [type], 'coding', 'Screen Components', 'high', 'Build core screens.', 'Implement views with SafeArea handling.', ['ui'])),
    ...ID_MOBILE.map(type => createItem(`gen-mob-code-2-${type}`, [type], 'coding', 'Offline Storage', 'medium', 'Persist data.', 'AsyncStorage/SQLite setup.', ['data'])),
    ...ID_MOBILE.map(type => createItem(`gen-mob-deploy-1-${type}`, [type], 'deployment', 'App Icons & Splash', 'medium', 'Generate assets.', 'Create adaptive icons and splash screens.', ['design'])),

    // --- Generic Backend ---
    ...ID_BACKEND.map(type => createItem(`gen-be-plan-1-${type}`, [type], 'planning', 'Database Schema', 'critical', 'ER Diagram.', 'Normalize data and define relationships.', ['db'])),
    ...ID_BACKEND.map(type => createItem(`gen-be-plan-2-${type}`, [type], 'planning', 'API Spec', 'high', 'OpenAPI/Swagger.', 'Define endpoints, inputs, and outputs.', ['api'])),
    ...ID_BACKEND.map(type => createItem(`gen-be-code-1-${type}`, [type], 'coding', 'Middleware', 'high', 'Auth & Logging.', 'Implement request logging and error handling middleware.', ['code'])),
    ...ID_BACKEND.map(type => createItem(`gen-be-code-2-${type}`, [type], 'coding', 'CRUD Controllers', 'medium', 'Core Login.', 'Implement Create, Read, Update, Delete handlers.', ['code'])),
    ...ID_BACKEND.map(type => createItem(`gen-be-deploy-1-${type}`, [type], 'deployment', 'Environment Vars', 'critical', 'Secure Env.', 'Ensure no secrets in code.', ['security'])),

    // --- Generic AI/ML ---
    ...ID_AIML.map(type => createItem(`gen-ai-plan-1-${type}`, [type], 'planning', 'Data Source', 'critical', 'Identify Data.', 'S3 buckets, Databases, or APIs.', ['data'])),
    ...ID_AIML.map(type => createItem(`gen-ai-code-1-${type}`, [type], 'coding', 'Preprocessing', 'high', 'Clean Data.', 'Normalization, tokenization, or resizing.', ['data'])),
    ...ID_AIML.map(type => createItem(`gen-ai-deploy-1-${type}`, [type], 'deployment', 'Model Serving', 'high', 'Inference API.', 'Wrap model in API for consumption.', ['ops'])),

    // --- DevOps/Infra ---
    ...ID_INFRA.map(type => createItem(`gen-inf-plan-1-${type}`, [type], 'planning', 'Resource Assessment', 'medium', 'CPU/RAM Needs.', 'Estimate resource requirements involved.', ['ops'])),
    ...ID_INFRA.map(type => createItem(`gen-inf-code-1-${type}`, [type], 'coding', 'IAC Scripts', 'high', 'Infrastructure as Code.', 'Write Terraform/Ansible scripts.', ['devops'])),

];
