'use client'

export default function Error() {

  return (
    <div className="container mx-auto min-h-screen max-w-4xl p-8">
      <h1 className="text-4xl font-bold mb-8">Something went wrong!</h1>
      <div className="flex flex-col space-y-4">
        <p>An error occurred while processing your request.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-lg w-fit"
        >
          Try again
        </button>
      </div>
    </div>
  )
}