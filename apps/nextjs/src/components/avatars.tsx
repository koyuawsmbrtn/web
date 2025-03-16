"use client"

import { useState, useEffect } from "react"
import { client } from "@/sanity/client"
import { urlForImage } from "@/sanity/image"
import Image from "next/image"
import { Skeleton } from "./ui/skeleton"

interface Avatar {
  _id: string
  name: string
  link: string
  image: {
    asset: {
      _ref: string
    }
  }
}

export default function Avatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const data = await client.fetch<Avatar[]>(`
          *[_type == "avatar"] {
            _id,
            name,
            link,
            image
          }
        `)
        setAvatars(data)
      } catch (err) {
        console.error("Error fetching avatars:", err)
        setError("Failed to load avatars")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvatars()
  }, [])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (isLoading) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
            <a target="_blank" rel="noopener noreferrer" className="group"><div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300"><Skeleton className="w-200 h-200 object-cover" /></div></a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {avatars.map((avatar) => (
            <a
              key={avatar._id}
              href={avatar.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="aspect-square overflow-hidden rounded-full border-1 border-border/40 transition-all duration-300">
                <Image
                  src={urlForImage(avatar.image)?.url() || "/placeholder.png"}
                  alt={avatar.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}