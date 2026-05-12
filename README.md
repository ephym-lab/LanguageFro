# Language Dataset Platform

A modern, culturally-aware platform for exploring, contributing to, and managing indigenous African language datasets. Built with Next.js 16, TanStack Query, and Tailwind CSS with warm earthy African-inspired design.

## Features

### Contributor Features
- **Browse Datasets** - Explore language datasets filtered by tribe, language, and category
- **Vote on Responses** - Rate translations and transcriptions based on accuracy and cultural authenticity
- **Submit Contributions** - Add text responses and voice recordings to datasets
- **Track Responses** - View your contributions and their approval ratings
- **User Settings** - Manage profile and preferences

### Admin Features
- **User Management** - Create, edit, delete, and manage user roles
- **Dataset Management** - Create and manage language datasets with full CRUD operations
- **Language Management** - Organize by languages and dialects with cascading subtribes
- **Category Management** - Manage content categories for better organization
- **Tribe Management** - Organize languages by indigenous tribes and communities
- **Analytics Dashboard** - View platform statistics and contributor activity

### Advanced Features
- **Voice Recording** - Record native speaker pronunciations directly in the browser
- **AI Translation** - Generate translations using AI (when configured)
- **Translation Management** - Create, edit, and vote on translations

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19
- **State Management**: TanStack Query v5 (for server state), React Context (for auth)
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS v4 with custom theme
- **Components**: shadcn/ui with Radix UI
- **HTTP Client**: Axios with custom interceptors
- **Icons**: Lucide React

## Project Structure

```
app/
  ├── (auth)/              # Authentication pages
  │   ├── login/
  │   ├── register/
  │   └── otp-verify/
  ├── dashboard/           # Contributor dashboard
  │   ├── datasets/        # Browse and view datasets
  │   ├── my-responses/    # Track submissions
  │   └── settings/        # User settings
  ├── admin/               # Admin dashboard
  │   ├── users/          # User management
  │   ├── datasets/       # Dataset management
  │   ├── languages/      # Language management
  │   ├── tribes/         # Tribe management
  │   └── categories/     # Category management
  └── layout.tsx          # Root layout with providers

components/
  ├── VoiceRecorder.tsx    # Audio recording component
  ├── VotingInterface.tsx  # Response voting
  ├── DatasetCard.tsx      # Dataset preview
  ├── DataTable.tsx        # Reusable admin table
  ├── ProtectedRoute.tsx   # Auth protection wrapper
  └── ui/                  # shadcn/ui components

lib/
  ├── api.ts              # Axios instance with interceptors
  ├── context/
  │   └── auth.tsx        # Authentication context
  ├── queries/            # TanStack Query hooks
  │   ├── auth.ts
  │   ├── datasets.ts
  │   ├── languages.ts
  │   ├── tribes.ts
  │   ├── categories.ts
  │   ├── votes.ts
  │   ├── responses.ts
  │   ├── translations.ts
  │   └── admin.ts
  └── types/
      └── index.ts        # TypeScript type definitions
```

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd language-dataset-platform
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Update the variables:

```env
# Point to your backend API server
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Ensure Backend is Running

This frontend expects a backend API server running with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/datasets` - List datasets
- `GET /api/datasets/:id` - Get dataset details
- `GET /api/languages` - List languages
- `GET /api/tribes` - List tribes
- `GET /api/categories` - List categories
- And all other endpoints defined in the OpenAPI spec

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

1. **Registration**: User signs up with email/username
2. **OTP Verification**: System sends OTP for email verification
3. **JWT Tokens**: Backend returns access and refresh tokens
4. **Secure Storage**: Tokens stored in httpOnly cookies (set by backend)
5. **Auto-Refresh**: TanStack Query handles token refresh automatically

## Key Patterns

### TanStack Query Usage

All server state is managed through TanStack Query hooks in `lib/queries/`:

```typescript
// Fetching data
const { data, isLoading, error } = useGetDatasets()

// Mutations with optimistic updates
const createDataset = useCreateDataset()
await createDataset.mutateAsync(data)
```

### Protected Routes

Routes requiring authentication are wrapped with `ProtectedRoute`:

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Form Handling

Forms use React Hook Form with Zod validation:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<DatasetForm>({
  resolver: zodResolver(datasetSchema),
})
```

## Design System

### Color Palette (Warm Earthy African Tones)

- **Primary**: Ochre/Terracotta (warm brown-orange)
- **Secondary**: Earth Brown (warm brown)
- **Accent**: Complementary warm tone
- **Neutrals**: Warm grays and off-whites
- **Background**: Soft warm cream

### Typography

- **Headings**: Geist font family
- **Body**: Geist font family
- **Monospace**: Geist Mono

All colors use CSS custom properties defined in `app/globals.css` for easy theming.

## API Integration

The API client is configured in `lib/api.ts` with:

- **Base URL**: `NEXT_PUBLIC_API_URL`
- **Axios Interceptors**: Auto token injection and refresh
- **Error Handling**: Standardized error responses
- **Request/Response**: JSON serialization with proper headers

## Voice Recording

The `VoiceRecorder` component uses the Web Audio API:

- Records audio in WebM format
- Provides preview and playback
- Handles microphone permissions gracefully
- Converts to Blob for upload

## Development Tips

### Hot Module Replacement

Changes are automatically reflected in the browser without full page reload.

### Query Debugging

Enable TanStack Query DevTools by adding it to your layout:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools />
</QueryClientProvider>
```

### Testing API Calls

Check the Network tab in browser DevTools to inspect:

- Request/response payloads
- Status codes
- Token headers
- CORS issues

## Deployment

### To Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy automatically on push

### To Other Platforms

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

## Common Issues

### API Not Found

- Ensure backend is running on the URL specified in `NEXT_PUBLIC_API_URL`
- Check CORS headers if frontend and backend are on different domains
- Verify API endpoints match the OpenAPI spec

### Authentication Fails

- Check that `NEXT_PUBLIC_API_URL` points to the correct backend
- Verify tokens are being stored in httpOnly cookies by the backend
- Check browser DevTools Network tab for 401 errors

### Voice Recording Permission Denied

- Ensure HTTPS in production (microphone requires secure context)
- Check browser microphone permissions
- Some browsers require user interaction before accessing microphone

## Contributing

1. Follow the existing project structure and patterns
2. Use TypeScript for all new code
3. Keep components small and reusable
4. Update type definitions in `lib/types/`
5. Add TanStack Query hooks for new API endpoints

## License

[Your License Here]

## Support

For issues or questions:
1. Check the GitHub issues
2. Review the OpenAPI spec for API reference
3. Consult the design guidelines in the codebase
# LanguageFro
