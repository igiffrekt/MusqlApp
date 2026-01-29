import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Adatvédelmi Tájékoztató | Musql',
  description: 'Musql adatvédelmi tájékoztató',
}

export default function AdatvedelemPage() {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Adatvédelmi Tájékoztató</h1>
          <p className="text-white/40 text-sm mb-8">Hatályos: 2025. január 1.</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Adatkezelő</h2>
              <p className="text-white/70 leading-relaxed">
                Név: Horváth Tamás EV.<br />
                Székhely: 2521 Csolnok, Szénbányászok útja 57.<br />
                E-mail: <a href="mailto:info@musql.app" className="text-[#D2F159] hover:text-[#D2F159]/80">info@musql.app</a><br />
                Telefon: +36 20 339 6404
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Kezelt adatok köre</h2>
              <p className="text-white/70 mb-4">A szolgáltatás használata során az alábbi személyes adatokat kezeljük:</p>
              
              <div className="bg-[#252a32] rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#D2F159]">•</span>
                  <span className="text-white/70"><strong className="text-white">Szervezet adminisztrátorok:</strong> Név, email cím, telefonszám</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#D2F159]">•</span>
                  <span className="text-white/70"><strong className="text-white">Tagok:</strong> Név, email, telefon, csoport tagság, jelenléti adatok</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#D2F159]">•</span>
                  <span className="text-white/70"><strong className="text-white">Fizetési adatok:</strong> Stripe-on keresztül (nem tároljuk a bankkártya adatokat)</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Adatkezelés célja és jogalapja</h2>
              <div className="space-y-3 text-white/70">
                <p><strong className="text-white">Szolgáltatás nyújtása:</strong> Szerződés teljesítése (GDPR 6. cikk (1) b))</p>
                <p><strong className="text-white">Számlázás:</strong> Jogi kötelezettség teljesítése (GDPR 6. cikk (1) c))</p>
                <p><strong className="text-white">Marketing:</strong> Hozzájárulás alapján (GDPR 6. cikk (1) a))</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Adatmegőrzési idő</h2>
              <div className="bg-[#252a32] rounded-xl p-4 space-y-2 text-white/70">
                <p>• Aktív előfizetés: a szerződés fennállásáig</p>
                <p>• Törölt fiókok: 30 nap után véglegesen törlésre kerülnek</p>
                <p>• Számviteli bizonylatok: 8 év (jogszabályi kötelezettség)</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Adatfeldolgozók</h2>
              <div className="space-y-3 text-white/70">
                <p>• <strong className="text-white">Stripe Inc.</strong> – Online fizetés feldolgozása</p>
                <p>• <strong className="text-white">Vercel Inc.</strong> – Tárhelyszolgáltatás</p>
                <p>• <strong className="text-white">Neon Inc.</strong> – Adatbázis szolgáltatás</p>
                <p>• <strong className="text-white">Resend</strong> – Email küldés</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Az Ön jogai</h2>
              <div className="bg-[#252a32] rounded-xl p-4 space-y-2 text-white/70">
                <p>• <strong className="text-white">Hozzáférés joga:</strong> Kérheti a kezelt adatairól szóló tájékoztatást</p>
                <p>• <strong className="text-white">Helyesbítés joga:</strong> Kérheti pontatlan adatainak javítását</p>
                <p>• <strong className="text-white">Törlés joga:</strong> Kérheti adatai törlését</p>
                <p>• <strong className="text-white">Adathordozhatóság:</strong> Kérheti adatai exportálását</p>
                <p>• <strong className="text-white">Tiltakozás joga:</strong> Tiltakozhat az adatkezelés ellen</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Kapcsolat és jogorvoslat</h2>
              <p className="text-white/70 leading-relaxed">
                Adatvédelmi kérdésekkel forduljon hozzánk: <a href="mailto:info@musql.app" className="text-[#D2F159] hover:text-[#D2F159]/80">info@musql.app</a><br /><br />
                Jogorvoslati lehetőség: Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)<br />
                Cím: 1055 Budapest, Falk Miksa utca 9-11.<br />
                Web: <a href="https://www.naih.hu" target="_blank" rel="noopener noreferrer" className="text-[#D2F159] hover:text-[#D2F159]/80">www.naih.hu</a>
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4">
            <Link href="/" className="text-[#D2F159] hover:text-[#D2F159]/80 text-sm transition-colors">← Vissza a főoldalra</Link>
            <Link href="/aszf" className="text-white/60 hover:text-white text-sm transition-colors">ÁSZF</Link>
            <Link href="/cookie-szabalyzat" className="text-white/60 hover:text-white text-sm transition-colors">Cookie szabályzat</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
