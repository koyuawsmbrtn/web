"use client"

import { useState, useEffect } from "react"
import { client } from "@/sanity/client"
import Link from "next/link"
import { Skeleton } from "./ui/skeleton"

interface Note {
    _id: string
    title: string
    slug: {
        current: string
    }
    content: string
}

export default function Notes() {
    const [notes, setNotes] = useState<Note[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await client.fetch<Note[]>(`
          *[_type == "note"] | order(title asc) {
            _id,
            title,
            slug,
            content
          }
        `)
                setNotes(data)
            } catch (err) {
                console.error("Error fetching notes:", err)
                setError("Failed to load notes")
            } finally {
                setIsLoading(false)
            }
        }

        fetchNotes()
    }, [])

    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    if (isLoading) {
        return (
            <>
                <Skeleton className="h-6 w-1/2 my-1" />
                <Skeleton className="h-6 w-1/3 my-1" />
                <Skeleton className="h-6 w-2/3 my-1" />
                <Skeleton className="h-6 w-1/4 my-1" />
                <Skeleton className="h-6 w-3/4 my-1" />
                <Skeleton className="h-6 w-1/2 my-1" />
                <Skeleton className="h-6 w-1/3 my-1" />
                <Skeleton className="h-6 w-1/2 my-1" />
                <Skeleton className="h-6 w-1/3 my-1" />
                <Skeleton className="h-6 w-1/3 my-1" />
            </>
        )
    }

    return (
        <>
            <br />
            <ul className="space-y-1 list-disc list-inside">
                {notes.map((note) => (
                    <li key={note._id} className="text-lg">
                        <Link href={`/notes/${note.slug.current}`}>{note.title}</Link>
                    </li>
                ))}
            </ul>
            {notes.length === 0 && <p className="text-gray-500">No notes found :&#40;</p>}
        </>
    )
}