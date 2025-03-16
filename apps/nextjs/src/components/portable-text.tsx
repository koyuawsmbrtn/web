"use client"

import Link from "next/link"
import { PortableText as BasePortableText } from "@portabletext/react"
import { useEffect, useState } from "react"
import { client } from "@/sanity/client"

const components = {
    marks: {
        link: ({ value, children }: any) => {
            const href = value?.href || ''
            const isInternalLink = href.startsWith('/')

            if (isInternalLink) {
                return <Link href={href}>{children}</Link>
            }

            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            )
        }
    },
    block: {
        normal: ({ children }: any) => {
            // Check if children is an array with a single text node containing "---"
            if (Array.isArray(children) &&
                children.length === 1 &&
                typeof children[0] === 'string' &&
                children[0].trim() === '---') {
                return <div className="break" />
            }

            // Convert children array to string content
            const content = Array.isArray(children) 
                ? children.map(child => typeof child === 'string' ? child : '').join('')
                : ''

            // Check for custom block tags
            const blockMatch = content.match(/\[block\](.*?)\[\/block\]/s)
            if (blockMatch) {
                const blockId = blockMatch[1].trim()
                return <SanityBlock blockId={blockId} />
            }

            return <p>{children}</p>
        }
    }
}

function SanityBlock({ blockId }: { blockId: string }) {
    const [block, setBlock] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const data = await client.fetch(`
                    *[_type == "blockdocument" && tag == $blockId][0] {
                        _id,
                        title,
                        html,
                        tag
                    }
                `, { blockId })
                
                console.log('Fetched block:', data)
                setBlock(data)
            } catch (err) {
                console.error('Error fetching block:', err)
                setError('Failed to load block content')
            }
        }

        fetchBlock()
    }, [blockId])

    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    if (!block) {
        return <div className="animate-pulse">...</div>
    }

    return (
        <div className="sanity-block">
            {block.html?.code && (
                <div dangerouslySetInnerHTML={{ __html: block.html.code }} />
            )}
        </div>
    )
}

export function PortableText({ value }: { value: any }) {
    return <BasePortableText value={value} components={components} />
}