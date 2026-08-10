import { PolicyDetailPage } from '@/screens/policies';

type PolicyDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PolicyDetailRoute({ params }: PolicyDetailRouteProps) {
  const { id } = await params;

  return <PolicyDetailPage policyId={id} />;
}
