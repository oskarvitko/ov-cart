import type { CartClasses, CartText } from './types'

export const DEFAULT_CLASSES: Required<CartClasses> = {
    list: 'flex flex-col divide-y divide-gray-200',
    item: 'flex items-center gap-3 py-3',
    itemInner: 'flex grow items-center gap-3',
    itemContent: 'flex grow flex-col gap-0.5',
    itemTitle: 'text-sm font-semibold text-gray-900 leading-snug',
    itemDescription: 'flex flex-col gap-px text-xs text-slate-400',
    itemImage: 'size-12 shrink-0 rounded object-cover bg-gray-100',
    itemPriceBox:
        'shrink-0 w-20 text-right text-sm font-semibold text-gray-700',
    itemPriceHidden: 'hidden',
    controls: 'flex shrink-0 items-center gap-2',
    countButton:
        'flex size-7 cursor-pointer items-center justify-center rounded border border-gray-300 bg-white text-sm font-semibold text-gray-500 select-none hover:border-gray-500 hover:text-gray-800 transition-colors',
    countSpan: 'w-5 text-center text-sm text-gray-800',
    removeButton:
        'shrink-0 cursor-pointer text-gray-300 hover:text-gray-500 transition-colors text-base leading-none px-1',
    footer: 'flex items-center justify-end gap-3 border-t border-gray-200 pt-3 mt-1 text-sm font-semibold text-gray-800',
    iconHidden: 'hidden',
    iconSumVisible: 'opacity-100',
    groupLabel: 'pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400',
}

export const DEFAULT_TEXT: Required<CartText> = {
    sumLabel: 'Total:',
    orderInputName: 'order-sum',
    addButton: '+',
    removeButton: '−',
    clearButton: '✕',
}
