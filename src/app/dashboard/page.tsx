import { redirect } from 'next/navigation'

// Dashboard has moved to the root path
export default function DashboardRedirect() {
  redirect('/')
}
