 // MOCK Shopify service – real API calls will replace this.
export interface ShopifyProduct {
  id: string;
  title: string;
  vendor?: string;
}
class ShopifyService {
  async listProducts(): Promise<ShopifyProduct[]> {
    return [
      { id: '1', title: 'Demo Product A', vendor: 'DemoVendor' },
      { id: '2', title: 'Demo Product B', vendor: 'DemoVendor' }
    ];
  }
}
export default new ShopifyService();
