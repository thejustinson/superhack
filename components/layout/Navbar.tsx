'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/hackathons',    label: 'Hackathons' },
  { href: '/winners',       label: 'Winners' },
  { href: '/universities',  label: 'Universities' },
  { href: '/ideas',         label: 'Ideas' },
  { href: '/learn',         label: 'Learn' },
  { href: '/docs',          label: 'Docs' },
]

function initials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useAuth()

  // Scroll border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  function isActive(href: string) {
    if (href === '/#how-it-works') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* ── Bar ── */}
      <header
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          zIndex:          50,
          height:          '72px',
          background:      'rgba(11,12,15,0.85)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:    scrolled
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid rgba(255,255,255,0.07)',
          transition:      'border-color 0.3s',
        }}
      >
        <nav
          style={{
            maxWidth:       '1200px',
            margin:         '0 auto',
            padding:        '0 28px',
            height:         '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Image
              src="/logo-with-logotype.svg"
              alt="Superhack"
              height={28}
              width={120}
              style={{ height: '28px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop links — hidden below lg */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '40px' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily:     "'DM Sans', system-ui, sans-serif",
                  fontSize:       '0.875rem',
                  fontWeight:     400,
                  color:          isActive(link.href) ? 'var(--accent)' : 'var(--muted)',
                  textDecoration: 'none',
                  transition:     'color 200ms',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive(link.href) ? 'var(--accent)' : 'var(--muted)'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth — hidden below lg */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '12px' }}>
            {user ? (
              <Link
                href="/dashboard"
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '10px',
                  textDecoration: 'none',
                  color:          'var(--text)',
                  fontFamily:     "'DM Sans', system-ui, sans-serif",
                  fontSize:       '0.875rem',
                  fontWeight:     500,
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name ?? 'User'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover cursor-pointer"
                    onClick={() => router.push('/dashboard')}
                    style={{ flexShrink: 0, width: '32px', height: '32px', flexGrow: 0 }}
                  />
                ) : (
                  // Fallback: initials circle
                  <div
                    className="w-8 h-8 rounded-full bg-accent flex items-center justify-center cursor-pointer text-bg text-xs font-bold"
                    onClick={() => router.push('/dashboard')}
                    style={{ flexShrink: 0 }}
                  >
                    {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                )}
                {profile?.full_name?.split(' ')[0] ?? 'Account'}
              </Link>
            ) : (
              <Link
                href="/auth"
                style={{
                  fontFamily:     "'DM Sans', system-ui, sans-serif",
                  fontWeight:     600,
                  fontSize:       '0.875rem',
                  padding:        '0.5rem 1.25rem',
                  borderRadius:   '8px',
                  backgroundColor:'var(--accent)',
                  color:          '#0b0c0f',
                  textDecoration: 'none',
                  transition:     'opacity 200ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Get started
              </Link>
            )}
          </div>

          {/* Hamburger — hidden on lg+ */}
          <button
            className="lg:hidden flex items-center"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              padding:    '4px',
              color:      'var(--text)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex' }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ opacity: 0, rotate: 45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex' }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* ── Mobile menu — never renders on lg+ ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden">
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position:       'fixed',
                  inset:          0,
                  zIndex:         98,
                  background:     'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
              />

              {/* Panel */}
              <motion.div
                key="panel"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position:    'fixed',
                  top:         0,
                  right:       0,
                  bottom:      0,
                  width:       '75vw',
                  maxWidth:    '320px',
                  zIndex:      99,
                  background:  'var(--surface)',
                  borderLeft:  '1px solid rgba(255,255,255,0.07)',
                  display:     'flex',
                  flexDirection:'column',
                  overflowX:   'hidden',
                  overflowY:   'auto',
                }}
              >
                {/* Panel header */}
                <div
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '1.25rem 1.5rem',
                    borderBottom:   '1px solid rgba(255,255,255,0.07)',
                    flexShrink:     0,
                  }}
                >
                  <Link href="/" onClick={() => setIsOpen(false)} style={{ display: 'flex' }}>
                    <Image
                      src="/logo-with-logotype.svg"
                      alt="Superhack"
                      height={24}
                      width={100}
                      style={{ height: '24px', width: 'auto' }}
                    />
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                    style={{
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      color:      'var(--text)',
                      padding:    '4px',
                      display:    'flex',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav links */}
                <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        fontFamily:     "'DM Sans', system-ui, sans-serif",
                        fontSize:       '1rem',
                        fontWeight:     isActive(link.href) ? 600 : 400,
                        color:          isActive(link.href) ? 'var(--accent)' : 'var(--muted)',
                        padding:        '0.875rem 1.5rem',
                        textDecoration: 'none',
                        transition:     'background 150ms, color 150ms',
                        display:        'block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        if (!isActive(link.href)) e.currentTarget.style.color = 'var(--text)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = isActive(link.href) ? 'var(--accent)' : 'var(--muted)'
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Panel footer */}
                <div
                  style={{
                    marginTop:   'auto',
                    borderTop:   '1px solid rgba(255,255,255,0.07)',
                    flexShrink:  0,
                  }}
                >
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display:        'flex',
                        alignItems:     'center',
                        gap:            '12px',
                        padding:        '1.25rem 1.5rem',
                        textDecoration: 'none',
                        color:          'var(--text)',
                        fontFamily:     "'DM Sans', system-ui, sans-serif",
                        fontSize:       '0.9375rem',
                        fontWeight:     500,
                        transition:     'background 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.full_name ?? 'User'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover cursor-pointer"
                          onClick={() => router.push('/dashboard')}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        // Fallback: initials circle
                        <div
                          className="w-8 h-8 rounded-full bg-accent flex items-center justify-center cursor-pointer text-bg text-xs font-bold"
                          onClick={() => router.push('/dashboard')}
                          style={{ flexShrink: 0 }}
                        >
                          {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>{profile?.full_name ?? 'Account'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
                          Go to dashboard
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div style={{ padding: '1.5rem' }}>
                      <Link
                        href="/auth"
                        onClick={() => setIsOpen(false)}
                        style={{
                          display:        'block',
                          width:          '100%',
                          textAlign:      'center',
                          fontFamily:     "'DM Sans', system-ui, sans-serif",
                          fontWeight:     600,
                          fontSize:       '0.9375rem',
                          padding:        '0.75rem 1.25rem',
                          borderRadius:   '8px',
                          backgroundColor:'var(--accent)',
                          color:          '#0b0c0f',
                          textDecoration: 'none',
                          boxSizing:      'border-box',
                          transition:     'opacity 200ms',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Get started
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </>
  )
}
