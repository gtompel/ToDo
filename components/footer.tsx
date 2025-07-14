import React from "react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted text-muted-foreground py-2 text-center text-xs">
      © {new Date().getFullYear()} Корпоративная система управления IT-услугами
    </footer>
  )
} 