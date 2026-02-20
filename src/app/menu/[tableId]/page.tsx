
import { redirect } from 'next/navigation';

// This is a legacy URL. Redirect to the new multi-tenant URL structure.
const DEFAULT_TENANT_ID = 'qordiapro-tenant';

export default function DeprecatedMenuPage({ params }: { params: { tableId: string } }) {
  redirect(`/${DEFAULT_TENANT_ID}/menu/${params.tableId}`);
}
