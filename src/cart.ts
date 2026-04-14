import { DEFAULT_CLASSES, DEFAULT_TEXT } from './defaults'
import { initButtons } from './dom'
import type {
    CartClasses,
    CartOptions,
    CartProduct,
    CartProductEntry,
    CartState,
    CartText,
    ResolvedOptions,
} from './types'
import { createAttr, escHtml, resolveElement } from './utils'

export type {
    CartClasses,
    CartOptions,
    CartProduct,
    CartProductEntry,
    CartState,
    CartText,
} from './types'

export class Cart {
    private options: ResolvedOptions
    private classes: Required<CartClasses>
    private text: Required<CartText>
    attr: (name: string) => string
    private products: Record<string, CartProduct>
    private productsCount: Record<string, number>
    private trigger: Element | null
    private node: Element | null
    private icon: Element | null

    constructor(options: CartOptions = {}) {
        this.options = {
            element: '#cart',
            icon: '#cart-icon',
            currency: '$',
            storageKey: 'cart',
            attr: 'cart',
            shouldAnimateIconSum: () => true,
            renderItem: null,
            renderFooter: null,
            onUpdate: null,
            validateCart: null,
            productTypes: null,
            classes: {},
            text: {},
            ...options,
        }

        this.classes = { ...DEFAULT_CLASSES, ...this.options.classes }
        this.text = { ...DEFAULT_TEXT, ...this.options.text }
        this.attr = createAttr(this.options.attr)
        this.products = {}
        this.productsCount = {}
        this.trigger = null

        const stored = localStorage.getItem(this.options.storageKey)
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as {
                    products?: Record<string, CartProduct>
                    productsCount?: Record<string, number>
                }
                this.products = parsed.products ?? {}
                this.productsCount = parsed.productsCount ?? {}

                if (this.options.validateCart) {
                    const entries: CartProductEntry[] = Object.entries(
                        this.products,
                    ).map(([id, product]) => ({ id, ...product }))
                    const validated = this.options.validateCart(entries)
                    const validIds = new Set(validated.map((p) => p.id))
                    this.products = Object.fromEntries(
                        validated.map(({ id, ...product }) => [id, product]),
                    )
                    for (const id of Object.keys(this.productsCount)) {
                        if (!validIds.has(id)) delete this.productsCount[id]
                    }

                    this.store()
                }
            } catch {}
        }

        this.node = resolveElement(this.options.element)
        this.icon = resolveElement(this.options.icon)

        this.render(true)
        initButtons(document, this)
    }

    render(initial = false): void {
        if (!this.node) return

        const { currency } = this.options
        const cls = this.classes
        const { attr } = this

        const totalSum = Object.entries(this.products).reduce(
            (sum, [id, product]) => {
                const count = this.productsCount[id] ?? 0
                return sum + product.price * count
            },
            0,
        )

        const count = Object.values(this.productsCount).reduce(
            (sum, c) => sum + c,
            0,
        )
        const isEmpty = count <= 0
        const state: CartState = {
            products: this.products,
            productsCount: this.productsCount,
            totalSum,
            count,
            isEmpty,
        }

        if (this.icon) {
            const iconSumEl = this.icon.querySelector(`[${attr('icon-sum')}]`)
            const iconCountEl = this.icon.querySelector(
                `[${attr('icon-count')}]`,
            )

            if (isEmpty) {
                this.icon.classList.add(cls.iconHidden)
            } else {
                this.icon.classList.remove(cls.iconHidden)
                if (iconCountEl) iconCountEl.textContent = String(count)
                if (iconSumEl) {
                    const span = iconSumEl.querySelector('span')
                    if (span) span.textContent = String(totalSum)

                    if (
                        !initial &&
                        this.options.shouldAnimateIconSum(state, this.trigger)
                    ) {
                        iconSumEl.classList.add(cls.iconSumVisible)
                        setTimeout(
                            () =>
                                iconSumEl.classList.remove(cls.iconSumVisible),
                            500,
                        )
                    }
                }
            }
        }

        const renderItem =
            this.options.renderItem ?? this._defaultRenderItem.bind(this)
        const renderFooter =
            this.options.renderFooter ?? this._defaultRenderFooter.bind(this)

        const itemsHtml = this._buildItemsHtml(renderItem, currency)

        this.node.innerHTML = `
            <ul class="${cls.list}">
                ${itemsHtml}
            </ul>
            ${renderFooter(totalSum, currency)}
        `

        initButtons(this.node, this)

        if (this.options.onUpdate) {
            this.options.onUpdate(state)
        }
    }

    private _buildItemsHtml(
        renderItem: (id: string, product: CartProduct, count: number, currency: string) => string,
        currency: string,
    ): string {
        const { productTypes } = this.options
        const cls = this.classes

        const activeEntries = Object.entries(this.products).filter(
            ([id]) => (this.productsCount[id] ?? 0) > 0,
        )

        if (!productTypes) {
            return activeEntries
                .map(([id, product]) =>
                    renderItem(id, product, this.productsCount[id]!, currency),
                )
                .join('')
        }

        const groups = new Map<string | null, Array<[string, CartProduct]>>()
        for (const [id, product] of activeEntries) {
            const key = product.type && productTypes[product.type] !== undefined ? product.type : null
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push([id, product])
        }

        let html = ''
        for (const [typeKey, label] of Object.entries(productTypes)) {
            const items = groups.get(typeKey)
            if (!items?.length) continue
            html += `<li class="${cls.groupLabel}">${escHtml(label)}</li>`
            html += items
                .map(([id, product]) =>
                    renderItem(id, product, this.productsCount[id]!, currency),
                )
                .join('')
        }

        const ungrouped = groups.get(null)
        if (ungrouped?.length) {
            html += ungrouped
                .map(([id, product]) =>
                    renderItem(id, product, this.productsCount[id]!, currency),
                )
                .join('')
        }

        return html
    }

    private _defaultRenderItem(
        id: string,
        product: CartProduct,
        count: number,
        currency: string,
    ): string {
        const cls = this.classes
        const txt = this.text
        const { attr } = this
        const productSum = product.price * count
        const descriptionLines =
            product.description?.split(/\n|\\n/).filter(Boolean) ?? []
        const inputName = product.params
            ? `${product.title} ${product.params}`
            : product.title

        return `
            <li ${attr('item')}="${escHtml(id)}" class="${cls.item}">
                <input type="hidden" name="${escHtml(inputName)}" value="${product.price}x${count}=${productSum}" />
                ${product.image ? `<img src="${escHtml(product.image)}" alt="${escHtml(product.title)}" class="${cls.itemImage}" />` : ''}
                <div class="${cls.itemInner}">
                    <div class="${cls.itemContent}">
                        <h6 class="${cls.itemTitle}" ${attr('item-title')}="self">
                            ${escHtml(product.title)}
                        </h6>
                        <ul class="${cls.itemDescription}">
                            ${descriptionLines.map((line) => `<li>${escHtml(line)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="${cls.controls}">
                        <button type="button" ${attr('action')}="remove" class="${cls.countButton}">${escHtml(txt.removeButton)}</button>
                        <span class="${cls.countSpan}">${count}</span>
                        <button type="button" ${attr('action')}="add" class="${cls.countButton}">${escHtml(txt.addButton)}</button>
                        <div class="${cls.itemPriceBox}">
                            <span class="${cls.itemPriceHidden}" ${attr('item-price')}="${product.price}"></span>
                            ${productSum} ${escHtml(currency)}
                        </div>
                    </div>
                </div>
                <button ${attr('action')}="clear" type="button" class="${cls.removeButton}">${escHtml(txt.clearButton)}</button>
            </li>
        `
    }

    private _defaultRenderFooter(total: number, currency: string): string {
        const cls = this.classes
        const txt = this.text
        return `
            <div class="${cls.footer}">
                <span>${escHtml(txt.sumLabel)}</span>
                <input type="hidden" name="${escHtml(txt.orderInputName)}" value="${total}" />
                <span>${total} ${escHtml(currency)}</span>
            </div>
        `
    }

    store(): void {
        localStorage.setItem(
            this.options.storageKey,
            JSON.stringify({
                products: this.products,
                productsCount: this.productsCount,
            }),
        )
    }

    register(
        id: string,
        product: Omit<CartProduct, 'price'> & { price: string | number },
    ): void {
        if (!this.products[id]) {
            this.products[id] = { ...product, price: Number(product.price) }
        }
    }

    add(id: string, trigger?: Element | null): void {
        this.trigger = trigger ?? null
        this.increase(id)
        this.render()
        this.store()
    }

    remove(id: string, trigger?: Element | null): void {
        this.trigger = trigger ?? null
        this.decrease(id)
        this.render()
        this.store()
    }

    clear(id?: string | null, trigger?: Element | null): void {
        this.trigger = trigger ?? null
        if (id) {
            this.productsCount[id] = 0
        } else {
            this.products = {}
            this.productsCount = {}
        }
        this.render()
        this.store()
    }

    increase(id: string): void {
        this.productsCount[id] = (this.productsCount[id] ?? 0) + 1
    }

    decrease(id: string): void {
        this.productsCount[id] = Math.max(0, (this.productsCount[id] ?? 1) - 1)
    }
}

export function createCart(options: CartOptions = {}): Cart {
    return new Cart(options)
}
