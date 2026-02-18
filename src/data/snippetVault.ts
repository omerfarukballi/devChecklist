// Snippet Vault: keyed by checklist item keywords → framework → code snippet
// Matching is done by checking if the item title contains any of the keys

export interface Snippet {
    label: string;
    language: string;
    code: string;
}

export interface SnippetEntry {
    keywords: string[];
    snippets: Snippet[];
}

export const SNIPPET_VAULT: SnippetEntry[] = [
    {
        keywords: ['jwt', 'json web token', 'authentication token'],
        snippets: [
            {
                label: 'Node.js / Express',
                language: 'javascript',
                code: `const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};`,
            },
            {
                label: 'Python / FastAPI',
                language: 'python',
                code: `from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")`,
            },
        ],
    },
    {
        keywords: ['rate limit', 'rate limiting', 'throttle'],
        snippets: [
            {
                label: 'Express (express-rate-limit)',
                language: 'javascript',
                code: `const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);`,
            },
            {
                label: 'Python / FastAPI (slowapi)',
                language: 'python',
                code: `from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/data")
@limiter.limit("100/minute")
async def get_data(request: Request):
    return {"data": "ok"}`,
            },
        ],
    },
    {
        keywords: ['github actions', 'ci/cd', 'continuous integration', 'workflow'],
        snippets: [
            {
                label: 'Node.js CI/CD',
                language: 'yaml',
                code: `name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod --token=\${{ secrets.VERCEL_TOKEN }}`,
            },
            {
                label: 'EAS Build (Expo)',
                language: 'yaml',
                code: `name: EAS Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g eas-cli
      - run: npm ci
      - name: Build iOS
        run: eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}`,
            },
        ],
    },
    {
        keywords: ['docker', 'dockerfile', 'containerize'],
        snippets: [
            {
                label: 'Node.js Dockerfile',
                language: 'dockerfile',
                code: `FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
            },
            {
                label: 'Python / FastAPI Dockerfile',
                language: 'dockerfile',
                code: `FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
            },
        ],
    },
    {
        keywords: ['sentry', 'error monitoring', 'crash reporting'],
        snippets: [
            {
                label: 'React Native (Expo)',
                language: 'javascript',
                code: `import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: __DEV__ ? 'development' : 'production',
});

// Wrap your root component
export default Sentry.wrap(App);`,
            },
            {
                label: 'Next.js',
                language: 'javascript',
                code: `// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});`,
            },
        ],
    },
    {
        keywords: ['environment variable', 'env', '.env', 'dotenv'],
        snippets: [
            {
                label: '.env.example',
                language: 'bash',
                code: `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Auth
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# External APIs
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NODE_ENV=development
PORT=3000`,
            },
            {
                label: 'Expo (app.config.js)',
                language: 'javascript',
                code: `export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
      revenueCatKey: process.env.REVENUECAT_KEY,
    },
  },
};

// Usage:
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;`,
            },
        ],
    },
    {
        keywords: ['postgresql', 'database migration', 'prisma', 'schema'],
        snippets: [
            {
                label: 'Prisma Schema',
                language: 'prisma',
                code: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}`,
            },
        ],
    },
    {
        keywords: ['stripe', 'payment', 'checkout', 'billing'],
        snippets: [
            {
                label: 'Next.js API Route',
                language: 'javascript',
                code: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { priceId, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/pricing\`,
    metadata: { userId },
  });

  return Response.json({ url: session.url });
}`,
            },
            {
                label: 'Webhook Handler',
                language: 'javascript',
                code: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Activate subscription
      break;
    case 'customer.subscription.deleted':
      // Deactivate subscription
      break;
  }

  return new Response('OK');
}`,
            },
        ],
    },
    {
        keywords: ['redis', 'cache', 'caching'],
        snippets: [
            {
                label: 'Node.js (ioredis)',
                language: 'javascript',
                code: `import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache with TTL
async function getOrSet(key, ttlSeconds, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Usage
const user = await getOrSet(\`user:\${userId}\`, 300, () => db.user.findUnique({ where: { id: userId } }));`,
            },
        ],
    },
    {
        keywords: ['cors', 'cross-origin', 'access-control'],
        snippets: [
            {
                label: 'Express',
                language: 'javascript',
                code: `const cors = require('cors');

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));`,
            },
            {
                label: 'FastAPI',
                language: 'python',
                code: `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"] if IS_PROD else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`,
            },
        ],
    },
    {
        keywords: ['push notification', 'fcm', 'apns', 'expo notifications'],
        snippets: [
            {
                label: 'Expo Push Notifications',
                language: 'javascript',
                code: `import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}`,
            },
        ],
    },
    {
        keywords: ['revenuecat', 'in-app purchase', 'subscription', 'paywall'],
        snippets: [
            {
                label: 'React Native Setup',
                language: 'javascript',
                code: `import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// Initialize (call once on app start)
Purchases.setLogLevel(LOG_LEVEL.DEBUG);
await Purchases.configure({ apiKey: 'appl_YOUR_KEY' });

// Fetch offerings
const offerings = await Purchases.getOfferings();
const currentOffering = offerings.current;

// Purchase
const { customerInfo } = await Purchases.purchasePackage(package);

// Check entitlement
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;`,
            },
        ],
    },
    {
        keywords: ['supabase', 'database', 'realtime'],
        snippets: [
            {
                label: 'Supabase Client Setup',
                language: 'javascript',
                code: `import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Query with RLS
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Real-time subscription
const channel = supabase
  .channel('posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
    console.log('Change:', payload);
  })
  .subscribe();`,
            },
        ],
    },
];

export function findSnippetsForItem(itemTitle: string): SnippetEntry | null {
    const lower = itemTitle.toLowerCase();
    return SNIPPET_VAULT.find(entry =>
        entry.keywords.some(kw => lower.includes(kw))
    ) ?? null;
}
