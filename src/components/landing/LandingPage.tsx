"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Users, Calendar, CreditCard, Bell, 
  BarChart3, Shield, Smartphone,
  CheckCircle2, ArrowRight, Star, Zap
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Tagkezelés",
    description: "Ügyfelek, bérletek és csoportok kezelése egyszerűen. Minden adat egy helyen."
  },
  {
    icon: Calendar,
    title: "Órarend & Foglalás",
    description: "Egyszerű órarend kezelés. Tagok online foglalhatnak és látják az órákat."
  },
  {
    icon: CreditCard,
    title: "Fizetések",
    description: "Bérletek, napijegyek nyomon követése. Online és készpénzes fizetés."
  },
  {
    icon: Bell,
    title: "Értesítések",
    description: "Automatikus push és email értesítések órakezdésről, fizetési határidőkről."
  },
  {
    icon: BarChart3,
    title: "Statisztikák",
    description: "Bevételek, látogatottság, népszerű órák - minden egy helyen, átláthatóan."
  },
  {
    icon: Shield,
    title: "GDPR megfelelő",
    description: "Adatvédelem és biztonság elsőre. Magyar szabályozásnak megfelelő."
  },
]

const pricingPlans = [
  {
    name: "Alap",
    price: "9 900",
    period: "Ft/hó",
    description: "Kisebb stúdióknak, személyi edzőknek",
    features: [
      "Max 5 tag",
      "Max 50 óra/hó",
      "2 edző",
      "1 helyszín",
      "Email értesítések",
      "Alapstatisztikák",
    ],
    cta: "Kezdés ingyen",
    popular: false,
  },
  {
    name: "Prémium",
    price: "29 990",
    period: "Ft/hó",
    description: "Növekvő stúdióknak és kluboknak",
    features: [
      "Max 75 tag",
      "Max 200 óra/hó", 
      "10 edző",
      "3 helyszín",
      "Push + Email értesítések",
      "Online fizetés",
      "Haladó statisztikák",
    ],
    cta: "Kezdés ingyen",
    popular: true,
  },
  {
    name: "Üzleti",
    price: "74 990",
    period: "Ft/hó",
    description: "Nagy létszámú szervezeteknek",
    features: [
      "Korlátlan tag",
      "Korlátlan óra",
      "Korlátlan edző",
      "Korlátlan helyszín",
      "Minden funkció",
      "Prioritásos támogatás",
      "Egyedi integrációk",
    ],
    cta: "Kapcsolatfelvétel",
    popular: false,
  },
]

const testimonials = [
  {
    name: "Kovács Anna",
    role: "Jóga oktató",
    text: "Végre nem kell excelben vezetnem a tagokat. A Musql mindent megold.",
    rating: 5,
  },
  {
    name: "Nagy Péter",
    role: "BJJ edző, Budapest",
    text: "A foglalási rendszer életmentő. A tagok imádják, hogy appból foglalhatnak.",
    rating: 5,
  },
  {
    name: "Szabó Márk",
    role: "CrossFit box tulajdonos",
    text: "Átlátom a bevételeket, a tagok fizetnek időben. Ajánlom mindenkinek!",
    rating: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#D2F159] rounded-xl flex items-center justify-center">
              <span className="text-xl">💪</span>
            </div>
            <span className="text-xl font-bold">Musql</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funkciok" className="text-white/70 hover:text-white transition-colors">Funkciók</a>
            <a href="#arak" className="text-white/70 hover:text-white transition-colors">Árak</a>
            <a href="#velemenyek" className="text-white/70 hover:text-white transition-colors">Vélemények</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-white/70 hover:text-white transition-colors">
              Belépés
            </Link>
            <Link 
              href="/auth/signup"
              className="px-5 py-2 bg-[#D2F159] text-[#0a0a0f] font-semibold rounded-full hover:bg-[#e5ff7a] transition-colors"
            >
              Regisztráció
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D2F159]/10 rounded-full text-[#D2F159] text-sm mb-8"
          >
            <Zap className="w-4 h-4" />
            15 napos ingyenes próbaidő
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Edzéstermed kezelése<br />
            <span className="text-[#D2F159]">egyszerűen</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Tagkezelés, órarend, fizetések, értesítések - minden egy helyen.
            Jógastúdióknak, harcművészeti egyesületeknek, személyi edzőknek.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/auth/signup"
              className="px-8 py-4 bg-[#D2F159] text-[#0a0a0f] font-bold rounded-full text-lg hover:bg-[#e5ff7a] transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Ingyenes próba
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#funkciok"
              className="px-8 py-4 border border-white/20 rounded-full text-lg hover:bg-white/5 transition-colors inline-flex items-center justify-center"
            >
              Funkciók megtekintése
            </a>
          </motion.div>

          {/* Hero Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#D2F159]">500+</p>
              <p className="text-white/50 text-sm">aktív felhasználó</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#D2F159]">15k+</p>
              <p className="text-white/50 text-sm">kezelt óra/hó</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#D2F159]">99.9%</p>
              <p className="text-white/50 text-sm">uptime</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funkciok" className="py-20 px-6 bg-[#12121a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Minden ami kell, egy helyen</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Nincs több Excel, nincs több Messenger-csoport. A Musql mindent megold.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1a25] border border-white/5 hover:border-[#D2F159]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D2F159]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#D2F159]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D2F159]/10 rounded-full text-[#D2F159] text-sm mb-6">
                <Smartphone className="w-4 h-4" />
                Mobilbarát
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Kezeld az edzéstermet<br />
                <span className="text-[#D2F159]">bárhonnan</span>
              </h2>
              <p className="text-white/60 mb-8">
                A Musql tökéletesen működik mobilon is. Jelenlét vezetése, 
                új tagok felvétele, fizetések kezelése - mind egy kattintásra.
              </p>
              <ul className="space-y-4">
                {["Jelenlét vezetés QR kóddal", "Push értesítések", "Offline működés", "Gyors tagfelvétel"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D2F159]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D2F159]/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative bg-[#1a1a25] rounded-3xl p-8 border border-white/10">
                <div className="aspect-[9/16] bg-[#0a0a0f] rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#D2F159] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl">💪</span>
                    </div>
                    <p className="text-[#D2F159] font-bold">Musql</p>
                    <p className="text-white/40 text-sm">Progressive Web App</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="arak" className="py-20 px-6 bg-[#12121a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Egyszerű, átlátható árazás</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              15 napos ingyenes próbaidő minden csomagra. Nincs rejtett költség.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border ${
                  plan.popular 
                    ? 'bg-[#D2F159]/5 border-[#D2F159]' 
                    : 'bg-[#1a1a25] border-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D2F159] text-[#0a0a0f] text-xs font-bold rounded-full">
                    Legnépszerűbb
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/50 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/50"> {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D2F159] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block w-full py-3 rounded-full text-center font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#D2F159] text-[#0a0a0f] hover:bg-[#e5ff7a]'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="velemenyek" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mit mondanak rólunk?</h2>
            <p className="text-white/60">Edzők és stúdiótulajdonosok véleménye</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1a25] border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#D2F159] text-[#D2F159]" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-white/50">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Készen állsz a váltásra?
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Csatlakozz több száz elégedett edzőhöz. 15 nap ingyenes próba, 
            bankkártya megadása nélkül.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D2F159] text-[#0a0a0f] font-bold rounded-full text-lg hover:bg-[#e5ff7a] transition-all hover:scale-105"
          >
            Ingyenes próba indítása
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#D2F159] rounded-lg flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <span className="font-bold">Musql</span>
              </div>
              <p className="text-white/50 text-sm">
                Edzésmenedzsment rendszer jógastúdióknak, 
                harcművészeti egyesületeknek és személyi edzőknek.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Termék</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><a href="#funkciok" className="hover:text-white">Funkciók</a></li>
                <li><a href="#arak" className="hover:text-white">Árak</a></li>
                <li><Link href="/auth/signin" className="hover:text-white">Belépés</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Jogi</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><Link href="/adatvedelem" className="hover:text-white">Adatvédelem</Link></li>
                <li><a href="#" className="hover:text-white">ÁSZF</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kapcsolat</h4>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>info@musql.app</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-white/30 text-sm">
            © {new Date().getFullYear()} Musql. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  )
}
