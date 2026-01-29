"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { 
  Users, Calendar, CreditCard, Bell, 
  BarChart3, Smartphone,
  CheckCircle2, ArrowRight, 
  ChevronRight, User, Crown, Building2,
  MessageSquare, FileText, Clock, MapPin
} from "lucide-react"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import { Pricing } from "@/components/ui/pricing"

// Musql Logo component
const MusqlLogo = ({ size = 40, className = "" }: { size?: number, className?: string }) => (
  <Image 
    src="/img/musql_logo.png" 
    alt="Musql" 
    width={size} 
    height={size} 
    className={`rounded-xl ${className}`}
  />
)

// Animated section wrapper with reveal
const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Feature card
const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D2F159] to-[#b8d94e] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        <Icon className="w-6 h-6 text-gray-900" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Pricing data
const MONTHLY_PRICES = {
  STARTER: 9900,
  PROFESSIONAL: 29990,
  ENTERPRISE: 74990,
}

const getAnnualPrice = (tier: keyof typeof MONTHLY_PRICES) => MONTHLY_PRICES[tier] * 10

const TIER_FEATURES = {
  STARTER: [
    "Max 5 tag",
    "Max 2 edző", 
    "Max 50 óra/hó",
    "1 helyszín",
    "Órarend kezelés",
    "Jelenléti ív",
    "Email értesítések",
  ],
  PROFESSIONAL: [
    "Max 75 tag",
    "Max 10 edző",
    "Max 200 óra/hó", 
    "3 helyszín",
    "Online kártyás fizetés",
    "Push értesítések választható témákkal",
    "Riportok és statisztikák",
    "Csoportok kezelése",
  ],
  ENTERPRISE: [
    "Korlátlan tag",
    "Korlátlan edző",
    "Korlátlan óra",
    "Korlátlan helyszín",
    "Prioritásos támogatás",
    "API hozzáférés",
    "Egyedi integráció",
  ],
}

// Pricing card component
const PricingCard = ({ 
  tier, 
  name, 
  description, 
  isPopular, 
  billingPeriod,
  index 
}: { 
  tier: keyof typeof MONTHLY_PRICES
  name: string
  description: string
  isPopular: boolean
  billingPeriod: "monthly" | "annual"
  index: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  const monthlyPrice = MONTHLY_PRICES[tier]
  const annualTotal = getAnnualPrice(tier)
  const effectiveMonthly = billingPeriod === "annual" ? Math.round(annualTotal / 12) : monthlyPrice
  const yearlySaving = monthlyPrice * 12 - annualTotal
  
  const Icon = tier === "STARTER" ? User : tier === "PROFESSIONAL" ? Crown : Building2
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative p-8 rounded-2xl transition-all duration-300 ${
        isPopular 
          ? 'bg-gray-900 text-white shadow-xl' 
          : 'bg-white border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-[#D2F159] text-gray-900 text-xs font-bold rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> Legnépszerűbb
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isPopular ? 'bg-[#D2F159]' : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 ${isPopular ? 'text-gray-900' : 'text-gray-700'}`} />
        </div>
        <div>
          <h3 className={`font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
          <p className={`text-xs ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <span className={`text-3xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
          {effectiveMonthly.toLocaleString('hu-HU')} Ft
        </span>
        <span className={`text-sm ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>/hó</span>
        {billingPeriod === "annual" && (
          <div className={`text-sm mt-2 ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="line-through text-xs">{monthlyPrice.toLocaleString('hu-HU')} Ft/hó</div>
            <div className="mt-1">
              <span className="font-semibold">{annualTotal.toLocaleString('hu-HU')} Ft/év</span>
              <span className="text-xs ml-1">(előre fizetve)</span>
            </div>
            <div className="text-[#D2F159] font-medium mt-1">
              Megtakarítás: {yearlySaving.toLocaleString('hu-HU')} Ft/év
            </div>
          </div>
        )}
      </div>
      
      <ul className="space-y-2 mb-6">
        {TIER_FEATURES[tier].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isPopular ? 'text-[#D2F159]' : 'text-green-600'}`} />
            <span className={isPopular ? 'text-gray-200' : 'text-gray-700'}>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link
        href="/auth/signup"
        className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${
          isPopular
            ? 'bg-[#D2F159] text-gray-900 hover:bg-[#e5ff7a]'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Próbaidő indítása
      </Link>
    </motion.div>
  )
}
// Features list
const features = [
  {
    icon: Calendar,
    title: "Órarend kezelés",
    description: "Hozz létre hetente rendszeresen ismétlődő órákat, vagy akár egyszeri edzéseket. Kezeld a jelenléti ívet egy mozdulattal."
  },
  {
    icon: Users,
    title: "Tagnyilvántartás", 
    description: "Tagok, edzők és kiskorúak esetén szülők adatait is tárolhatod, és egymáshoz kapcsolhatod őket. Láthatod a fizetési előzményeiket, és hogy van-e tartozásuk."
  },
  {
    icon: CheckCircle2,
    title: "Tagsági felület",
    description: "A tagok egy egyedi kóddal csatlakozhatnak az egyesülethez, edzőteremhez, vagy jógaórához. Látni fogják, ha kezdődik egy eseményük, vagy bérletfizetésük esedékes. Küldhetnek direkt üzenetet az edzőknek, vagy akár felszerelés igényt is leadhatnak."
  },
  {
    icon: CreditCard,
    title: "Fizetés kezelés",
    description: "Kövesd nyomon a befizetéseket, a lejárt bérleteket, és fogadj fizetéseket online."
  },
  {
    icon: Bell,
    title: "Értesítések",
    description: "Push értesítéseket küldhetsz tagoknak, vagy akár mindenkinek az egyesületben, csoportban. Értesítést kapsz, ha valaki felvételt kér, üzenetet küld neked, vagy fizetése esedékessé válik. A saját profilodban beállíthatod, miről kérsz értesítést."
  },
  {
    icon: BarChart3,
    title: "Riportok",
    description: "Gyönyörű, átlátható grafikonokon és jelentéseken követheted a bevételek alakulását, az órák látogatottságát, és még sok más érdekes, vagy hasznos adatot."
  },
]

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#D2F159]/15 to-transparent rounded-full blur-3xl" />
      </div>
{/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-white/60 backdrop-blur-2xl border border-white/20 shadow-lg shadow-black/5 rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MusqlLogo size={32} />
            <span className="text-lg font-bold text-gray-900">Musql</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#funkciok" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Funkciók</a>
            <a href="#arak" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Árak</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2">
              Belépés
            </Link>
            <Link 
              href="/auth/signup"
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 text-sm"
            >
              Ingyenes próba
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pb-8 px-6 pt-28 md:pt-44">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#D2F159]" />
            <span className="text-gray-600">Kötöttségek nélkül, 15 napig ingyen!</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          >
            Edzések és tagok kezelése
            <br />
            <span className="relative inline-block">
              bárhonnan, egyszerűen.
              <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,6 Q100,0 200,6" stroke="#D2F159" strokeWidth="5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Órarendek, jelenléti ív, bérletek és befizetések - minden egy appban, modern, gyors felületről. Edzőtermeknek, személyi edzőknek, jógastúdióknak és harcművészeti egyesületeknek.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link 
              href="/auth/signup"
              className="group px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              Ingyen próba
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#funkciok"
              className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              Funkció áttekintése
            </a>
          </motion.div>
        </div>
      </section>

      {/* Product Preview with Scroll Animation */}
      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Kezelj mindent, bármilyen készülékről
            </h2>
          </div>
        }>
        {/* Dashboard Mockup */}
        <div className="h-full w-full bg-white p-4 md:p-6 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MusqlLogo size={28} />
              <span className="font-bold text-gray-900 text-sm">Musql</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100" />
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Aktív tagok", value: "47", icon: Users },
              { label: "Mai órák", value: "5", icon: Calendar },
              { label: "Havi bevétel", value: "312k", icon: CreditCard },
              { label: "Jelenlét", value: "87%", icon: CheckCircle2 },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <stat.icon className="w-4 h-4 text-gray-400 mb-1" />
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Schedule */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900 text-sm">Mai órarend</span>
            </div>
            <div className="space-y-2">
              {[
                { time: "09:00", name: "Reggeli jóga", spots: "8/12", done: true },
                { time: "11:00", name: "Funkcionális edzés", spots: "10/10", done: true },
                { time: "14:00", name: "BJJ kezdő", spots: "6/15", active: true },
                { time: "17:00", name: "CrossFit", spots: "4/12" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                  s.active ? 'bg-[#D2F159]/20 border border-[#D2F159]/30' : 
                  s.done ? 'bg-gray-100 opacity-60' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 w-10">{s.time}</span>
                    <span className="font-medium text-gray-900">{s.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{s.spots}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* Features Section */}
      <section id="funkciok" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Segíthetünk?
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Edzések, helyszínek, tagok és tagdíjak vezetése, jelenléti ív és sok más, hogy neked csak az edzésre kelljen figyelned!
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <RevealSection>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
                <Smartphone className="w-4 h-4" />
                Mobilra optimalizálva
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Könnyen. Gyorsan. Bármikor.
              </h2>
              <p className="text-gray-600 mb-6">
                A Musql mobilon is tökéletes. Jelenlét vezetése, új tagok felvétele, 
                befizetések rögzítése - bárhol, bármikor.
              </p>
              <ul className="space-y-3">
                {["Gyors jelenléti ív frissítés", "Push értesítések választható témákkal", "Átlátható, könnyen kezelhető módon"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#D2F159] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-gray-900" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </RevealSection>
            
            <RevealSection delay={0.1} className="relative">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-[36px] p-5 shadow-xl max-w-[280px] mx-auto">
                {/* Phone frame */}
                <div className="aspect-[9/19] bg-gray-900 rounded-[28px] overflow-hidden border-[6px] border-gray-900 relative">
                  {/* Status bar */}
                  <div className="bg-gray-900 px-5 py-1.5 flex items-center justify-between text-white text-[10px]">
                    <span>9:41</span>
                    <div className="absolute left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full" />
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-2.5 border border-white rounded-sm relative">
                        <div className="absolute inset-0.5 bg-[#D2F159] rounded-sm" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="bg-[#FAFAFA] h-full">
                    {/* Header */}
                    <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <MusqlLogo size={22} />
                        <span className="font-bold text-gray-900 text-xs">Musql</span>
                      </div>
                      <Bell className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Stats */}
                    <div className="px-3 py-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <Calendar className="w-3 h-3 text-[#D2F159] mb-1" />
                          <p className="text-base font-bold text-gray-900">5</p>
                          <p className="text-[9px] text-gray-500">Mai órák</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <Users className="w-3 h-3 text-[#D2F159] mb-1" />
                          <p className="text-base font-bold text-gray-900">32</p>
                          <p className="text-[9px] text-gray-500">Résztvevők</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current session */}
                    <div className="px-3">
                      <p className="text-[9px] font-semibold text-gray-900 mb-1">Következő óra</p>
                      <div className="bg-[#D2F159] rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-gray-900 text-xs">BJJ kezdő</span>
                          <span className="text-[9px] bg-white/50 px-1.5 py-0.5 rounded-full text-gray-900">14:00</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-gray-700">
                          <span>Nagy Péter</span>
                          <span>6/15 hely</span>
                        </div>
                      </div>
                      
                      <p className="text-[9px] font-semibold text-gray-900 mb-1 mt-2">Ma még</p>
                      {[
                        { time: "17:00", name: "CrossFit", spots: "4/12" },
                        { time: "19:00", name: "Esti jóga", spots: "7/10" },
                      ].map((s, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 mb-1.5 border border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-[10px]">{s.name}</p>
                            <p className="text-[8px] text-gray-500">{s.spots}</p>
                          </div>
                          <span className="text-[9px] text-gray-500 font-mono">{s.time}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-around">
                      {[
                        { icon: Calendar, label: "Órarend", active: true },
                        { icon: Users, label: "Tagok" },
                        { icon: CreditCard, label: "Pénzügy" },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.active ? 'bg-[#D2F159]' : ''}`}>
                            <item.icon className={`w-3 h-3 ${item.active ? 'text-gray-900' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-[8px] ${item.active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

{/* Pricing Section */}
      <section id="arak">
        <Pricing
          title="Melyik lesz a neked való?"
          description="Válassz a hozzád legjobban illő csomagunkból. Ne aggódj, a fizetési mód megadása csak biztonsági okokból kötelező. 15 napig semmit nem vonunk le és ez idő alatt bármikor felmondhatod, kötöttségek nélkül!"
          plans={[
            {
              name: "Alap",
              price: MONTHLY_PRICES.STARTER,
              yearlyPrice: getAnnualPrice("STARTER"),
              yearlySaving: MONTHLY_PRICES.STARTER * 12 - getAnnualPrice("STARTER"),
              features: TIER_FEATURES.STARTER,
              description: "Egyéni edzőknek",
              buttonText: "Próbaidő indítása",
              href: "/auth/signup",
              isPopular: false,
            },
            {
              name: "Prémium",
              price: MONTHLY_PRICES.PROFESSIONAL,
              yearlyPrice: getAnnualPrice("PROFESSIONAL"),
              yearlySaving: MONTHLY_PRICES.PROFESSIONAL * 12 - getAnnualPrice("PROFESSIONAL"),
              features: TIER_FEATURES.PROFESSIONAL,
              description: "Stúdióknak, kluboknak",
              buttonText: "Próbaidő indítása",
              href: "/auth/signup",
              isPopular: true,
            },
            {
              name: "Üzleti",
              price: MONTHLY_PRICES.ENTERPRISE,
              yearlyPrice: getAnnualPrice("ENTERPRISE"),
              yearlySaving: MONTHLY_PRICES.ENTERPRISE * 12 - getAnnualPrice("ENTERPRISE"),
              features: TIER_FEATURES.ENTERPRISE,
              description: "Nagyobb szervezeteknek",
              buttonText: "Próbaidő indítása",
              href: "/auth/signup",
              isPopular: false,
            },
          ]}
        />
        <p className="text-center text-gray-600 text-sm -mt-8 mb-8">
          Kérdésed van? Írj nekünk: <a href="mailto:info@musql.app" className="hover:text-gray-900 underline">info@musql.app</a> vagy ha úgy könnyebb, hívhatsz is a <a href="tel:+36203396404" className="hover:text-gray-900 underline">+36 20 339 6404</a> számon.
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center p-8 md:p-12 rounded-3xl bg-gray-900 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Próbáld ki, most 15 napig ingyen!
            </h2>
            <p className="text-gray-500 mb-6">
              Elköteleződés nélkül, bármikor felmondható. Regisztrálj és figyeld, mennyivel egyszerűbb dolgod lesz!
            </p>
            <Link 
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D2F159] text-gray-900 font-bold rounded-full hover:bg-[#e5ff7a] transition-all"
            >
              Regisztráció
              <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <MusqlLogo size={28} />
              <span className="font-bold text-gray-900">Musql</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#funkciok" className="hover:text-gray-900">Funkciók</a>
              <a href="#arak" className="hover:text-gray-900">Árak</a>
              <Link href="/aszf" className="hover:text-gray-900">ÁSZF</Link>
              <Link href="/adatvedelem" className="hover:text-gray-900">Adatvédelem</Link>
              <Link href="/cookie-szabalyzat" className="hover:text-gray-900">Cookie</Link>
              <a href="mailto:info@musql.app" className="hover:text-gray-900">Kapcsolat</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Musql. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  )
}
