import Link from 'next/link'

export const metadata = {
  title: 'Adatvédelmi Tájékoztató | Musql',
  description: 'Musql adatvédelmi tájékoztató és GDPR információk',
}

export default function AdatvedelemPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Adatvédelmi Tájékoztató</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Hatályos: 2025. január 1.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">1. Az adatkezelő</h2>
          <p>
            {/* TODO: Cégadatok kitöltése */}
            Név: [Cégnév]<br />
            Székhely: [Cím]<br />
            E-mail: [email@example.com]
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">2. A kezelt adatok köre</h2>
          <p>
            A Musql alkalmazás használata során az alábbi személyes adatokat kezeljük:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Név</li>
            <li>E-mail cím</li>
            <li>Telefonszám (opcionális)</li>
            <li>Edzésekhez kapcsolódó adatok (jelenléti ívek, csoporttagság)</li>
            <li>Fizetési adatok</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">3. Az adatkezelés célja és jogalapja</h2>
          <p>
            Az adatkezelés célja a sportlétesítmények és edzőtermek adminisztrációjának
            támogatása, beleértve a tagnyilvántartást, órarendkezelést és fizetések követését.
          </p>
          <p className="mt-2">
            Az adatkezelés jogalapja: GDPR 6. cikk (1) bekezdés b) pont – szerződés teljesítése.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">4. Az adatok tárolásának időtartama</h2>
          <p>
            A személyes adatokat a felhasználói fiók törléséig, vagy a jogszabályban előírt
            megőrzési időig tároljuk.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">5. Az Ön jogai</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Hozzáférés a személyes adatokhoz</li>
            <li>Adatok helyesbítése</li>
            <li>Adatok törlése ("elfeledtetéshez való jog")</li>
            <li>Adatkezelés korlátozása</li>
            <li>Adathordozhatóság</li>
            <li>Tiltakozás az adatkezelés ellen</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">6. Kapcsolat</h2>
          <p>
            Adatvédelmi kérdésekkel kapcsolatban kérjük, vegye fel velünk a kapcsolatot
            az alábbi e-mail címen: [email@example.com]
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">7. Panasztételi jog</h2>
          <p>
            Ha úgy véli, hogy adatkezelésünk sérti a jogait, panaszt tehet a Nemzeti
            Adatvédelmi és Információszabadság Hatóságnál (NAIH).
          </p>
          <p className="mt-2">
            NAIH elérhetősége: <a href="https://naih.hu" className="text-blue-600 hover:underline">naih.hu</a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  )
}
