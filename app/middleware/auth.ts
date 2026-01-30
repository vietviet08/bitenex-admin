export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  // Skip auth check for login page
  if (to.path === '/admin/login') {
    // If already authenticated, redirect to dashboard
    if (authStore.isAuthenticated) {
      return navigateTo('/admin')
    }
    return
  }

  // For all other /admin/* routes, require authentication
  if (to.path.startsWith('/admin') && !authStore.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
