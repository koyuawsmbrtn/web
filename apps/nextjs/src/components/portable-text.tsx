"use client"

/* eslint-disable  @typescript-eslint/no-explicit-any */

import Link from "next/link"
import { PortableText as BasePortableText } from "@portabletext/react"
import { useEffect, useState } from "react"
import { client } from "@/sanity/client"
import Avatars from "@/components/avatars"
import { Skeleton } from "./ui/skeleton"
import Card from "@/components/card"
import Notes from "./notes"
import Image from "next/image"
import { urlForImage } from "@/sanity/image"

export const components = {
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
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null
            }

            return (
                <div className="relative w-full my-8">
                    <Image
                        src={urlForImage(value)?.url() || ""}
                        alt={value.alt || ""}
                        width={800}
                        height={450}
                        className="rounded-lg w-full"
                        priority={false}
                    />
                    {value.caption && (
                        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                            {value.caption}
                        </figcaption>
                    )}
                </div>
            )
        },
        card: function CardReference({ value }: any) {
            const [card, setCard] = useState<any>(null)
            const [error, setError] = useState<string | null>(null)

            useEffect(() => {
                const fetchCard = async () => {
                    try {
                        if (!value?.cardReference._ref) {
                            setError('Invalid card reference')
                            return
                        }
                        const data = await client.fetch(`
                            *[_type == "card" && _id == $cardId][0] {
                                image,
                                "link": link,
                                title,
                                content
                            }
                        `, { cardId: value.cardReference._ref })
                        if (!data) {
                            setError('Card not found')
                            return
                        }
                        setCard(data)
                    } catch (err) {
                        console.error('Error fetching card:', err)
                        setError('Failed to load card content')
                    }
                }

                fetchCard()
            }, [value.cardReference._ref])

            if (error) return <div className="text-red-500">{error}</div>
            if (!card) return <Skeleton className="h-[202px] w-full my-6" />

            return (
                <Card
                    imageSrc={urlForImage(card.image)?.url() || "/placeholder.png"}
                    title={card.title}
                    content={card.content}
                    link={card.link}
                />
            )
        },
        notes: () => <Notes />,
        blockref: function BlockRef({ value }: any) {
            const [blockref, setBlock] = useState<any>(null)
            const [error, setError] = useState<string | null>(null)

            useEffect(() => {
                const fetchBlock = async () => {
                    try {
                        const data = await client.fetch(`
                            *[_type == "blockdocument" && _id == $blockId][0] {
                                _id,
                                title,
                                html,
                                type,
                                tag
                            }
                        `, { blockId: value.blockReference._ref })
                        setBlock(data)
                    } catch (err) {
                        console.error('Error fetching block:', err)
                        setError('Failed to load block content')
                    }
                }

                fetchBlock()
            }, [value.blockReference._ref])

            if (error) return <div className="text-red-500">{error}</div>
            if (!blockref) return <div className="my-6 text-gray-600 text-3xl text-center">...</div>

            if (blockref.tag === "avatars") {
                return <Avatars />
            }

            return (
                <div className="sanity-block">
                    {blockref.html?.code && (
                        <div dangerouslySetInnerHTML={{ __html: blockref.html.code }} />
                    )}
                </div>
            )
        }
    },
    block: {
        normal: ({ children }: any) => {
            if (Array.isArray(children) &&
                children.length === 1 &&
                typeof children[0] === 'string' &&
                children[0].trim() === '---') {
                return <div className="break" />
            }

            return <p className="my-3">{children}</p>
        }
    }
}

export function PortableText({ value }: { value: any }) {
    return <BasePortableText value={value} components={components} />
}