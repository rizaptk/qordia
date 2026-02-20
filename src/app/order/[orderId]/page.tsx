
import { redirect } from 'next/navigation';

// This is a legacy URL. Redirect to the new multi-tenant URL structure.
const DEFAULT_TENANT_ID = 'qordiapro-tenant';

export default function DeprecatedOrderPage({ params }: { params: { orderId: string } }) {
  redirect(`/${DEFAULT_TENANT_ID}/order/${params.orderId}`);
}
