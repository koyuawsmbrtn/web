"use client"

import { useEffect, useState } from "react"
import { client } from "@/sanity/client"
import * as culori from "culori"

interface Settings {
    accentColor: {
        hex: string
    }
}

export default function AccentColor() {
    const [oklchString, setOklchString] = useState("oklch(0 0 0)")
    const [textColor, setTextColor] = useState("oklch(1 0 0)")
    useEffect(() => {
        const fetchAccentColor = async () => {
            try {
                const settings = await client.fetch<Settings>(`
                    *[_type == "settings"][0] {
                        accentColor
                    }
                `)

                if (settings?.accentColor?.hex) {
                    const hex = settings.accentColor.hex
                    // Convert directly to OKLCH
                    const color = culori.oklch(culori.parse(hex))
                    if (color) {
                        const oklchString = `oklch(${color.l} ${color.c} ${color.h})`
                        setOklchString(oklchString)

                        // Calculate text color based on lightness
                        const textColor = color.l > 0.5 ? "oklch(0 0 0)" : "oklch(1 0 0)"
                        setTextColor(textColor)
                    }
                }
            } catch (err) {
                console.error("Error fetching accent color:", err)
            }
        }

        fetchAccentColor()
    }, [])

    return (
        <style>
            {`
                :root {
                    --accent: ${oklchString} !important;
                    --text-accent: ${textColor} !important;
                }
                .dark {
                    --accent: ${oklchString} !important;
                    --text-accent: ${textColor} !important;
                }
            `}
        </style>
    )
}