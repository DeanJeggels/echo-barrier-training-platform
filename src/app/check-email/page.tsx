import Image from 'next/image'

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-gray-100">
        <Image
          src="/logo.png"
          alt="Echo Barrier"
          width={200}
          height={50}
          className="h-12 w-auto object-contain"
          priority
        />
        <a
          href="https://echobarrier.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF7026] hover:bg-black text-white font-bold text-sm px-6 py-3 rounded transition-colors"
        >
          Visit Echobarrier.com
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-10 text-center">
            {/* Mail icon */}
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#FF7026]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-black mb-3">
              Check your inbox!
            </h1>

            <p className="text-gray-500 text-sm mb-2">
              We&apos;ve sent an invite link to:
            </p>

            {email && (
              <p className="text-black font-semibold text-base mb-6 break-all">
                {decodeURIComponent(email)}
              </p>
            )}

            <p className="text-gray-400 text-sm mb-8">
              Click the link in the email to create your password and access the training portal.
              The link expires in 24 hours.
            </p>

            <p className="text-gray-400 text-xs">
              Didn&apos;t receive an email?{' '}
              <a href="/" className="text-[#FF7026] hover:underline">
                Try again
              </a>
              {' '}or check your spam folder.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
