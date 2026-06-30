'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, Search, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { BrandLogo } from '@/components/brand-logo'
import { clearSession, getStoredUser, type SessionUser } from '@/lib/api-client'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Laws', href: '/laws' },
  { label: 'Opinions', href: '/opinions' },
  { label: 'Categories', href: '/#categories' },
  { label: 'AI Research', href: '/ai-research' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [pathname])

  const isLoggedIn = Boolean(user)

  function handleLogout() {
    clearSession()
    setUser(null)
    setProfileOpen(false)
    setMobileOpen(false)
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/laws?q=${encodeURIComponent(q)}` : '/laws')
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href.split('#')[0]) &&
                  item.href !== '/#categories'
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="relative hidden md:block"
            role="search"
          >
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laws..."
              className="h-9 w-40 pl-8 lg:w-56"
              aria-label="Search laws"
            />
          </form>

          <ThemeToggle />

          {isLoggedIn ? (
            <div className="relative">
              <Button
                variant="outline"
                className="h-9 gap-1.5 px-2.5"
                onClick={() => setProfileOpen((o) => !o)}
                aria-expanded={profileOpen}
              >
                <User className="size-4" />
                <ChevronDown className="size-3.5" />
              </Button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg"
                  >
                    <Link
                      href={user?.role === 'admin' ? '/admin/dashboard' : '/pricing'}
                      className="block rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      {user?.role === 'admin' ? 'Admin Dashboard' : 'My Plan'}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" className="h-9 px-3" render={<Link href="/login" />}>
                Login
              </Button>
              <Button className="h-9 px-3.5" render={<Link href="/register" />}>
                Register
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              <form onSubmit={handleSearch} className="relative mb-3" role="search">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search laws, cases, sections..."
                  className="pl-8"
                  aria-label="Search laws"
                />
              </form>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="h-9 flex-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-9 flex-1"
                      render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                    >
                      Login
                    </Button>
                    <Button
                      className="h-9 flex-1"
                      render={<Link href="/register" onClick={() => setMobileOpen(false)} />}
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
