import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { client } from "@/sanity/client"
import Image from "next/image"

interface Page {
  _id: string
  title: string
  slug: string | { current: string }
}

const useBlog = Boolean(process.env.NEXT_PUBLIC_USEBLOG);

export function NavigationSanity() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const logoX = useTransform(scrollY, [0, 100], [0, -24])
  const linksOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true)
        let data = await client.fetch<Page[]>(`
          *[_type == "page" && slug.current != "index" && hidden == false] | order(publishedAt desc) {
            _id,
            title,
            "slug": slug.current
          }
        `)
        let newdata = null;
        if (useBlog === true) {
          newdata = { _id: "blog", title: "Blog", slug: "blog" };
        }
        if (newdata !== null) {
          data = [{
            _id: "home",
            title: "Home",
            slug: ""
          }, newdata, ...data];
        } else {
          data = [{
            _id: "home",
            title: "Home",
            slug: ""
          }, ...data];
        }
        setPages(data)
      } catch (err) {
        setError("Failed to load pages")
        console.error("Error fetching pages:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [])

  // Helper function to check if link is active
  const isActive = (slug: string) => {
    if (slug === "" && pathname === "/") return true
    if (slug !== "" && pathname === `/${slug}`) return true
    return false
  }

  if (error) {
    return null // Or a more graceful fallback
  }

  return (
    <nav className="bg-gradient-to-b from-background to-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo - visible on both mobile and desktop */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div
              style={{ x: logoX }}
              className="flex items-center"
            >
              <Link href="/">
                <Image 
                  src="/logo.svg" 
                  alt="Logo" 
                  width={24} 
                  height={24} 
                  className="h-8 w-8 align-middle my-0.5" 
                />
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-start sm:ml-6">
            <motion.div 
              style={{ opacity: linksOpacity }}
              className="flex space-x-4 relative"
            >
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                pages.map((page) => (
                  <Link
                    key={page._id}
                    href={`/${page.slug}`}
                    className="relative px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {isActive(page.slug.toString()) && (
                      <motion.div
                        layoutId="active-page"
                        className="absolute inset-0 bg-accent rounded-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={`relative z-10 ${
                      isActive(page.slug.toString())
                        ? "text-black dark:text-black"
                        : "text-foreground/90 hover:text-foreground"
                    }`}>
                      {page.title}
                    </span>
                  </Link>
                ))
              )}
              {pages.length === 0 && !isLoading && (
                <span className="text-muted-foreground">No pages found</span>
              )}
            </motion.div>
          </div>

          {/* Mobile menu button - moved to right */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-foreground"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          id="mobile-menu"
          className="sm:hidden"
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              pages.map((page) => (
                <Link
                  key={page._id}
                  href={`/${page.slug}`}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(page.slug.toString())
                      ? "bg-accent text-black dark:text-black"
                      : "text-foreground/90 hover:text-foreground hover:bg-accent/10"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {page.title}
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  )
}