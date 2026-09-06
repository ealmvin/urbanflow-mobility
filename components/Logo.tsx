import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: number
  className?: string
}

export default function Logo({ href = '/', size = 32, className = '' }: LogoProps) {
  const inner = (
    <span className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/icons/icon-192.png"
        alt="UrbanFlow logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      <span className="font-bold text-gray-900 text-base tracking-tight">UrbanFlow</span>
    </span>
  )

  if (!href) return inner

  return (
    <Link href={href} className="flex items-center">
      {inner}
    </Link>
  )
}
