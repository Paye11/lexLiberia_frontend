import type { ReactNode } from 'react'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(text: string, withinLink = false): ReactNode[] {
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0
  let buffer = ''

  const flush = () => {
    if (buffer) {
      nodes.push(<span key={key++}>{buffer}</span>)
      buffer = ''
    }
  }

  const codeMatch = (s: string, start: number): { len: number; inner: string } | null => {
    if (s.charAt(start) !== '`') return null
    const close = s.indexOf('`', start + 1)
    if (close === -1) return null
    return { len: close - start + 1, inner: s.slice(start + 1, close) }
  }

  const boldMatch = (s: string, start: number): { len: number; inner: string } | null => {
    if (s.slice(start, start + 2) !== '**') return null
    const close = s.indexOf('**', start + 2)
    if (close === -1) return null
    return { len: close - start + 2, inner: s.slice(start + 2, close) }
  }

  const italicMatch = (s: string, start: number): { len: number; inner: string } | null => {
    if (s.charAt(start) !== '*') return null
    if (s.charAt(start + 1) === '*') return null
    const rest = s.slice(start + 1)
    const close = rest.search(/(?<!\*)\*(?!\*)/)
    if (close === -1) return null
    return { len: close + 2, inner: rest.slice(0, close) }
  }

  const linkMatch = (s: string, start: number): { len: number; label: string; url: string } | null => {
    if (withinLink) return null
    if (s.charAt(start) !== '[') return null
    const labelEnd = s.indexOf('](', start + 1)
    if (labelEnd === -1) return null
    const urlEnd = s.indexOf(')', labelEnd + 2)
    if (urlEnd === -1) return null
    return {
      len: urlEnd - start + 1,
      label: s.slice(start + 1, labelEnd),
      url: s.slice(labelEnd + 2, urlEnd),
    }
  }

  while (i < text.length) {
    const code = codeMatch(text, i)
    if (code) {
      flush()
      nodes.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {code.inner}
        </code>,
      )
      i += code.len
      continue
    }

    const bold = boldMatch(text, i)
    if (bold) {
      flush()
      nodes.push(<strong key={key++} className="font-semibold text-foreground">{renderInline(bold.inner)}</strong>)
      i += bold.len
      continue
    }

    const italic = italicMatch(text, i)
    if (italic) {
      flush()
      nodes.push(<em key={key++} className="italic">{renderInline(italic.inner)}</em>)
      i += italic.len
      continue
    }

    const link = linkMatch(text, i)
    if (link) {
      flush()
      const safeUrl = /^(https?:|mailto:|\/)/i.test(link.url) ? link.url : '#'
      nodes.push(
        <a
          key={key++}
          href={safeUrl}
          target={safeUrl.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          {renderInline(link.label, true)}
        </a>,
      )
      i += link.len
      continue
    }

    buffer += text.charAt(i)
    i++
  }

  flush()
  return nodes
}

interface Block {
  type: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'li' | 'blockquote' | 'hr' | 'code' | 'table'
  content?: string
  items?: string[]
  rows?: string[][]
  lang?: string
}

function splitBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^\s*$/.test(line)) {
      i++
      continue
    }

    if (/^\s*---+\s*$/.test(line) || /^\s*\*\s*\*\s*\*\s*$/.test(line) || /^\s*___+\s*$/.test(line)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    const codeFence = line.match(/^\s*```(\w*)\s*$/)
    if (codeFence) {
      const lang = codeFence[1] || ''
      const fenceLines: string[] = []
      i++
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        fenceLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push({ type: 'code', content: fenceLines.join('\n'), lang })
      continue
    }

    const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*\s*$/)
    if (heading) {
      const level = heading[1].length
      blocks.push({ type: (`h${level}` as Block['type']), content: heading[2] })
      i++
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push({ type: 'blockquote', content: quote.join('\n') })
      continue
    }

    const tableHeader = line.match(/^\s*\|?.+\|.+\|?\s*$/)
    if (tableHeader && i + 1 < lines.length) {
      const sepLine = lines[i + 1]
      if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(sepLine)) {
        const splitRow = (row: string): string[] =>
          row
            .replace(/^\s*\|/, '')
            .replace(/\|\s*$/, '')
            .split('|')
            .map((cell) => cell.trim())
        const headerRow = splitRow(line)
        const rows: string[][] = [headerRow]
        i += 2
        while (i < lines.length && /^\s*\|?.+\|.+\|?\s*$/.test(lines[i]) && !/^\s*$/.test(lines[i])) {
          rows.push(splitRow(lines[i]))
          i++
        }
        blocks.push({ type: 'table', rows })
        continue
      }
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].match(/^\s*[-*+]\s+(.*)$/)
        if (!m) break
        items.push(m[1])
        i++
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim()
          i++
        }
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].match(/^\s*\d+\.\s+(.*)$/)
        if (!m) break
        items.push(m[1])
        i++
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim()
          i++
        }
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraph: string[] = [line.trim()]
    i++
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(#{1,4})\s+/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^\s*```/.test(lines[i])) {
      paragraph.push(lines[i].trim())
      i++
    }
    blocks.push({ type: 'p', content: paragraph.join(' ') })
  }

  return blocks
}

export function MarkdownView({ source, className = '' }: { source: string; className?: string }) {
  const blocks = splitBlocks(String(source || ''))
  const rendered = blocks.map((block, idx) => {
    switch (block.type) {
      case 'h1':
        return (
          <h1 key={idx} className="mb-3 mt-6 font-heading text-2xl font-bold tracking-tight text-foreground first:mt-0">
            {renderInline(block.content || '')}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={idx} className="mb-3 mt-6 font-heading text-xl font-bold tracking-tight text-foreground first:mt-0">
            {renderInline(block.content || '')}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={idx} className="mb-2 mt-5 font-heading text-lg font-semibold tracking-tight text-foreground first:mt-0">
            {renderInline(block.content || '')}
          </h3>
        )
      case 'h4':
        return (
          <h4 key={idx} className="mb-2 mt-4 font-heading text-base font-semibold tracking-tight text-foreground first:mt-0">
            {renderInline(block.content || '')}
          </h4>
        )
      case 'p':
        return (
          <p key={idx} className="mb-4 whitespace-pre-wrap leading-relaxed text-foreground last:mb-0">
            {renderInline(block.content || '')}
          </p>
        )
      case 'blockquote':
        return (
          <blockquote
            key={idx}
            className="my-4 border-l-4 border-primary/40 bg-muted/40 px-4 py-2 text-foreground/90"
          >
            <MarkdownView source={block.content || ''} />
          </blockquote>
        )
      case 'hr':
        return <hr key={idx} className="my-6 border-border" />
      case 'code':
        return (
          <pre
            key={idx}
            className="my-4 overflow-x-auto rounded-xl bg-muted p-4 font-mono text-[0.85em] leading-relaxed text-foreground"
          >
            <code className="whitespace-pre-wrap break-words">{block.content}</code>
          </pre>
        )
      case 'ul':
        return (
          <ul key={idx} className="my-4 list-disc space-y-2 pl-6 text-foreground">
            {(block.items || []).map((item, j) => (
              <li key={j} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol key={idx} className="my-4 list-decimal space-y-2 pl-6 text-foreground">
            {(block.items || []).map((item, j) => (
              <li key={j} className="leading-relaxed">{renderInline(item)}</li>
            ))}
          </ol>
        )
      case 'table': {
        const [header, ...rows] = block.rows || []
        if (!header) return null
        return (
          <div key={idx} className="my-4 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border text-sm">
              <thead className="bg-muted">
                <tr>
                  {header.map((cell, j) => (
                    <th key={j} className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r} className="odd:bg-background even:bg-muted/30">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-border px-3 py-2 align-top text-foreground">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      default:
        return null
    }
  })

  return <div className={className}>{rendered}</div>
}
