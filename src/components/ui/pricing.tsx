"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  yearlySaving: number;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Egyszerű, átlátható árazás",
  description = "Válaszd ki a számodra megfelelő csomagot\nMinden csomag 15 napos ingyenes próbaidőszakot tartalmaz.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#D2F159", "#1f2937", "#6b7280", "#e5e7eb"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="py-16 px-6">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="text-gray-600 text-lg whitespace-pre-line max-w-xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1.5 bg-gray-100 rounded-full">
          <button
            onClick={() => { if (!isMonthly) handleToggle(false); }}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
              isMonthly ? "bg-white shadow-md text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Havi
          </button>
          <button
            onClick={() => { if (isMonthly) handleToggle(true); }}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
              !isMonthly ? "bg-white shadow-md text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Éves
            <span className="text-xs bg-[#D2F159] text-gray-900 px-2 py-0.5 rounded-full font-bold">-17%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : { y: 0, opacity: 1 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              "rounded-2xl p-8 text-center lg:flex lg:flex-col lg:justify-center relative",
              plan.isPopular 
                ? "bg-gray-900 text-white border-2 border-[#D2F159]" 
                : "bg-white border border-gray-200",
              "flex flex-col",
              !plan.isPopular && "mt-5 md:mt-0",
              index === 0 || index === 2 ? "z-0" : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-[#D2F159] text-gray-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Legnépszerűbb
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className={cn("text-base font-semibold", plan.isPopular ? "text-gray-300" : "text-gray-600")}>
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className={cn("text-5xl font-bold tracking-tight", plan.isPopular ? "text-white" : "text-gray-900")}>
                  <NumberFlow
                    value={isMonthly ? plan.price : Math.round(plan.yearlyPrice / 12)}
                    format={{
                      style: "decimal",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                  <span className="text-2xl"> Ft</span>
                </span>
                <span className={cn("text-sm font-semibold leading-6 tracking-wide", plan.isPopular ? "text-gray-400" : "text-gray-600")}>
                  /hó
                </span>
              </div>

              <p className={cn("text-sm leading-5 mt-2", plan.isPopular ? "text-gray-400" : "text-gray-600")}>
                {isMonthly ? "havonta fizetve" : (
                  <>
                    <span className="font-semibold">{plan.yearlyPrice.toLocaleString("hu-HU")} Ft/év</span>
                    <span className="text-xs ml-1">(előre fizetve)</span>
                    <br />
                    <span className="text-[#D2F159]">Megtakarítás: {plan.yearlySaving.toLocaleString("hu-HU")} Ft/év</span>
                  </>
                )}
              </p>

              <ul className="mt-6 gap-2 flex flex-col text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={cn("h-4 w-4 mt-1 flex-shrink-0", plan.isPopular ? "text-[#D2F159]" : "text-green-600")} />
                    <span className={plan.isPopular ? "text-gray-200" : "text-gray-700"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  href={plan.href}
                  className={cn(
                    "block w-full py-3 rounded-xl text-center font-semibold transition-all",
                    plan.isPopular
                      ? "bg-[#D2F159] text-gray-900 hover:bg-[#e5ff7a]"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className={cn("mt-4 text-xs leading-5", plan.isPopular ? "text-gray-400" : "text-gray-600")}>
                  {plan.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
