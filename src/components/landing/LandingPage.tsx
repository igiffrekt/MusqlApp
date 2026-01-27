"use client"

import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, Calendar, CreditCard, Bell, 
  BarChart3, Shield, Smartphone,
  CheckCircle2, ArrowRight, Star, Zap,
  Play, ChevronRight, Sparkles
} from "lucide-react"

// Animated gradient orb component
const GradientOrb = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
)

// Animated background grid
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
  </div>
)

// Animated section wrapper with reveal
const RevealSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Floating badge component
const FloatingBadge = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm"
  >
    {children}
  </motion.div>
)

// Glowing button component
const GlowButton = ({ children, href, variant = "primary" }: { children: React.ReactNode, href: string, variant?: "primary" | "secondary" }) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-full transition-all duration-300 group"
  
  if (variant === "primary") {
    return (
      <Link href={href} className={`${baseStyles}`}>
        <span className="absolute inset-0 rounded-full bg-[#D2F159] blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
        <span className="relative flex items-center gap-2 bg-[#D2F159] text-[#0a0a0f] px-8 py-4 rounded-full group-hover:bg-[#e5ff7a] transition-colors">
          {children}
        </span>
      </Link>
    )
  }
  
  return (
    <Link href={href} className={`${baseStyles} border border-white/20 hover:border-white/40 hover:bg-white/5`}>
      {children}
    </Link>
  )
}

// Feature card with hover effects
const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-[#D2F159]/30 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#D2F159]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D2F159]/20 to-[#D2F159]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-[#D2F159]" />
        </div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-[#D2F159] transition-colors">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>
      </div>
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
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
        popular 
          ? 'bg-gradient-to-b from-[#D2F159]/10 to-transparent border-[#D2F159]/50' 
          : 'bg-gradient-to-b from-white/5 to-transparent border-white/10 hover:border-white/20'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-[#D2F159] text-[#0a0a0f] text-xs font-bold rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Legnépszerűbb
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-1">{name}</h3>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <div className="mb-8">
        <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{price}</span>
        <span className="text-white/50 ml-2">{period}</span>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature: string, j: number) => (
          <li key={j} className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-[#D2F159]" />
            </div>
            <span className="text-white/80">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/signup"
        className={`block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300 ${
          popular
            ? 'bg-[#D2F159] text-[#0a0a0f] hover:bg-[#e5ff7a] hover:shadow-lg hover:shadow-[#D2F159]/20'
            : 'bg-white/10 hover:bg-white/20'
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-[#D2F159] text-[#D2F159]" />
        ))}
      </div>
      <p className="text-white/80 mb-6 leading-relaxed italic">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2F159]/30 to-[#D2F159]/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-[#D2F159]">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-white/50">{role}</p>
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
    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent mb-2">
      {value}
    </div>
    <div className="text-white/50 text-sm">{label}</div>
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
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <GradientOrb className="w-[800px] h-[800px] bg-[#D2F159]/20 -top-[400px] -left-[400px]" />
        <GradientOrb className="w-[600px] h-[600px] bg-purple-500/10 top-1/2 -right-[300px]" />
        <GradientOrb className="w-[500px] h-[500px] bg-[#D2F159]/10 bottom-0 left-1/4" />
        <GridBackground />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-xl border-b border-white/5" />
        <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D2F159] to-[#9EE22B] rounded-xl flex items-center justify-center shadow-lg shadow-[#D2F159]/20 group-hover:shadow-[#D2F159]/40 transition-shadow">
              <span className="text-xl">💪</span>
            </div>
            <span className="text-xl font-bold">Musql</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funkciok" className="text-white/60 hover:text-white transition-colors text-sm">Funkciók</a>
            <a href="#arak" className="text-white/60 hover:text-white transition-colors text-sm">Árak</a>
            <a href="#velemenyek" className="text-white/60 hover:text-white transition-colors text-sm">Vélemények</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-white/60 hover:text-white transition-colors text-sm px-4 py-2">
              Belépés
            </Link>
            <Link 
              href="/auth/signup"
              className="px-5 py-2 bg-white/10 hover:bg-white/20 font-medium rounded-full transition-all text-sm border border-white/10"
            >
              Regisztráció
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FloatingBadge>
              <Zap className="w-4 h-4 text-[#D2F159]" />
              <span className="text-white/80">15 napos ingyenes próbaidő</span>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </FloatingBadge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mt-8 mb-6 leading-[0.95] tracking-tight"
          >
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Edzéstermed
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#D2F159] via-[#e5ff7a] to-[#D2F159] bg-clip-text text-transparent">
              egyszerűen
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Tagkezelés, órarend, fizetések, értesítések — minden egy helyen.
            <span className="text-white/70"> Jógastúdióknak, harcművészeti egyesületeknek, személyi edzőknek.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <GlowButton href="/auth/signup" variant="primary">
              Ingyenes próba
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GlowButton>
            <GlowButton href="#funkciok" variant="secondary">
              <Play className="w-4 h-4" />
              Funkciók megtekintése
            </GlowButton>
          </motion.div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
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
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="funkciok" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#D2F159] text-sm font-medium tracking-wide uppercase mb-4 block">Funkciók</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Minden ami kell,{" "}
              <span className="bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent">egy helyen</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
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
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <FloatingBadge>
                <Smartphone className="w-4 h-4 text-[#D2F159]" />
                <span className="text-white/80">Mobilbarát</span>
              </FloatingBadge>
              <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-6">
                Kezeld az edzéstermet{" "}
                <span className="bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent">bárhonnan</span>
              </h2>
              <p className="text-white/50 mb-8 text-lg leading-relaxed">
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
                    <div className="w-6 h-6 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </RevealSection>
            
            <RevealSection delay={0.2} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D2F159]/20 via-transparent to-purple-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl p-8 border border-white/10">
                <div className="aspect-[9/16] bg-gradient-to-b from-[#0a0a0f] to-[#12121a] rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <motion.div 
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(210, 241, 89, 0.3)",
                          "0 0 40px rgba(210, 241, 89, 0.5)",
                          "0 0 20px rgba(210, 241, 89, 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-[#D2F159] to-[#9EE22B] rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    >
                      <span className="text-4xl">💪</span>
                    </motion.div>
                    <p className="text-[#D2F159] font-bold text-lg">Musql</p>
                    <p className="text-white/40 text-sm">Progressive Web App</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="arak" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D2F159]/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#D2F159] text-sm font-medium tracking-wide uppercase mb-4 block">Árazás</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Egyszerű,{" "}
              <span className="bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent">átlátható</span>
              {" "}árazás
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
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
      <section id="velemenyek" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-[#D2F159] text-sm font-medium tracking-wide uppercase mb-4 block">Vélemények</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Mit mondanak{" "}
              <span className="bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent">rólunk?</span>
            </h2>
            <p className="text-white/50">Edzők és stúdiótulajdonosok véleménye</p>
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
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#D2F159]/10 to-transparent" />
        </div>
        <RevealSection className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Készen állsz a{" "}
            <span className="bg-gradient-to-r from-[#D2F159] to-[#9EE22B] bg-clip-text text-transparent">váltásra?</span>
          </h2>
          <p className="text-white/50 mb-10 text-lg max-w-xl mx-auto">
            Csatlakozz több száz elégedett edzőhöz. 15 nap ingyenes próba, 
            bankkártya megadása nélkül.
          </p>
          <GlowButton href="/auth/signup" variant="primary">
            Ingyenes próba indítása
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </GlowButton>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#D2F159] to-[#9EE22B] rounded-lg flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <span className="font-bold">Musql</span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed">
                Edzésmenedzsment rendszer jógastúdióknak, 
                harcművészeti egyesületeknek és személyi edzőknek.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white/80">Termék</h4>
              <ul className="space-y-3 text-white/40 text-sm">
                <li><a href="#funkciok" className="hover:text-white transition-colors">Funkciók</a></li>
                <li><a href="#arak" className="hover:text-white transition-colors">Árak</a></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Belépés</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white/80">Jogi</h4>
              <ul className="space-y-3 text-white/40 text-sm">
                <li><Link href="/adatvedelem" className="hover:text-white transition-colors">Adatvédelem</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">ÁSZF</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white/80">Kapcsolat</h4>
              <ul className="space-y-3 text-white/40 text-sm">
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
