import type { Cart } from './cart'

export function getItemParam(
    item: Element,
    name: string,
    attr: (name: string) => string,
): string | null {
    const attrName = attr(`item-${name}`)
    const node = item.querySelector(`[${attrName}]`)
    if (!node) return null
    const value = node.getAttribute(attrName)
    return value === 'self' ? (node.textContent?.trim() ?? null) : value
}

export function initButtons(
    parent: Element | Document,
    cartInstance: Cart,
): void {
    const { attr } = cartInstance
    const actionAttr = attr('action')
    const itemAttr = attr('item')
    const handledAttr = attr('handled')

    const buttons = parent.querySelectorAll(`[${actionAttr}]`)
    buttons.forEach((button) => {
        if (button.getAttribute(handledAttr)) return
        button.setAttribute(handledAttr, 'true')
        button.addEventListener('click', (e) => {
            e.preventDefault()
            const itemEl = button.closest(`[${itemAttr}]`)
            if (!itemEl) return

            const id = itemEl.getAttribute(itemAttr)
            const title = getItemParam(itemEl, 'title', attr)
            const price = getItemParam(itemEl, 'price', attr)
            const image = getItemParam(itemEl, 'image', attr)
            const description = getItemParam(itemEl, 'description', attr)
            const params = getItemParam(itemEl, 'params', attr)
            const type = getItemParam(itemEl, 'type', attr)

            if (!id || !title || !price) return
            cartInstance.register(id, {
                title,
                price,
                image,
                params,
                description,
                type,
            })

            switch (button.getAttribute(actionAttr)) {
                case 'add':
                    return cartInstance.add(id, button)
                case 'remove':
                    return cartInstance.remove(id, button)
                case 'clear':
                    return cartInstance.clear(id, button)
            }
        })
    })
}
