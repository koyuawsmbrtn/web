"use client"

import { useEffect } from "react";

/* eslint-disable @next/next/no-sync-scripts */
export default function Webrings() {
    useEffect(() => {
        const transringScript = document.createElement("script");
        transringScript.src = "https://transring.neocities.org/ring.js";
        transringScript.async = true;
        document.getElementById("transring-script")?.appendChild(transringScript);

        const bonkiringScript = document.createElement("script");
        bonkiringScript.src = "https://bonkiscoolsite.neocities.org/bonkiring/bonkiring-widget.js";
        bonkiringScript.async = true;
        document.getElementById("bonki-ring")?.appendChild(bonkiringScript);

        return () => {
            document.body.removeChild(transringScript);
            document.getElementById("bonki-ring")?.removeChild(bonkiringScript);
        };
    }, []);

    return (
        <>
            <div id="transring-script" />
            <div id="bonki-ring"></div>
            <style jsx>{`
                .bonkiringdiv {
                    margin: auto;
                }
            `}</style>
        </>
    );
}