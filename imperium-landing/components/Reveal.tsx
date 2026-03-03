"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "div" | "section" | "article";
  delay?: number;
  y?: number;
  blur?: boolean;
  stagger?: number;
};

const defaultTransition = {
  duration: 0.58,
};

export default function Reveal({
  children,
  className,
  id,
  as = "div",
  delay = 0,
  y = 12,
  blur = false,
  stagger = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  const variants = {
    hidden: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : y,
      filter: reduceMotion ? "blur(0px)" : blur ? "blur(2px)" : "blur(0px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        ...defaultTransition,
        delay: reduceMotion ? 0 : delay,
        when: "beforeChildren" as const,
        staggerChildren: reduceMotion ? 0 : stagger,
      },
    },
  };

  if (as === "section") {
    return (
      <motion.section
        id={id}
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.24 }}
      >
        {children}
      </motion.section>
    );
  }

  if (as === "article") {
    return (
      <motion.article
        id={id}
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.24 }}
      >
        {children}
      </motion.article>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.24 }}
    >
      {children}
    </motion.div>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function RevealItem({ children, className, y = 10 }: RevealItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : y },
        show: {
          opacity: 1,
          y: 0,
          transition: defaultTransition,
        },
      }}
    >
      {children}
    </motion.div>
  );
}
