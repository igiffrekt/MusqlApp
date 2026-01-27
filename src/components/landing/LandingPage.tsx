"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, Calendar, CreditCard, Bell, 
  BarChart3, Shield, Smartphone,
  CheckCircle2, ArrowRight, Star, Zap,
  Play, ChevronRight, Sparkles,
  TrendingUp, Clock, MapPin
} from "lucide-react"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"

// Musql Logo component
const MusqlLogo = ({ size = 40, className = "" }: { size?: number, className?: string }) => (
  <Image 
    src="/img/musql_ikon.png" 
    alt="Musql" 
    width={size} 
    height={size} 
    className={`rounded-xl ${className}`}
  />
)

// Animated section wrapper with reveal
const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Feature card with hover effects
const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#b8d94e] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#D2F159]/20">
        <Icon className="w-7 h-7 text-gray-900" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Pricing card
const PricingCard = ({ name, price, period, description, features, cta, popular, index }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
        popular 
          ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20' 
          : 'bg-white border border-gray-200 hover:shadow-xl hover:shadow-gray-100/50'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-[#D2F159] text-gray-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Legnépszerűbb
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-1 ${popular ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
        <p className={`text-sm ${popular ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>
      <div className="mb-8">
        <span className={`text-5xl font-bold ${popular ? 'text-white' : 'text-gray-900'}`}>{price}</span>
        <span className={`ml-2 ${popular ? 'text-gray-400' : 'text-gray-500'}`}>{period}</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature: string, j: number) => (
          <li key={j} className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${popular ? 'bg-[#D2F159]' : 'bg-[#D2F159]/20'}`}>
              <CheckCircle2 className={`w-3 h-3 ${popular ? 'text-gray-900' : 'text-gray-700'}`} />
            </div>
            <span className={popular ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/signup"
        className={`block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300 ${
          popular
            ? 'bg-[#D2F159] text-gray-900 hover:bg-[#e5ff7a] hover:shadow-lg hover:shadow-[#D2F159]/30'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {cta}
      </Link>
    </motion.div>
  )
}

// Testimonial card
const TestimonialCard = ({ name, role, text, rating, index }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 rounded-3xl bg-white border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, j) => (
          <Star key={j} className="w-5 h-5 fill-[#D2F159] text-[#D2F159]" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed text-lg">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D2F159] to-[#b8d94e] flex items-center justify-center shadow-md">
          <span className="text-sm font-bold text-gray-900">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Stats counter
const StatItem = ({ value, label, index }: { value: string, label: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
    className="text-center"
  >
    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
      {value}
    </div>
    <div className="text-gray-500 text-sm">{label}</div>
  </motion.div>
)

const features = [
  {
    icon: Users,
    title: "Tagkezelés",
    description: "Ügyfelek, bérletek és csoportok kezelése egyszerűen. Minden adat egy helyen, azonnal elérhető."
  },
  {
    icon: Calendar,
    title: "Órarend & Foglalás",
    description: "Egyszerű órarend kezelés. Tagok online foglalhatnak és valós időben látják az órákat."
  },
  {
    icon: CreditCard,
    title: "Fizetések",
    description: "Bérletek, napijegyek nyomon követése. Online és készpénzes fizetés támogatás."
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
    description: "Adatvédelem és biztonság elsőre. Magyar szabályozásnak teljesen megfelelő."
  },
]

const pricingPlans = [
  {
    name: "Alap",
    price: "9 900",
    period: "Ft/hó",
    description: "Kisebb stúdióknak, személyi edzőknek",
    features: [
      "Max 50 tag",
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
    text: "Végre nem kell excelben vezetnem a tagokat. A Musql mindent megold, és a tagjaim is imádják az appot!",
    rating: 5,
  },
  {
    name: "Nagy Péter",
    role: "BJJ edző, Budapest",
    text: "A foglalási rendszer életmentő. Nincs több telefonálgatás, a tagok appból foglalnak 2 kattintással.",
    rating: 5,
  },
  {
    name: "Szabó Márk",
    role: "CrossFit box tulajdonos",
    text: "Átlátom a bevételeket, a tagok fizetnek időben, és minden adat egy helyen van. Ajánlom mindenkinek!",
    rating: 5,
  },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#D2F159]/20 via-[#D2F159]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-gray-200/50" />
        <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <MusqlLogo size={40} className="shadow-lg shadow-[#D2F159]/30 group-hover:shadow-[#D2F159]/50 transition-shadow" />
            <span className="text-xl font-bold text-gray-900">Musql</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funkciok" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Funkciók</a>
            <a href="#arak" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Árak</a>
            <a href="#velemenyek" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Vélemények</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium px-4 py-2">
              Belépés
            </Link>
            <Link 
              href="/auth/signup"
              className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all text-sm shadow-lg shadow-gray-900/10"
            >
              Regisztráció
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          style={{ y: heroY }}
          className="max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-[#D2F159] animate-pulse" />
            <span className="text-gray-600">15 napos ingyenes próbaidő</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.95] tracking-tight"
          >
            <span className="text-gray-900">Edzéstermed</span>
            <br />
            <span className="relative">
              <span className="relative z-10">egyszerűen</span>
              <svg className="absolute -bottom-2 left-0 w-full h-4 z-0" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M0,8 Q150,0 300,8" stroke="#D2F159" strokeWidth="8" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Tagkezelés, órarend, fizetések, értesítések — minden egy helyen.
            <span className="text-gray-700"> Jógastúdióknak, harcművészeti egyesületeknek, személyi edzőknek.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              href="/auth/signup"
              className="group px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all text-lg shadow-xl shadow-gray-900/20 flex items-center gap-2"
            >
              Ingyenes próba
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#funkciok"
              className="px-8 py-4 text-gray-600 font-medium hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Funkciók megtekintése
            </a>
          </motion.div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <StatItem value="500+" label="aktív felhasználó" index={0} />
            <StatItem value="15k+" label="kezelt óra/hó" index={1} />
            <StatItem value="99.9%" label="uptime" index={2} />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Product Preview with Scroll Animation */}
      <ContainerScroll
        titleComponent={
          <div className="mb-8">
            <span className="text-[#9EBB35] text-sm font-semibold tracking-wide uppercase mb-4 block">
              Ismerd meg a platformot
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900">
              Minden egy helyen,{" "}
              <span className="relative inline-block">
                átláthatóan
                <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0,6 Q100,0 200,6" stroke="#D2F159" strokeWidth="5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h2>
          </div>
        }
      >
        {/* Dashboard Mockup */}
        <div className="h-full w-full bg-white p-6 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MusqlLogo size={32} />
              <span className="font-bold text-gray-900">Musql</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <span className="text-sm text-gray-600">Demo Stúdió</span>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Aktív tagok", value: "127", icon: Users, change: "+12%" },
              { label: "Mai órák", value: "8", icon: Calendar, change: "3 hátra" },
              { label: "Havi bevétel", value: "847k", icon: TrendingUp, change: "+23%" },
              { label: "Jelenlét", value: "89%", icon: CheckCircle2, change: "+5%" },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-3 gap-4">
            {/* Schedule */}
            <div className="col-span-2 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Mai órarend</span>
                <span className="text-xs text-gray-500">Január 27.</span>
              </div>
              <div className="space-y-2">
                {[
                  { time: "09:00", name: "Reggeli jóga", trainer: "Kiss Anna", spots: "12/15", status: "done" },
                  { time: "11:00", name: "HIIT Training", trainer: "Nagy Péter", spots: "8/10", status: "done" },
                  { time: "14:00", name: "BJJ Alapok", trainer: "Szabó Márk", spots: "14/20", status: "active" },
                  { time: "17:00", name: "CrossFit WOD", trainer: "Tóth Gábor", spots: "6/12", status: "upcoming" },
                  { time: "19:00", name: "Esti jóga", trainer: "Kiss Anna", spots: "9/15", status: "upcoming" },
                ].map((session, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    session.status === 'active' ? 'bg-[#D2F159]/20 border border-[#D2F159]/30' : 
                    session.status === 'done' ? 'bg-gray-100 opacity-60' : 'bg-white border border-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-500 w-12">{session.time}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{session.name}</div>
                        <div className="text-xs text-gray-500">{session.trainer}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{session.spots}</span>
                      {session.status === 'active' && (
                        <span className="px-2 py-0.5 bg-[#D2F159] text-gray-900 text-xs font-medium rounded-full">Folyamatban</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent members */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Új tagok</span>
                <span className="text-xs text-[#9EBB35] font-medium">+5 e héten</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Horváth Lilla", plan: "Prémium", days: "2 napja" },
                  { name: "Molnár Bence", plan: "Alap", days: "3 napja" },
                  { name: "Varga Eszter", plan: "Prémium", days: "5 napja" },
                  { name: "Fekete Ádám", plan: "Alap", days: "6 napja" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{member.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.plan} • {member.days}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* Features Section */}
      <section id="funkciok" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#9EBB35] text-sm font-semibold tracking-wide uppercase mb-4 block">Funkciók</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Minden ami kell, egy helyen
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Nincs több Excel, nincs több Messenger-csoport. A Musql mindent megold.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="relative py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Mobilbarát
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Kezeld az edzéstermet bárhonnan
              </h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                A Musql tökéletesen működik mobilon is. Jelenlét vezetése, 
                új tagok felvétele, fizetések kezelése — mind egy kattintásra.
              </p>
              <ul className="space-y-4">
                {["Jelenlét vezetés QR kóddal", "Push értesítések", "Offline működés", "Gyors tagfelvétel"].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D2F159] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-gray-900" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </RevealSection>
            
            <RevealSection delay={0.2} className="relative">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-[40px] p-8 shadow-2xl shadow-gray-200/50">
                <div className="aspect-[9/16] bg-white rounded-[32px] shadow-xl flex items-center justify-center overflow-hidden border border-gray-100">
                  <div className="text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mx-auto mb-4 shadow-xl shadow-[#D2F159]/30 rounded-2xl"
                    >
                      <MusqlLogo size={80} className="rounded-2xl" />
                    </motion.div>
                    <p className="text-gray-900 font-bold text-lg">Musql</p>
                    <p className="text-gray-400 text-sm">Progressive Web App</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="arak" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#9EBB35] text-sm font-semibold tracking-wide uppercase mb-4 block">Árazás</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Egyszerű, átlátható árazás
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              15 napos ingyenes próbaidő minden csomagra. Nincs rejtett költség.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={plan.name} {...plan} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="velemenyek" className="relative py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#9EBB35] text-sm font-semibold tracking-wide uppercase mb-4 block">Vélemények</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Mit mondanak rólunk?
            </h2>
            <p className="text-gray-500">Edzők és stúdiótulajdonosok véleménye</p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} {...t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="relative text-center p-12 md:p-16 rounded-[40px] bg-gray-900 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D2F159]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Készen állsz a váltásra?
              </h2>
              <p className="text-gray-400 mb-10 text-lg max-w-xl mx-auto">
                Csatlakozz több száz elégedett edzőhöz. 15 nap ingyenes próba, 
                bankkártya megadása nélkül.
              </p>
              <Link 
                href="/auth/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#D2F159] text-gray-900 font-bold rounded-full text-lg hover:bg-[#e5ff7a] transition-all shadow-xl shadow-[#D2F159]/30"
              >
                Ingyenes próba indítása
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <MusqlLogo size={32} />
                <span className="font-bold text-gray-900">Musql</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Edzésmenedzsment rendszer jógastúdióknak, 
                harcművészeti egyesületeknek és személyi edzőknek.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Termék</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li><a href="#funkciok" className="hover:text-gray-900 transition-colors">Funkciók</a></li>
                <li><a href="#arak" className="hover:text-gray-900 transition-colors">Árak</a></li>
                <li><Link href="/auth/signin" className="hover:text-gray-900 transition-colors">Belépés</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Jogi</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li><Link href="/adatvedelem" className="hover:text-gray-900 transition-colors">Adatvédelem</Link></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">ÁSZF</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Kapcsolat</h4>
              <ul className="space-y-3 text-gray-500 text-sm">
                <li>info@musql.app</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Musql. Minden jog fenntartva.
          </div>
        </div>
      </footer>
    </div>
  )
}
