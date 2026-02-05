"use client";

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '70px',
            }}>
                {/* Logo/Brand with High Contrast */}
                <Link href="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                }}>
                    <span style={{
                        fontSize: '2rem',
                    }}>📄</span>
                    <span style={{ letterSpacing: '-0.02em' }}>Paper Tube Pro</span>
                </Link>

                {/* Status Badge with High Contrast Background */}
                <div style={{
                    padding: '0.5rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                }}>
                    ✨ Production System
                </div>
            </div>
        </nav>
    );
}
