import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Cookie Szabályzat | Musql',
  description: 'Musql cookie (süti) szabályzat',
}

export default function CookieSzabalyzatPage() {
  return (
    <div className="min-h-screen bg-[#171725]">
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/img/musql_logo.png" alt="Musql" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            ← Vissza
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-10 border border-white/10">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Cookie (Süti) Szabályzat</h1>
          <p className="text-white/40 text-sm mb-8">Hatályos: 2025. január 1.</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Mi az a cookie?</h2>
              <p className="text-white/70 leading-relaxed">
                A cookie (süti) egy kis méretű szöveges fájl, amelyet a weboldal az Ön böngészőjében helyez el. A cookie-k segítségével a weboldal "emlékszik" az Ön beállításaira és korábbi tevékenységére.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Milyen cookie-kat használunk?</h2>
              
              <h3 className="text-base font-medium text-white mt-4 mb-2">2.1. Feltétlenül szükséges cookie-k</h3>
              <p className="text-white/70 mb-4">Ezek a cookie-k elengedhetetlenek a weboldal működéséhez:</p>
              
              <div className="bg-[#252a32] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/60 font-medium">Cookie neve</th>
                      <th className="text-left p-3 text-white/60 font-medium">Cél</th>
                      <th className="text-left p-3 text-white/60 font-medium">Lejárat</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/70">
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-mono text-xs text-[#D2F159]">next-auth.session-token</td>
                      <td className="p-3">Bejelentkezési munkamenet</td>
                      <td className="p-3">30 nap</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-mono text-xs text-[#D2F159]">next-auth.csrf-token</td>
                      <td className="p-3">CSRF védelem</td>
                      <td className="p-3">Munkamenet</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs text-[#D2F159]">next-auth.callback-url</td>
                      <td className="p-3">Átirányítás</td>
                      <td className="p-3">Munkamenet</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-medium text-white mt-6 mb-2">2.2. Funkcionális cookie-k</h3>
              <p className="text-white/70 mb-4">Ezek a cookie-k javítják a felhasználói élményt:</p>
              
              <div className="bg-[#252a32] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/60 font-medium">Cookie neve</th>
                      <th className="text-left p-3 text-white/60 font-medium">Cél</th>
                      <th className="text-left p-3 text-white/60 font-medium">Lejárat</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/70">
                    <tr className="border-b border-white/5">
                      <td className="p-3 font-mono text-xs text-[#D2F159]">theme</td>
                      <td className="p-3">Téma beállítás</td>
                      <td className="p-3">1 év</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-xs text-[#D2F159]">locale</td>
                      <td className="p-3">Nyelvi beállítás</td>
                      <td className="p-3">1 év</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Cookie-k kezelése</h2>
              <p className="text-white/70 leading-relaxed">
                Ön bármikor törölheti a cookie-kat böngészője beállításaiban. A cookie-k letiltása esetén a weboldal egyes funkciói nem működnek megfelelően.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Harmadik felek cookie-jai</h2>
              <p className="text-white/70 leading-relaxed">
                Az online fizetéshez a Stripe szolgáltatását használjuk, amely saját cookie-kat helyezhet el. A Stripe cookie szabályzatát itt tekintheti meg: <a href="https://stripe.com/cookies-policy" target="_blank" rel="noopener noreferrer" className="text-[#D2F159] hover:text-[#D2F159]/80">stripe.com/cookies-policy</a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Kapcsolat</h2>
              <p className="text-white/70 leading-relaxed">
                Cookie-kkal kapcsolatos kérdések esetén keressen minket:<br />
                E-mail: <a href="mailto:info@musql.app" className="text-[#D2F159] hover:text-[#D2F159]/80">info@musql.app</a>
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4">
            <Link href="/" className="text-[#D2F159] hover:text-[#D2F159]/80 text-sm transition-colors">← Vissza a főoldalra</Link>
            <Link href="/aszf" className="text-white/60 hover:text-white text-sm transition-colors">ÁSZF</Link>
            <Link href="/adatvedelem" className="text-white/60 hover:text-white text-sm transition-colors">Adatvédelem</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
