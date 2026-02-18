import { ProjectTypeId } from '../types';

export interface ProjectTypeDefinition {
    id: ProjectTypeId;
    label: string;
    icon: any; // Using string type for vector icons, but 'any' to avoid strict type issues with potential icon libraries
    color: string;
    group: string;
}

export const PROJECT_TYPES: ProjectTypeDefinition[] = [
    // 🌐 Web
    { id: 'web-react', label: 'React / Next.js App', icon: 'react', color: '#61dafb', group: 'Web' },
    { id: 'web-vue', label: 'Vue / Nuxt App', icon: 'vuejs', color: '#42b883', group: 'Web' },
    { id: 'web-svelte', label: 'Svelte / SvelteKit', icon: 'code-braces', color: '#ff3e00', group: 'Web' },
    { id: 'web-angular', label: 'Angular App', icon: 'angular', color: '#dd0031', group: 'Web' },
    { id: 'static-jamstack', label: 'Static Site / JAMstack', icon: 'lightning-bolt', color: '#f59e0b', group: 'Web' },
    { id: 'wordpress', label: 'WordPress Site', icon: 'wordpress', color: '#21759b', group: 'Web' },
    { id: 'wordpress-plugin', label: 'WordPress Plugin', icon: 'puzzle', color: '#00b9eb', group: 'Web' },
    { id: 'shopify', label: 'Shopify Theme / App', icon: 'shopping', color: '#96bf48', group: 'Web' },

    // 📱 Mobile
    { id: 'mobile-rn', label: 'React Native App', icon: 'cellphone', color: '#61dafb', group: 'Mobile' },
    { id: 'mobile-flutter', label: 'Flutter App', icon: 'cellphone', color: '#54c5f8', group: 'Mobile' },
    { id: 'mobile-ios', label: 'iOS Native (SwiftUI)', icon: 'apple-ios', color: '#a2845e', group: 'Mobile' },
    { id: 'mobile-android', label: 'Android Native (Compose)', icon: 'android', color: '#3ddc84', group: 'Mobile' },

    // 🖥 Desktop
    { id: 'desktop-macos', label: 'macOS App (Swift/Tauri)', icon: 'apple', color: '#999999', group: 'Desktop' },
    { id: 'desktop-windows', label: 'Windows App (.NET/WPF)', icon: 'microsoft-windows', color: '#0078d4', group: 'Desktop' },
    { id: 'desktop-electron', label: 'Cross-platform (Electron)', icon: 'electron-framework', color: '#9feaf9', group: 'Desktop' },
    { id: 'desktop-tauri', label: 'Cross-platform (Tauri)', icon: 'language-rust', color: '#ffc131', group: 'Desktop' },
    { id: 'cli-tool', label: 'CLI Tool', icon: 'console-line', color: '#4ade80', group: 'Desktop' },

    // 🔧 Backend
    { id: 'backend-rest', label: 'REST API', icon: 'api', color: '#6366f1', group: 'Backend' },
    { id: 'backend-graphql', label: 'GraphQL API', icon: 'graphql', color: '#e10098', group: 'Backend' },
    { id: 'backend-grpc', label: 'gRPC Service', icon: 'server', color: '#00add8', group: 'Backend' },
    { id: 'microservices', label: 'Microservices', icon: 'sitemap', color: '#f97316', group: 'Backend' },
    { id: 'realtime', label: 'Real-time / WebSocket', icon: 'access-point', color: '#10b981', group: 'Backend' },

    // 🤖 AI / ML
    { id: 'ai-llm', label: 'LLM / RAG App', icon: 'brain', color: '#60a5fa', group: 'AI/ML' },
    { id: 'ml-timeseries', label: 'Time Series / Forecasting', icon: 'chart-timeline', color: '#f59e0b', group: 'AI/ML' },
    { id: 'ml-computer-vision', label: 'Computer Vision', icon: 'eye-outline', color: '#06b6d4', group: 'AI/ML' },
    { id: 'ml-nlp', label: 'NLP / Text Processing', icon: 'text-search', color: '#38bdf8', group: 'AI/ML' },
    { id: 'ml-general', label: 'ML / Data Science', icon: 'chart-scatter-plot', color: '#ec4899', group: 'AI/ML' },
    { id: 'mlops', label: 'MLOps / Model Serving', icon: 'robot-industrial', color: '#14b8a6', group: 'AI/ML' },

    // 📊 Data
    { id: 'data-engineering', label: 'Data Engineering / ETL', icon: 'pipe', color: '#0ea5e9', group: 'Data' },
    { id: 'data-analytics', label: 'Analytics / BI Dashboard', icon: 'chart-bar', color: '#f97316', group: 'Data' },
    { id: 'data-streaming', label: 'Streaming (Kafka/Flink)', icon: 'waveform', color: '#ef4444', group: 'Data' },
    { id: 'data-scraping', label: 'Web Scraping / Crawling', icon: 'spider-web', color: '#84cc16', group: 'Data' },

    // ⚙️ Infrastructure
    { id: 'devops', label: 'DevOps / Infrastructure', icon: 'cog-outline', color: '#64748b', group: 'Infra' },
    { id: 'devops-k8s', label: 'Kubernetes / Helm', icon: 'kubernetes', color: '#326ce5', group: 'Infra' },

    // 🎮 Other
    { id: 'game', label: 'Game (Unity/Godot)', icon: 'gamepad-variant', color: '#f97316', group: 'Game' },
    { id: 'blockchain', label: 'Blockchain / Smart Contract', icon: 'ethereum', color: '#627eea', group: 'Other' },
    { id: 'browser-extension', label: 'Browser Extension', icon: 'puzzle-outline', color: '#fbbf24', group: 'Other' },
    { id: 'vscode-extension', label: 'VS Code Extension', icon: 'microsoft-visual-studio-code', color: '#007acc', group: 'Other' },
    { id: 'bot-automation', label: 'Bot / Automation', icon: 'robot-outline', color: '#a3e635', group: 'Other' },
    { id: 'iot-embedded', label: 'IoT / Embedded', icon: 'chip', color: '#34d399', group: 'Other' },
];
