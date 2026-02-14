export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()

  if (to.path === '/') {
    return navigateTo(authStore.isAuthenticated ? '/admin' : '/admin/login')
  }

  // Skip auth check for login page
  if (to.path === '/admin/login') {
    if (authStore.isAuthenticated) {
      const next = to.query.next as string | undefined
      return navigateTo(next || '/admin')
    }
    return
  }

  // For all other /admin/* routes, require authentication
  if (to.path.startsWith('/admin') && !authStore.isAuthenticated) {
    // Preserve the intended destination so login can redirect back
    return navigateTo({
      path: '/admin/login',
      query: { next: to.fullPath },
    })
  }
})
