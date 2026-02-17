export type ProjectTypeId =
    | 'web-react' | 'web-vue' | 'web-svelte' | 'web-angular'
    | 'static-jamstack' | 'wordpress' | 'wordpress-plugin' | 'shopify'
    | 'mobile-rn' | 'mobile-flutter' | 'mobile-ios' | 'mobile-android'
    | 'desktop-macos' | 'desktop-windows' | 'desktop-electron' | 'desktop-tauri' | 'cli-tool'
    | 'backend-rest' | 'backend-graphql' | 'backend-grpc' | 'microservices' | 'realtime'
    | 'ai-llm' | 'ml-timeseries' | 'ml-computer-vision' | 'ml-nlp' | 'ml-general' | 'mlops'
    | 'data-engineering' | 'data-analytics' | 'data-streaming' | 'data-scraping'
    | 'devops' | 'devops-k8s'
    | 'game' | 'blockchain' | 'browser-extension' | 'vscode-extension'
    | 'bot-automation' | 'iot-embedded';

export type Phase = 'planning' | 'coding' | 'testing' | 'deployment' | 'scaling';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface ChecklistItemTemplate {
    id: string;
    title: string;
    description: string;
    details: string;                  // Step-by-step guide, command examples
    prompt: string;                   // Paste-ready AI prompt
    tags: string[];
    priority: Priority;
    estimatedMinutes: number;
    experienceLevels: Experience[];
    stackSpecific?: string[];         // undefined = show for all stacks in this project type
    phaseSpecific: Phase[];
    projectTypeIds: ProjectTypeId[];
}

export interface GeneratedChecklist {
    id: string;
    title: string;
    projectType: ProjectTypeId;
    phase: Phase;
    techStack: string[];
    experience: Experience;
    goal?: string;
    createdAt: number;
    updatedAt: number;
    items: GeneratedChecklistItem[];
}

export interface GeneratedChecklistItem extends ChecklistItemTemplate {
    completed: boolean;
    completedAt?: number;
    notes?: string;
}

export interface TechOption {
    id: string;
    label: string;
    recommended?: boolean;
}
