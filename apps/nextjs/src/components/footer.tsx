import Link from "next/link"
import { useEffect, useState } from "react"
import { client } from "@/sanity/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faGithub, 
  faMastodon, 
  faDiscord,
  faInstagram,
  faLinkedin,
  faBluesky,
  faTwitch,
  faFacebook,
  faXTwitter,
  faYoutube,
  faTiktok,
  faTelegram,
  faFlickr,
  faWhatsapp,
  faSnapchat
} from "@fortawesome/free-brands-svg-icons"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"

interface LegalPage {
  _id: string
  slug: string
  title: string
}

interface Social {
  _id: string
  slug: {
    current: string
  }
  url: string
}

interface Settings {
  websiteName: string
}

const getSocialIcon = (slug: string) => {
  switch (slug) {
    case "github":
      return faGithub
    case "mastodon":
      return faMastodon
    case "discord":
      return faDiscord
    case "instagram":
      return faInstagram
    case "linkedin":
      return faLinkedin
    case "bluesky":
      return faBluesky
    case "twitch":
      return faTwitch
    case "facebook":
      return faFacebook
    case "twitter":
      return faXTwitter
    case "youtube":
      return faYoutube
    case "tiktok":
      return faTiktok
    case "x":
      return faXTwitter
    case "telegram":
      return faTelegram
    case "mastodon":
      return faMastodon
    case "flickr":
      return faFlickr
    case "whatsapp":
      return faWhatsapp
    case "snapchat":
      return faSnapchat
    default:
      return faGlobe
  }
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [legalPages, setLegalPages] = useState<LegalPage[]>([])
  const [socials, setSocials] = useState<Social[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [pagesData, socialsData, settingsData] = await Promise.all([
        client.fetch<LegalPage[]>(`
          *[_type == "page" && slug.current in ["imprint", "privacy", "terms"]] {
            _id,
            "slug": slug.current,
            title
          }
        `),
        client.fetch<Social[]>(`
          *[_type == "social"] {
            _id,
            slug,
            url
          }
        `),
        client.fetch<Settings>(`
          *[_type == "settings"][0] {
            websiteName
          }
        `)
      ])
      setLegalPages(pagesData)
      setSocials(socialsData)
      setSettings(settingsData)
    }

    fetchData()
  }, [])

  return (
    <footer className="bg-muted py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} {settings?.websiteName || 'Company'}. All rights reserved.
            </div>
            {socials.length > 0 && (
              <div className="flex space-x-2">
                {socials.map((social) => (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors"
                    aria-label={`Visit our ${social.slug.current} profile`}
                  >
                    <FontAwesomeIcon 
                      icon={getSocialIcon(social.slug.current)}
                      className="w-5 h-5"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
          {legalPages.length > 0 && (
            <nav className="flex space-x-6">
              {legalPages.map((page) => (
                <Link
                  key={page._id}
                  href={`/${page.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}