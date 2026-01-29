import { ArrowUpTray } from '@medusajs/icons';

export const mercurConnectItems = [
  {
    name: 'Product Importer',
    description:
      'Quickly add products to your store by uploading CSV files, making catalog management fast and efficient.',
    enabled: false,
    icon: <ArrowUpTray />,
    provider: 'csv'
  },
  {
    name: 'Shopify Connector',
    description:
      'Connect your Shopify store to seamlessly sync products, stock levels, prices, and orders in real time.',
    enabled: false,
    icon: 'https://www.citypng.com/public/uploads/preview/shopify-bag-icon-symbol-logo-701751695132537nenecmhs0u.png',
    provider: 'shopify'
  }
];
