import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion / Inscription',
  description: 'Connectez-vous ou créez votre compte UrbanFlow pour accéder à votre planificateur multimodal et suivre votre impact CO₂.',
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
