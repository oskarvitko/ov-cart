export interface CartProduct {
    title: string
    price: number
    image: string | null
    description: string | null
    params: string | null
    type: string | null
}

export type CartProductEntry = CartProduct & { id: string }

export interface CartState {
    products: Record<string, CartProduct>
    productsCount: Record<string, number>
    totalSum: number
    count: number
    isEmpty: boolean
}

export interface ActionState extends CartState {
    id: string | null
}

export interface CartClasses {
    list?: string
    item?: string
    itemInner?: string
    itemContent?: string
    itemTitle?: string
    itemDescription?: string
    itemImage?: string
    itemPriceBox?: string
    itemPriceHidden?: string
    controls?: string
    countButton?: string
    countSpan?: string
    removeButton?: string
    footer?: string
    iconHidden?: string
    iconSumVisible?: string
    groupLabel?: string
}

export interface CartText {
    sumLabel?: string
    orderInputName?: string
    addButton?: string
    removeButton?: string
    clearButton?: string
}

export interface CartOptions {
    element?: string | Element
    icon?: string | Element | null
    currency?: string
    storageKey?: string
    attr?: string
    shouldAnimateIconSum?: (
        state: CartState,
        trigger: Element | null,
    ) => boolean
    renderItem?: (
        id: string,
        product: CartProduct,
        count: number,
        currency: string,
    ) => string
    renderFooter?: (total: number, currency: string) => string
    onUpdate?: (state: ActionState) => void
    validateCart?: (products: CartProductEntry[]) => CartProductEntry[]
    productTypes?: Record<string, string>
    classes?: CartClasses
    text?: CartText
}

export type ResolvedOptions = {
    element: string | Element
    icon: string | Element | null
    currency: string
    storageKey: string
    attr: string
    shouldAnimateIconSum: (state: CartState, trigger: Element | null) => boolean
    renderItem:
        | ((
              id: string,
              product: CartProduct,
              count: number,
              currency: string,
          ) => string)
        | null
    renderFooter: ((total: number, currency: string) => string) | null
    onUpdate: ((state: ActionState) => void) | null
    validateCart: ((products: CartProductEntry[]) => CartProductEntry[]) | null
    productTypes: Record<string, string> | null
    classes: CartClasses
    text: CartText
}
