import { ProjectTypeId, TechOption } from '../types';

export const TECH_STACKS: Record<ProjectTypeId, TechOption[]> = {
    'web-react': [{ id: 'nextjs', label: 'Next.js', recommended: true }, { id: 'react', label: 'React (Vite)' }, { id: 'typescript', label: 'TypeScript', recommended: true }, { id: 'tailwind', label: 'Tailwind CSS' }, { id: 'prisma', label: 'Prisma' }, { id: 'trpc', label: 'tRPC' }, { id: 'zustand', label: 'Zustand' }, { id: 'react-query', label: 'TanStack Query' }, { id: 'nextauth', label: 'NextAuth.js' }, { id: 'postgresql', label: 'PostgreSQL' }, { id: 'redis', label: 'Redis' }, { id: 'stripe', label: 'Stripe' }],
    'web-vue': [{ id: 'nuxt', label: 'Nuxt', recommended: true }, { id: 'vue', label: 'Vue.js (Vite)' }, { id: 'pinia', label: 'Pinia', recommended: true }, { id: 'tailwindcss', label: 'Tailwind CSS' }, { id: 'supabase', label: 'Supabase' }],
    'web-svelte': [{ id: 'sveltekit', label: 'SvelteKit', recommended: true }, { id: 'svelte', label: 'Svelte' }, { id: 'tailwindcss', label: 'Tailwind CSS' }, { id: 'firebase', label: 'Firebase' }],
    'web-angular': [{ id: 'angular', label: 'Angular', recommended: true }, { id: 'rxjs', label: 'RxJS', recommended: true }, { id: 'ngrx', label: 'NgRx' }, { id: 'material', label: 'Angular Material' }],
    'static-jamstack': [{ id: 'astro', label: 'Astro', recommended: true }, { id: 'eleventy', label: '11ty' }, { id: 'hugo', label: 'Hugo' }, { id: 'jekyll', label: 'Jekyll' }, { id: 'gastby', label: 'Gatsby' }],
    'wordpress': [{ id: 'elementor', label: 'Elementor' }, { id: 'acf', label: 'Advanced Custom Fields', recommended: true }, { id: 'woocommerce', label: 'WooCommerce' }, { id: 'rankmath', label: 'Rank Math SEO' }, { id: 'wprocket', label: 'WP Rocket' }, { id: 'wordfence', label: 'Wordfence' }, { id: 'updraftplus', label: 'UpdraftPlus' }, { id: 'smtp', label: 'WP Mail SMTP' }],
    'wordpress-plugin': [{ id: 'php', label: 'PHP', recommended: true }, { id: 'react', label: 'React (Gutenberg)' }, { id: 'composer', label: 'Composer' }],
    'shopify': [{ id: 'liquid', label: 'Liquid', recommended: true }, { id: 'hydrogen', label: 'Hydrogen (React)' }, { id: 'remix', label: 'Remix' }],

    'mobile-rn': [{ id: 'expo', label: 'Expo', recommended: true }, { id: 'react-native-cli', label: 'React Native CLI' }, { id: 'typescript', label: 'TypeScript', recommended: true }, { id: 'reanimated', label: 'Reanimated' }],
    'mobile-flutter': [{ id: 'flutter', label: 'Flutter', recommended: true }, { id: 'dart', label: 'Dart' }, { id: 'bloc', label: 'BLoC' }, { id: 'riverpod', label: 'Riverpod' }, { id: 'firebase', label: 'Firebase' }],
    'mobile-ios': [{ id: 'swiftui', label: 'SwiftUI', recommended: true }, { id: 'uikit', label: 'UIKit' }, { id: 'coredata', label: 'Core Data' }, { id: 'combine', label: 'Combine' }],
    'mobile-android': [{ id: 'compose', label: 'Jetpack Compose', recommended: true }, { id: 'kotlin', label: 'Kotlin' }, { id: 'coroutines', label: 'Coroutines' }, { id: 'retrofit', label: 'Retrofit' }],

    'desktop-macos': [{ id: 'swiftui', label: 'SwiftUI', recommended: true }, { id: 'appkit', label: 'AppKit' }, { id: 'tauri', label: 'Tauri + Rust', recommended: true }, { id: 'electron', label: 'Electron' }, { id: 'coredata', label: 'Core Data' }, { id: 'cloudkit', label: 'CloudKit' }, { id: 'sparkle', label: 'Sparkle (auto-update)' }],
    'desktop-windows': [{ id: 'dotnet', label: '.NET 8', recommended: true }, { id: 'wpf', label: 'WPF' }, { id: 'winui', label: 'WinUI 3' }, { id: 'csharp', label: 'C#' }],
    'desktop-electron': [{ id: 'electron', label: 'Electron', recommended: true }, { id: 'react', label: 'React' }, { id: 'typescript', label: 'TypeScript' }],
    'desktop-tauri': [{ id: 'tauri', label: 'Tauri', recommended: true }, { id: 'rust', label: 'Rust' }, { id: 'react', label: 'React' }, { id: 'svelte', label: 'Svelte' }],
    'cli-tool': [{ id: 'python-click', label: 'Python + Click', recommended: true }, { id: 'python-typer', label: 'Python + Typer' }, { id: 'go-cobra', label: 'Go + Cobra', recommended: true }, { id: 'rust-clap', label: 'Rust + Clap' }, { id: 'nodejs-oclif', label: 'Node.js + Oclif' }],

    'backend-rest': [{ id: 'express', label: 'Express.js' }, { id: 'fastify', label: 'Fastify' }, { id: 'django', label: 'Django' }, { id: 'fastapi', label: 'FastAPI', recommended: true }, { id: 'go-gin', label: 'Go (Gin)' }],
    'backend-graphql': [{ id: 'apollo', label: 'Apollo Server' }, { id: 'graphql-yoga', label: 'GraphQL Yoga' }, { id: 'hasura', label: 'Hasura' }],
    'backend-grpc': [{ id: 'grpc-go', label: 'gRPC (Go)', recommended: true }, { id: 'grpc-java', label: 'gRPC (Java)' }, { id: 'protobuf', label: 'Protobuf' }],
    'microservices': [{ id: 'kubernetes', label: 'Kubernetes' }, { id: 'docker', label: 'Docker' }, { id: 'kafka', label: 'Kafka' }, { id: 'rabbitmq', label: 'RabbitMQ' }, { id: 'istio', label: 'Istio' }, { id: 'consul', label: 'Consul' }],
    'realtime': [{ id: 'socketio', label: 'Socket.io' }, { id: 'websockets', label: 'WebSockets' }, { id: 'redis-pubsub', label: 'Redis Pub/Sub' }, { id: 'pusher', label: 'Pusher' }],

    'ai-llm': [{ id: 'langchain', label: 'LangChain', recommended: true }, { id: 'llamaindex', label: 'LlamaIndex' }, { id: 'openai', label: 'OpenAI API' }, { id: 'huggingface', label: 'Hugging Face' }, { id: 'pinecone', label: 'Pinecone' }],
    'ml-timeseries': [{ id: 'python', label: 'Python', recommended: true }, { id: 'pandas', label: 'Pandas', recommended: true }, { id: 'prophet', label: 'Prophet' }, { id: 'statsmodels', label: 'Statsmodels (ARIMA)' }, { id: 'lightgbm', label: 'LightGBM' }, { id: 'pytorch', label: 'PyTorch (LSTM/TFT)' }, { id: 'sktime', label: 'sktime' }, { id: 'mlflow', label: 'MLflow' }, { id: 'airflow', label: 'Apache Airflow' }, { id: 'fastapi', label: 'FastAPI' }, { id: 'redis', label: 'Redis (cache)' }],
    'ml-computer-vision': [{ id: 'opencv', label: 'OpenCV' }, { id: 'pytorch', label: 'PyTorch', recommended: true }, { id: 'tensorflow', label: 'TensorFlow' }, { id: 'yolo', label: 'YOLO' }],
    'ml-nlp': [{ id: 'spacy', label: 'spaCy' }, { id: 'nltk', label: 'NLTK' }, { id: 'transformers', label: 'Hugging Face Transformers', recommended: true }, { id: 'pytorch', label: 'PyTorch' }],
    'ml-general': [{ id: 'scikit-learn', label: 'scikit-learn', recommended: true }, { id: 'pandas', label: 'Pandas' }, { id: 'numpy', label: 'NumPy' }, { id: 'xgboost', label: 'XGBoost' }],
    'mlops': [{ id: 'mlflow', label: 'MLflow', recommended: true }, { id: 'kubeflow', label: 'Kubeflow' }, { id: 'dvc', label: 'DVC' }, { id: 'bentoml', label: 'BentoML' }],

    'data-engineering': [{ id: 'airflow', label: 'Airflow', recommended: true }, { id: 'spark', label: 'Apache Spark' }, { id: 'dbt', label: 'dbt' }, { id: 'snowflake', label: 'Snowflake' }],
    'data-analytics': [{ id: 'tableau', label: 'Tableau' }, { id: 'powerbi', label: 'PowerBI' }, { id: 'superset', label: 'Apache Superset' }, { id: 'metabase', label: 'Metabase' }],
    'data-streaming': [{ id: 'kafka', label: 'Apache Kafka', recommended: true }, { id: 'flink', label: 'Apache Flink' }, { id: 'spark-streaming', label: 'Spark Structured Streaming' }, { id: 'kafka-streams', label: 'Kafka Streams' }, { id: 'debezium', label: 'Debezium (CDC)' }, { id: 'schema-registry', label: 'Schema Registry (Avro)' }, { id: 'ksqldb', label: 'ksqlDB' }],
    'data-scraping': [{ id: 'scrapy', label: 'Scrapy', recommended: true }, { id: 'playwright', label: 'Playwright' }, { id: 'selenium', label: 'Selenium' }, { id: 'beautifulsoup', label: 'BeautifulSoup' }],

    'devops': [{ id: 'terraform', label: 'Terraform', recommended: true }, { id: 'ansible', label: 'Ansible' }, { id: 'jenkins', label: 'Jenkins' }, { id: 'github-actions', label: 'GitHub Actions' }],
    'devops-k8s': [{ id: 'kubernetes', label: 'Kubernetes', recommended: true }, { id: 'helm', label: 'Helm', recommended: true }, { id: 'argocd', label: 'ArgoCD' }, { id: 'prometheus', label: 'Prometheus' }],

    'game': [{ id: 'unity', label: 'Unity', recommended: true }, { id: 'godot', label: 'Godot' }, { id: 'unreal', label: 'Unreal Engine' }, { id: 'csharp', label: 'C#' }, { id: 'cpp', label: 'C++' }],
    'blockchain': [{ id: 'solidity', label: 'Solidity', recommended: true }, { id: 'hardhat', label: 'Hardhat', recommended: true }, { id: 'foundry', label: 'Foundry' }, { id: 'openzeppelin', label: 'OpenZeppelin', recommended: true }, { id: 'wagmi', label: 'wagmi + viem' }, { id: 'the-graph', label: 'The Graph' }, { id: 'ipfs', label: 'IPFS / Pinata' }, { id: 'chainlink', label: 'Chainlink Oracle' }],
    'browser-extension': [{ id: 'react', label: 'React' }, { id: 'typescript', label: 'TypeScript' }, { id: 'vite', label: 'Vite' }, { id: 'plasmo', label: 'Plasmo' }],
    'vscode-extension': [{ id: 'typescript', label: 'TypeScript', recommended: true }, { id: 'vscode-api', label: 'VS Code API' }, { id: 'yeoman', label: 'Yeoman (generator-code)' }],
    'bot-automation': [{ id: 'discordjs', label: 'Discord.js' }, { id: 'python-telegram-bot', label: 'Python Telegram Bot' }, { id: 'puppeteer', label: 'Puppeteer' }],
    'iot-embedded': [{ id: 'esp32', label: 'ESP32 (ESP-IDF)', recommended: true }, { id: 'arduino', label: 'Arduino' }, { id: 'raspberry-pi', label: 'Raspberry Pi (Python)' }, { id: 'zephyr', label: 'Zephyr RTOS' }, { id: 'mqtt', label: 'MQTT', recommended: true }, { id: 'freertos', label: 'FreeRTOS' }, { id: 'tflite-micro', label: 'TF Lite Micro' }, { id: 'aws-iot', label: 'AWS IoT Core' }],
};
