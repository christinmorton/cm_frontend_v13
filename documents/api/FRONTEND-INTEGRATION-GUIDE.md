# Frontend Integration Guide for WP Business Essentials Pro

## Overview

This guide provides everything needed to build a React/Next.js frontend application that connects to the WordPress Business Essentials Pro REST API backend.

**Backend Status:** ✅ Production Ready (all critical tasks complete)
**API Version:** v1
**Authentication:** JWT (JSON Web Tokens)

---

## Table of Contents

1. [API Base URL & Authentication](#api-base-url--authentication)
2. [Complete API Endpoint Reference](#complete-api-endpoint-reference)
3. [Authentication Flow](#authentication-flow)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Recommended Tech Stack](#recommended-tech-stack)
6. [Project Structure](#project-structure)
7. [API Client Setup](#api-client-setup)
8. [Authentication Hooks](#authentication-hooks)
9. [Data Fetching Patterns](#data-fetching-patterns)
10. [Key Frontend Pages](#key-frontend-pages)
11. [Forms & Validation](#forms--validation)
12. [Error Handling](#error-handling)
13. [Testing Checklist](#testing-checklist)

---

## API Base URL & Authentication

### Base URL
```
http://yoursite.local/wp-json/wpbe/v1
```

**Production:** Replace `yoursite.local` with your actual domain

### Authentication Headers
All protected endpoints require JWT token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### JWT Token Endpoint
```
POST /wp-json/jwt-auth/v1/token
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "user@example.com",
  "user_nicename": "username",
  "user_display_name": "Display Name"
}
```

---

## Complete API Endpoint Reference

### 🔓 Public Endpoints (No Authentication)

#### Services
```
GET  /services                    - List all services
GET  /services/{id}                - Get single service
```

#### Testimonials
```
GET  /testimonials                 - List all testimonials
GET  /testimonials/approved        - List approved only
GET  /testimonials/{id}            - Get single testimonial
```

#### Case Studies
```
GET  /case-studies                 - List all case studies
GET  /case-studies/featured        - List featured only
GET  /case-studies/{id}            - Get single case study
```

#### FAQs
```
GET  /faqs                         - List all FAQs
GET  /faqs/{id}                    - Get single FAQ
GET  /faqs/category/{category}     - FAQs by category
```

#### Social Proof
```
GET  /social-proof                 - List all social proof items
```

#### Dynamic Sections
```
GET  /dynamic-sections             - List all sections
GET  /dynamic-sections/public      - Public sections only
```

#### Lead Capture (Contact Forms)
```
POST /leads
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "company_name": "Acme Corp",
  "source": "contact_form",
  "message": "I'm interested in your services"
}
```

#### Form Submissions
```
POST /form-submissions
Content-Type: application/json

{
  "form_name": "newsletter_signup",
  "form_data": {
    "email": "user@example.com",
    "interests": ["web_development", "seo"]
  },
  "source_url": "https://example.com/contact"
}
```

#### Appointment Availability
```
GET  /appointments/available-slots?date=2026-01-15
```

---

### 🔐 Authentication Endpoint (JWT Required)

#### Current User Info
```
GET  /auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "role": "client",
  "client_id": 456,
  "client_data": {
    "company_name": "Acme Corp",
    "service_tier": "gold",
    "status": "active"
  }
}
```

---

### 👤 Client Portal Endpoints (JWT + Client Role)

#### Clients
```
GET  /clients                      - List clients (admin: all, client: own)
GET  /clients/me                   - Get current client record
GET  /clients/{id}                 - Get single client
PUT  /clients/{id}                 - Update client (own record only)
```

**Client Object:**
```json
{
  "id": 456,
  "user_id": 123,
  "company_name": "Acme Corp",
  "contact_person": "John Doe",
  "email": "john@acme.com",
  "phone": "555-1234",
  "service_tier": "gold",
  "total_spent": 15000.00,
  "status": "active",
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

#### Projects
```
GET  /projects                     - List projects (filtered by ownership)
GET  /projects/my                  - Current client's projects
GET  /projects/{id}                - Get single project
GET  /projects/status/{status}     - Projects by status
```

**Project Statuses:** `planning`, `in_progress`, `review`, `completed`, `archived`

**Project Object:**
```json
{
  "id": 789,
  "client_id": 456,
  "service_id": 12,
  "project_name": "Website Redesign",
  "description": "Complete website overhaul",
  "status": "in_progress",
  "priority": "high",
  "budget": 10000.00,
  "actual_cost": 7500.00,
  "start_date": "2026-01-01",
  "deadline": "2026-03-01",
  "completion_date": null,
  "deliverables": ["Homepage", "About Page", "Contact Form"],
  "conversation_id": 101
}
```

#### Invoices
```
GET  /invoices                     - List invoices (filtered by ownership)
GET  /invoices/my                  - Current client's invoices
GET  /invoices/unpaid              - Unpaid invoices
GET  /invoices/{id}                - Get single invoice
```

**Invoice Statuses:** `draft`, `sent`, `paid`, `overdue`, `cancelled`

**Invoice Object:**
```json
{
  "id": 999,
  "invoice_number": "INV-2026-001",
  "client_id": 456,
  "project_id": 789,
  "status": "sent",
  "issue_date": "2026-01-15",
  "due_date": "2026-02-15",
  "paid_date": null,
  "subtotal": 9000.00,
  "tax_amount": 900.00,
  "total_amount": 9900.00,
  "payment_method": "stripe",
  "line_items": [
    {
      "description": "Web Development",
      "quantity": 40,
      "unit_price": 150.00,
      "total": 6000.00
    },
    {
      "description": "Design Work",
      "quantity": 20,
      "unit_price": 150.00,
      "total": 3000.00
    }
  ]
}
```

#### Conversations
```
GET  /conversations                - List conversations (filtered)
GET  /conversations/my             - Current client's conversations
GET  /conversations/{id}           - Get single conversation
PUT  /conversations/{id}           - Update conversation
```

**Conversation Object:**
```json
{
  "id": 101,
  "conversable_type": "project",
  "conversable_id": 789,
  "title": "Website Redesign Discussion",
  "status": "active",
  "last_message_at": "2026-01-13T10:30:00Z",
  "created_at": "2026-01-01T09:00:00Z"
}
```

#### Messages
```
GET  /messages/conversation/{id}   - Messages in conversation
POST /messages                     - Create new message
PUT  /messages/{id}/read           - Mark message as read
GET  /messages/unread/count        - Count unread messages
```

**Message Object:**
```json
{
  "id": 555,
  "conversation_id": 101,
  "sender_type": "client",
  "sender_id": 123,
  "sender_name": "John Doe",
  "subject": "Question about timeline",
  "content": "When will the homepage be ready?",
  "message_type": "inquiry",
  "is_read": false,
  "created_at": "2026-01-13T10:30:00Z"
}
```

#### Tickets
```
GET  /tickets                      - List tickets (filtered)
GET  /tickets/my                   - Current user's tickets
GET  /tickets/open                 - Open tickets
POST /tickets                      - Create new ticket
GET  /tickets/{id}                 - Get single ticket
```

**Ticket Priorities:** `low`, `medium`, `high`, `urgent`
**Ticket Statuses:** `open`, `in_progress`, `resolved`, `closed`

**Ticket Object:**
```json
{
  "id": 333,
  "user_id": 123,
  "title": "Login Issue",
  "description": "Cannot access my account",
  "priority": "high",
  "status": "open",
  "category": "technical_support",
  "conversation_id": 102,
  "created_at": "2026-01-13T09:00:00Z"
}
```

#### Appointments
```
GET  /appointments                 - List appointments (filtered)
GET  /appointments/my              - Current client's appointments
GET  /appointments/upcoming        - Upcoming appointments
POST /appointments                 - Create new appointment
```

**Appointment Object:**
```json
{
  "id": 777,
  "client_id": 456,
  "appointment_date": "2026-01-20",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "appointment_type": "consultation",
  "status": "scheduled",
  "meeting_link": "https://zoom.us/j/123456789",
  "notes": "Project kickoff meeting"
}
```

---

### 🔑 Admin Endpoints (JWT + Administrator Role)

Admins have access to all client endpoints PLUS:

```
POST   /clients                    - Create new client
POST   /projects                   - Create new project
POST   /invoices                   - Create new invoice
DELETE /clients/{id}               - Delete client
DELETE /projects/{id}              - Delete project
DELETE /invoices/{id}              - Delete invoice
GET    /leads                      - View all leads
GET    /form-submissions           - View all form submissions
GET    /analytics-events           - View analytics data
GET    /guest-users                - View guest user tracking
```

---

## Authentication Flow

### 1. Login Flow
```
User Input (email/password)
    ↓
POST /jwt-auth/v1/token
    ↓
Store token in localStorage/cookies
    ↓
GET /wpbe/v1/auth/me (verify token & get user data)
    ↓
Redirect to dashboard
```

### 2. Token Storage
```javascript
// After successful login
localStorage.setItem('jwt_token', response.token);
localStorage.setItem('user_data', JSON.stringify(response.user_data));

// On app load
const token = localStorage.getItem('jwt_token');
if (token) {
  // Add to axios headers
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

### 3. Token Refresh (Optional)
JWT tokens expire after 7 days by default. Implement token refresh:
```
POST /jwt-auth/v1/token/refresh
Authorization: Bearer {old_token}
```

### 4. Logout Flow
```javascript
// Clear local storage
localStorage.removeItem('jwt_token');
localStorage.removeItem('user_data');

// Clear axios headers
delete axios.defaults.headers.common['Authorization'];

// Redirect to login
router.push('/login');
```

---

## User Roles & Permissions

### Role Hierarchy

| Role | Description | Frontend Portal Access | Manages via |
|------|-------------|------------------------|-------------|
| **Guest** | No WP account | ❌ No (public pages only) | N/A |
| **Member** | Basic WP account | ❌ No | N/A |
| **Client** | Service client | ✅ Yes (own data only) | Client Portal (React app) |
| **Admin** | Site administrator | ❌ No (uses WP admin instead) | WordPress Admin Panel |

**Important:** Admins do NOT use the frontend client portal. They manage everything through the WordPress admin panel ("Business Pro" menu).

### Permission Matrix

| Feature | Guest | Member | Client | Admin |
|---------|-------|--------|--------|-------|
| View public content | ✅ | ✅ | ✅ | ✅ |
| Submit leads/forms | ✅ | ✅ | ✅ | ✅ |
| View own projects | ❌ | ❌ | ✅ | ✅ |
| View own invoices | ❌ | ❌ | ✅ | ✅ |
| Create tickets | ❌ | ✅ | ✅ | ✅ |
| Send messages | ❌ | ✅ | ✅ | ✅ |
| Book appointments | ❌ | ✅ | ✅ | ✅ |
| Create projects | ❌ | ❌ | ❌ | ✅ |
| View all data | ❌ | ❌ | ❌ | ✅ |

### Role Checking in Frontend
```javascript
// Get user role
const user = JSON.parse(localStorage.getItem('user_data'));
const isClient = user.role === 'client';
const isAdmin = user.role === 'administrator';

// Conditional rendering
{isClient && <ClientDashboard />}
{isAdmin && <AdminPanel />}
```

---

## Recommended Tech Stack

### Primary Stack (Recommended)
```
Framework:     Next.js 14+ (App Router)
Language:      TypeScript
Styling:       TailwindCSS
State:         Zustand (for global state)
Data Fetching: React Query (@tanstack/react-query)
Forms:         React Hook Form + Zod validation
HTTP Client:   Axios
Auth:          Custom JWT implementation
UI Components: shadcn/ui or Headless UI
```

### Alternative Stack (Also Good)
```
Framework:     Vite + React 18
Language:      TypeScript
Styling:       TailwindCSS
State:         Zustand
Data Fetching: SWR or React Query
Forms:         Formik + Yup
HTTP Client:   Axios
UI:            Material UI or Chakra UI
```

---

## Project Structure

```
/client-portal
├── /app or /src
│   ├── /components
│   │   ├── /auth
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── /dashboard
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentProjects.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── /projects
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectDetails.tsx
│   │   ├── /invoices
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceCard.tsx
│   │   │   └── InvoiceDetails.tsx
│   │   ├── /messages
│   │   │   ├── ConversationList.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   └── MessageComposer.tsx
│   │   ├── /tickets
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   └── TicketDetails.tsx
│   │   ├── /ui
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   └── Layout.tsx
│   ├── /lib
│   │   ├── api.ts                  // Axios instance
│   │   ├── auth.ts                 // Auth helpers
│   │   └── utils.ts                // Utilities
│   ├── /hooks
│   │   ├── useAuth.ts              // Authentication hook
│   │   ├── useProjects.ts          // Projects data hook
│   │   ├── useInvoices.ts          // Invoices data hook
│   │   ├── useMessages.ts          // Messages hook
│   │   └── useTickets.ts           // Tickets hook
│   ├── /store
│   │   ├── authStore.ts            // Zustand auth store
│   │   └── uiStore.ts              // UI state
│   ├── /pages or /app
│   │   ├── login
│   │   ├── dashboard
│   │   ├── projects
│   │   ├── invoices
│   │   ├── messages
│   │   └── tickets
│   └── /types
│       ├── api.ts                  // API response types
│       └── models.ts               // Entity types
├── .env.local
├── package.json
└── tsconfig.json
```

---

## API Client Setup

### 1. Create Axios Instance
**File:** `lib/api.ts`

```typescript
import axios from 'axios';

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/wp-json/wpbe/v1';
export const JWT_AUTH_URL = process.env.NEXT_PUBLIC_JWT_URL || 'http://localhost/wp-json/jwt-auth/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (add JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Environment Variables
**File:** `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://yoursite.local/wp-json/wpbe/v1
NEXT_PUBLIC_JWT_URL=http://yoursite.local/wp-json/jwt-auth/v1
NEXT_PUBLIC_SITE_URL=http://yoursite.local
```

---

## Authentication Hooks

### useAuth Hook
**File:** `hooks/useAuth.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { JWT_AUTH_URL, API_BASE_URL } from '@/lib/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: 'guest' | 'member' | 'client' | 'administrator';
  client_id?: number;
  client_data?: any;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No token');

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!localStorage.getItem('jwt_token'),
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axios.post(`${JWT_AUTH_URL}/token`, credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('jwt_token', data.token);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    queryClient.clear();
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'administrator',
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
}
```

---

## Data Fetching Patterns

### React Query Setup
**File:** `app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Example: Projects Hook
**File:** `hooks/useProjects.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Project {
  id: number;
  client_id: number;
  project_name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'archived';
  budget: number;
  actual_cost: number;
  start_date: string;
  deadline: string;
}

export function useProjects() {
  const queryClient = useQueryClient();

  // Get all projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects/my');
      return response.data;
    },
  });

  // Get single project
  const useProject = (id: number) => {
    return useQuery<Project>({
      queryKey: ['projects', id],
      queryFn: async () => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  return {
    projects,
    isLoading,
    useProject,
  };
}
```

### Example: Invoices Hook
**File:** `hooks/useInvoices.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
}

export function useInvoices() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/invoices/my');
      return response.data;
    },
  });

  const { data: unpaidInvoices } = useQuery<Invoice[]>({
    queryKey: ['invoices', 'unpaid'],
    queryFn: async () => {
      const response = await api.get('/invoices/unpaid');
      return response.data;
    },
  });

  return {
    invoices,
    unpaidInvoices,
    isLoading,
  };
}
```

---

## Key Frontend Pages

### 1. Login Page
**Path:** `/login`

**Features:**
- Email/password form
- Remember me checkbox
- Forgot password link
- Error handling
- Redirect to dashboard on success

**API Calls:**
```typescript
POST /jwt-auth/v1/token
GET  /wpbe/v1/auth/me
```

---

### 2. Dashboard
**Path:** `/dashboard`

**Components:**
- Welcome message with user name
- Stats cards (projects, invoices, messages, tickets)
- Recent projects list
- Upcoming appointments
- Quick actions (create ticket, view invoices)

**API Calls:**
```typescript
GET /auth/me
GET /projects/my
GET /invoices/my
GET /messages/unread/count
GET /tickets/open
GET /appointments/upcoming
```

---

### 3. Projects Page
**Path:** `/projects`

**Features:**
- List all projects with filtering
- Status badges (planning, in progress, completed)
- Budget vs actual cost progress bars
- Click to view project details
- Conversation link

**API Calls:**
```typescript
GET /projects/my
GET /projects/status/{status}
```

---

### 4. Project Details Page
**Path:** `/projects/{id}`

**Features:**
- Full project information
- Deliverables checklist
- Budget breakdown
- Timeline visualization
- Conversation thread
- Related invoices

**API Calls:**
```typescript
GET /projects/{id}
GET /conversations/{conversation_id}
GET /messages/conversation/{conversation_id}
GET /invoices?project_id={id}
```

---

### 5. Invoices Page
**Path:** `/invoices`

**Features:**
- List all invoices
- Filter by status (all, unpaid, paid, overdue)
- Sort by date/amount
- Status badges
- Download PDF (future)
- Pay online (future)

**API Calls:**
```typescript
GET /invoices/my
GET /invoices/unpaid
```

---

### 6. Invoice Details Page
**Path:** `/invoices/{id}`

**Features:**
- Invoice header (number, dates, status)
- Line items table
- Subtotal, tax, total
- Payment information
- Download PDF button (future)
- Pay now button (future)

**API Calls:**
```typescript
GET /invoices/{id}
```

---

### 7. Messages/Conversations Page
**Path:** `/messages`

**Features:**
- Conversation list (like email inbox)
- Unread count badges
- Filter by entity type (project, ticket, client)
- Click to open conversation
- New message button

**API Calls:**
```typescript
GET /conversations/my
GET /messages/unread/count
```

---

### 8. Conversation Thread Page
**Path:** `/messages/{conversation_id}`

**Features:**
- Message thread view
- Real-time message list
- Mark as read on open
- Message composer
- File attachments (future)
- Context header (related project/ticket)

**API Calls:**
```typescript
GET  /messages/conversation/{id}
POST /messages
PUT  /messages/{id}/read
```

---

### 9. Tickets Page
**Path:** `/tickets`

**Features:**
- List all tickets
- Filter by status (open, in progress, resolved)
- Priority badges
- Click to view details
- Create new ticket button

**API Calls:**
```typescript
GET  /tickets/my
GET  /tickets/open
POST /tickets
```

---

### 10. Ticket Details Page
**Path:** `/tickets/{id}`

**Features:**
- Ticket information
- Status and priority
- Conversation thread
- Status updates
- Close ticket button (client can't close)

**API Calls:**
```typescript
GET /tickets/{id}
GET /messages/conversation/{conversation_id}
```

---

### 11. Appointments Page
**Path:** `/appointments`

**Features:**
- Calendar view
- List upcoming appointments
- Book new appointment
- Reschedule/cancel (if allowed)
- Zoom/meet links

**API Calls:**
```typescript
GET  /appointments/my
GET  /appointments/upcoming
GET  /appointments/available-slots
POST /appointments
```

---

## Forms & Validation

### Contact Form (Public)
**Used on:** Marketing website

```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';

const schema = z.object({
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/leads', {
        ...data,
        source: 'contact_form',
      });
      alert('Thank you! We will contact you soon.');
    } catch (error) {
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('first_name')} placeholder="First Name" />
      {errors.first_name && <span>{errors.first_name.message}</span>}

      <input {...register('last_name')} placeholder="Last Name" />
      {errors.last_name && <span>{errors.last_name.message}</span>}

      <input {...register('email')} placeholder="Email" type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <textarea {...register('message')} placeholder="Your message" />
      {errors.message && <span>{errors.message.message}</span>}

      <button type="submit">Send Message</button>
    </form>
  );
}
```

---

### Create Ticket Form
**Used in:** Client portal

```typescript
const ticketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function CreateTicketForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      return await api.post('/tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      alert('Ticket created successfully!');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <input {...register('title')} placeholder="Ticket Title" />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('description')} placeholder="Describe your issue" />
      {errors.description && <span>{errors.description.message}</span>}

      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select {...register('category')}>
        <option value="technical_support">Technical Support</option>
        <option value="billing">Billing</option>
        <option value="general_inquiry">General Inquiry</option>
      </select>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Global Error Handler

```typescript
// lib/errorHandler.ts
import { AxiosError } from 'axios';

export interface APIError {
  code: string;
  message: string;
  status: number;
  data?: any;
}

export function handleAPIError(error: unknown): APIError {
  if (error instanceof AxiosError) {
    return {
      code: error.response?.data?.code || 'unknown_error',
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data?.data,
    };
  }

  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred',
    status: 500,
  };
}

// Usage in components
try {
  await api.post('/tickets', data);
} catch (error) {
  const apiError = handleAPIError(error);

  if (apiError.status === 403) {
    alert('You do not have permission to perform this action.');
  } else if (apiError.status === 401) {
    alert('Your session has expired. Please login again.');
  } else {
    alert(apiError.message);
  }
}
```

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout clears token
- [ ] Protected routes redirect to login
- [ ] Token persists after page refresh
- [ ] Expired token redirects to login

### Client Dashboard
- [ ] Dashboard loads with correct stats
- [ ] User name displays correctly
- [ ] Stats cards show accurate counts
- [ ] Quick actions work

### Projects
- [ ] Projects list loads
- [ ] Filter by status works
- [ ] Project details page loads
- [ ] Conversation link works
- [ ] Budget progress bar displays correctly

### Invoices
- [ ] Invoices list loads
- [ ] Filter by status works
- [ ] Invoice details display correctly
- [ ] Line items calculate correctly
- [ ] Unpaid invoices highlight

### Messages
- [ ] Conversations list loads
- [ ] Unread count displays
- [ ] Open conversation shows messages
- [ ] Send new message works
- [ ] Mark as read updates count

### Tickets
- [ ] Tickets list loads
- [ ] Create ticket form validates
- [ ] Create ticket succeeds
- [ ] Ticket details load
- [ ] Priority badges display correctly

### Public Pages (No Auth)
- [ ] Contact form submits lead
- [ ] Services list loads
- [ ] Testimonials display
- [ ] Case studies load
- [ ] FAQs load

---

## Common Issues & Solutions

### Issue: 401 Unauthorized on all requests
**Solution:**
- Check JWT token is stored in localStorage
- Verify Authorization header is being sent
- Check token hasn't expired (7 days)
- Try logging out and logging back in

### Issue: 403 Forbidden on client endpoints
**Solution:**
- Verify user has 'client' role (check `/auth/me` response)
- Ensure Client CPT record exists for user
- Check user_id in Client record matches logged-in user

### Issue: Empty arrays returned for projects/invoices
**Solution:**
- Check if Client CPT record exists (`GET /clients/me`)
- Verify `client_id` is set in projects/invoices
- Check ownership filtering logic in backend

### Issue: CORS errors
**Solution:**
- Backend already has CORS enabled
- Ensure API URL matches in `.env.local`
- Check browser console for actual error

### Issue: Data not updating after mutation
**Solution:**
- Invalidate React Query cache after mutation
- Use `queryClient.invalidateQueries()` in `onSuccess`

---

## Performance Optimization

### 1. Use React Query Caching
```typescript
// Cache data for 5 minutes
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000,
});
```

### 2. Prefetch Data
```typescript
// Prefetch on hover
<Link
  href="/projects/123"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['projects', 123],
      queryFn: () => fetchProject(123),
    });
  }}
>
  View Project
</Link>
```

### 3. Optimize Images
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={project.thumbnail}
  alt={project.name}
  width={400}
  height={300}
  loading="lazy"
/>
```

---

## Security Best Practices

1. **Never expose JWT token in URL** - Always use Authorization header
2. **Sanitize user input** - Use Zod/Yup validation on all forms
3. **HTTPS only in production** - Enforce SSL/TLS
4. **Don't store sensitive data in localStorage** - Only store token
5. **Implement rate limiting** - Prevent brute force attacks
6. **Use environment variables** - Never hardcode API URLs
7. **Validate all API responses** - Check response structure before using

---

## Deployment Checklist

### Environment Setup
- [ ] Set production API URL in `.env.production`
- [ ] Enable HTTPS on backend
- [ ] Configure CORS for production domain
- [ ] Set up CDN for static assets

### Testing
- [ ] Test all authentication flows
- [ ] Verify all API endpoints work
- [ ] Check mobile responsiveness
- [ ] Test with real data
- [ ] Performance audit (Lighthouse)

### Launch
- [ ] Deploy frontend to hosting (Vercel/Netlify)
- [ ] Set up custom domain
- [ ] Configure DNS
- [ ] Enable SSL certificate
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Google Analytics)

---

## Support & Resources

### Backend Documentation
- Main plugin directory: `wpbe_pro/`
- API Documentation: See `wpbe_pro/ADMIN-MENU-STRUCTURE.md`
- Role Documentation: See `wpbe_pro/ROLE-CONFUSION-FIX.md`
- Project Summary: See `wpbe_pro/PROJECT-SUMMARY.md`

### Useful Links
- React Query Docs: https://tanstack.com/query/latest
- Next.js Docs: https://nextjs.org/docs
- TailwindCSS Docs: https://tailwindcss.com/docs
- Zod Docs: https://zod.dev/

---

## Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest client-portal --typescript --tailwind --app

# Install dependencies
cd client-portal
npm install axios @tanstack/react-query zustand react-hook-form zod @hookform/resolvers/zod

# Install UI library (optional)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Run development server
npm run dev
```

---

**Backend Status:** ✅ Ready for Integration
**API Version:** v1
**Last Updated:** 2026-01-13

Good luck building your frontend! The backend API is solid and ready to go. 🚀
