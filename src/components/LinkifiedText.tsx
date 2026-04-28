import React from 'react'

interface LinkifiedTextProps {
  text: string
  className?: string
}

/**
 * Renders text with URLs converted to clickable links.
 * Particularly useful for ClickUp ticket links and other URLs.
 */
export const LinkifiedText: React.FC<LinkifiedTextProps> = ({ text, className }) => {
  // URL regex pattern that matches http, https, and www links
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  
  const parts = text.split(urlPattern)
  
  return (
    <span className={`whitespace-pre-wrap ${className ?? ''}`}>
      {parts.map((part, index) => {
        if (urlPattern.test(part)) {
          // Reset the lastIndex since we're reusing the regex
          urlPattern.lastIndex = 0
          const href = part.startsWith('www.') ? `https://${part}` : part
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              {part}
            </a>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
