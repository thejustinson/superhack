"use client";

import React from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "ghost" | "danger" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface ButtonElementProps extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface LinkProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonElementProps | LinkProps;

const variantBase: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: "#ffba08", color: "#0b0c0f" },
  ghost: { backgroundColor: "transparent", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.12)" },
  secondary: { backgroundColor: "transparent", color: "#f0f0f0", border: "1px solid rgba(255,255,255,0.15)" },
  danger: { backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
};

const sizeBase: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: "0.8125rem", padding: "7px 16px" },
  md: { fontSize: "0.9rem", padding: "10px 22px" },
  lg: { fontSize: "0.9375rem", padding: "14px 30px" },
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", disabled, children, className, style } = props;

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    fontFamily: "inherit",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    transition: "opacity 0.2s, transform 0.15s",
    whiteSpace: "nowrap",
    ...variantBase[variant],
    ...sizeBase[size],
    ...style,
  };

  const hoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      if (disabled) return;
      e.currentTarget.style.opacity = "0.85";
      e.currentTarget.style.transform = "translateY(-1px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.opacity = "1";
      e.currentTarget.style.transform = "translateY(0)";
    },
  };

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} target={(props as LinkProps).target} rel={(props as LinkProps).rel}
        className={className} style={base} {...hoverHandlers}>
        {children}
      </Link>
    );
  }

  const { href: _h, target: _t, rel: _r, ...buttonRest } = props as BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & Partial<Pick<LinkProps, "href" | "target" | "rel">>;

  return (
    <button className={className} style={base} disabled={disabled}
      {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...hoverHandlers}>
      {children}
    </button>
  );
}
