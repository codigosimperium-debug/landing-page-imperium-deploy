"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  alt?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Section({
  id,
  title,
  subtitle,
  alt = false,
  className = "",
  children,
}: SectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const sectionVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 14,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.62,
        when: "beforeChildren" as const,
        staggerChildren: shouldReduceMotion ? 0 : 0.09,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.09,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 10,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
      },
    },
  };

  return (
    <motion.section
      id={id}
      className={`imperium-section ${alt ? "imperium-section-alt" : ""} ${className}`.trim()}
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
    >
      <div className="imperium-container">
        <motion.div className="space-y-4" variants={containerVariants}>
          {subtitle ? (
            <motion.p
              className="text-xs uppercase tracking-[0.18em] text-muted"
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
          ) : null}

          <motion.h2 className="text-3xl md:text-4xl" variants={itemVariants}>
            {title}
          </motion.h2>

          <div className="pt-3">
            {Children.map(children, (child, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={index > 0 ? "mt-4" : ""}
              >
                {child}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
