'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AnimalAvatarProps {
  animalName: string
  breedName: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

/**
 * Converts a breed name to the avatar filename format
 * e.g., "Bichon Frise" -> "bichon_frise_avatar.png"
 */
function breedToFilename(breed: string): string {
  return (
    breed
      .toLowerCase()
      .replace(/\s+/g, '_') // spaces to underscores
      .replace(/[^a-z0-9_]/g, '') + // remove special chars
    '_avatar.png'
  )
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-lg',
  lg: 'h-12 w-12 text-xl',
  xl: 'h-16 w-16 text-2xl',
  '2xl': 'h-24 w-24 text-3xl',
}

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
}

export default function AnimalAvatar({
  animalName,
  breedName,
  size = 'md',
  className = '',
}: AnimalAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initial = animalName.charAt(0).toUpperCase()
  const filename = breedToFilename(breedName)
  const imagePath = `/images/animal-avatars/${filename}`

  // Fallback gradient avatar (original design)
  const FallbackAvatar = () => (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] font-bold text-white shadow-[var(--shadow-primary)] ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  )

  // If image failed to load, show fallback
  if (imageError) {
    return <FallbackAvatar />
  }

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Circular avatar container */}
      <div className="h-full w-full overflow-hidden rounded-full border-2 border-white shadow-[var(--shadow-primary)]">
        {/* Breed avatar image */}
        <Image
          src={imagePath}
          alt={`${breedName} avatar`}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          unoptimized // Use unoptimized for local images that may not exist
        />
      </div>

      {/* Letter at bottom-right with text stroke for visibility */}
      <span
        className="absolute -right-0.5 -bottom-0.5 font-bold text-white"
        style={{
          fontSize: '1em',
          textShadow: `
            -1px -1px 0 #1f2937,
            1px -1px 0 #1f2937,
            -1px 1px 0 #1f2937,
            1px 1px 0 #1f2937
          `,
        }}
      >
        {initial}
      </span>
    </div>
  )
}
