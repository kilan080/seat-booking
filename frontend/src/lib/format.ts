const CURRENCY = "NGN";

const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: CURRENCY,
});

export function formatPrice(priceCents: number): string {
    return formatter.format( priceCents / 100 );
}