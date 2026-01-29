import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Általános Szerződési Feltételek | Musql',
  description: 'Musql ÁSZF - Általános Szerződési Feltételek',
}

export default function AszfPage() {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Általános Szerződési Feltételek (ÁSZF)</h1>
          <p className="text-white/40 text-sm mb-8">Hatályos: 2025. január 1.</p>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Szolgáltató adatai</h2>
              <p className="text-white/70 leading-relaxed">
                Név: Horváth Tamás EV.<br />
                Székhely: 2521 Csolnok, Szénbányászok útja 57.<br />
                Adószám: 56819650-1-31<br />
                E-mail: info@musql.app<br />
                Telefon: +36 20 339 6404<br />
                Képviselő: Horváth Tamás
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. A szolgáltatás leírása</h2>
              <p className="text-white/70 leading-relaxed">
                A Musql egy felhőalapú (SaaS) szoftverszolgáltatás, amely edzőtermek, sportegyesületek, jógastúdiók és személyi edzők számára nyújt adminisztrációs megoldást az alábbi funkciókkal:
              </p>
              <ul className="list-disc pl-6 mt-2 text-white/70 space-y-1">
                <li>Tagnyilvántartás és csoportkezelés</li>
                <li>Órarend és foglaláskezelés</li>
                <li>Jelenléti ív vezetése</li>
                <li>Bérlet- és díjfizetés kezelése</li>
                <li>Online fizetés fogadása (Stripe)</li>
                <li>Értesítések küldése (push, e-mail)</li>
                <li>Riportok és statisztikák</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Szerződés létrejötte</h2>
              <p className="text-white/70 leading-relaxed">
                A szerződés a regisztráció befejezésével és jelen ÁSZF elfogadásával jön létre. A regisztrációval Ön (a továbbiakban: Előfizető) kijelenti, hogy:
              </p>
              <ul className="list-disc pl-6 mt-2 text-white/70 space-y-1">
                <li>Betöltötte a 18. életévét, vagy szervezet képviseletében jár el</li>
                <li>Az általa megadott adatok valósak</li>
                <li>Elolvasta és elfogadja jelen ÁSZF-et és az Adatvédelmi Tájékoztatót</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Próbaidőszak</h2>
              <p className="text-white/70 leading-relaxed">
                Az Előfizető a regisztrációt követően 15 napos ingyenes próbaidőszakot vehet igénybe. A próbaidőszak alatt a szolgáltatás minden funkciója elérhető. A próbaidőszak végén az Előfizető választhat fizetős csomagot, vagy a fiók automatikusan felfüggesztésre kerül. <strong className="text-white">A próbaidőszak alatt nem kerül sor díjlevonásra.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Díjszabás és fizetés</h2>
              <p className="text-white/70 leading-relaxed">
                Az aktuális árak és csomagok a weboldalon (musql.app) találhatók. A Szolgáltató fenntartja a jogot az árak módosítására, melyről az Előfizetőt legalább 30 nappal korábban értesíti. Fizetési mód: online bankkártyás fizetés (Stripe).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Felmondás</h2>
              <p className="text-white/70 leading-relaxed">
                Az Előfizető bármikor felmondhatja előfizetését a fiókbeállításokban. A felmondás a számlázási ciklus végén lép hatályba. <strong className="text-white">Az előre kifizetett díj nem kerül visszatérítésre.</strong> Felmondás után az adatok 30 napig megőrzésre kerülnek.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Elállási jog</h2>
              <p className="text-white/70 leading-relaxed">
                A 45/2014. (II. 26.) Korm. rendelet alapján az Előfizető, mint fogyasztó, 14 napon belül indokolás nélkül elállhat a szerződéstől. Az elállási jog gyakorlása esetén a már kifizetett díj visszatérítésre kerül.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Felelősségkorlátozás</h2>
              <p className="text-white/70 leading-relaxed">
                A Szolgáltató felelőssége az Előfizető által a szerződéskötést megelőző 12 hónapban fizetett díjak összegére korlátozódik. A Szolgáltató nem felel az Előfizető által megadott helytelen adatokból eredő károkért, vis maior eseményekből eredő szolgáltatáskiesésért, vagy harmadik fél szolgáltatásának hibájából eredő károkért.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Panaszkezelés</h2>
              <p className="text-white/70 leading-relaxed">
                Panaszát az alábbi elérhetőségeken jelezheti:<br />
                E-mail: <a href="mailto:info@musql.app" className="text-[#D2F159] hover:text-[#D2F159]/80">info@musql.app</a><br />
                Telefon: <a href="tel:+36203396404" className="text-[#D2F159] hover:text-[#D2F159]/80">+36 20 339 6404</a><br />
                Válaszadási határidő: 30 nap.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Záró rendelkezések</h2>
              <p className="text-white/70 leading-relaxed">
                A szerződésre a magyar jog az irányadó. Jelen ÁSZF-ben nem szabályozott kérdésekben a Polgári Törvénykönyv és egyéb hatályos magyar jogszabályok az irányadók.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4">
            <Link href="/" className="text-[#D2F159] hover:text-[#D2F159]/80 text-sm transition-colors">← Vissza a főoldalra</Link>
            <Link href="/adatvedelem" className="text-white/60 hover:text-white text-sm transition-colors">Adatvédelem</Link>
            <Link href="/cookie-szabalyzat" className="text-white/60 hover:text-white text-sm transition-colors">Cookie szabályzat</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
