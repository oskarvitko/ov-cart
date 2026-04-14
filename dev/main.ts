import './style.css'
import { createCart } from '../src/index'

createCart({
    element: '#cart',
    icon: '#cart-icon',
    currency: '$',
    storageKey: 'dev-cart',
    productTypes: {
        greenhouse: 'Greenhouses',
        accessories: 'Accessories',
    },
    onUpdate(state) {
        console.log('cart updated', state)
    },
})
