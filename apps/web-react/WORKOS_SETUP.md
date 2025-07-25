# WorkOS AuthKit Integration

This React app is now integrated with WorkOS AuthKit for authentication.

## Setup Instructions

### 1. WorkOS Dashboard Configuration

1. Go to your [WorkOS Dashboard](https://dashboard.workos.com/)
2. Navigate to "Authentication" page
3. Click "Configure CORS" and add your site's URL:
   - For development: `http://localhost:3000`
   - For production: Your production URL
4. On the "Redirects" page, add the following redirect URI:
   - `http://localhost:3000/login` (for development)
   - `https://yourdomain.com/login` (for production)

### 2. Environment Variables

Create a `.env` file in the `apps/web-react` directory with:

```env
VITE_WORKOS_CLIENT_ID=your_workos_client_id
VITE_WORKOS_API_HOSTNAME=api.workos.com
```

Replace `your_workos_client_id` with your actual WorkOS Client ID from the dashboard.

### 3. Testing the Integration

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Visit the authentication demo page:
   ```
   http://localhost:3000/auth-demo
   ```

3. Try the following:
   - Click "Sign In" or "Sign Up" to authenticate
   - Visit `/dashboard` to see a protected route
   - Check the user menu in the sidebar for sign out functionality

## Key Components

### AuthKitProvider
Located in `src/main.tsx`, wraps the entire application with WorkOS authentication context.

### Protected Routes
- `/dashboard` - Example of a protected route that requires authentication
- `/login` - Handles the OAuth callback and redirects

### Authentication UI
- Sidebar navigation shows user info when authenticated
- Sign in/out buttons adapt based on authentication state
- User avatar and account menu integrated with WorkOS user data

### Auth Demo Page
Visit `/auth-demo` for a complete demonstration of:
- Sign in/Sign up flows
- User information display
- Access token retrieval
- Sign out functionality

## API Usage

Use the `useAuth` hook from `@workos-inc/authkit-react`:

```tsx
import { useAuth } from "@workos-inc/authkit-react"

function MyComponent() {
  const { user, signIn, signOut, getAccessToken, isLoading } = useAuth()
  
  // Check if user is authenticated
  if (user) {
    // User is signed in
  }
  
  // Get access token for API calls
  const makeApiCall = async () => {
    const token = await getAccessToken()
    // Use token in API requests
  }
}
```

## Next Steps

1. Configure your WorkOS organization settings
2. Set up custom domains for authentication
3. Configure SSO connections if needed
4. Implement proper error handling for authentication flows
5. Add user profile management features