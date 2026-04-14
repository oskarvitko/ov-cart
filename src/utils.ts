export function escHtml(str: string | null | undefined): string {
    if (str == null) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function createAttr(prefix: string): (name: string) => string {
    return (name: string) => `data-${prefix}-${name}`
}

export function resolveElement(
    el: string | Element | null | undefined,
): Element | null {
    if (!el) return null
    if (typeof el === 'string') return document.querySelector(el)
    return el
}
