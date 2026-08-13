import { PolicyExplorerPage } from '@/screens/policies';

type PoliciesPageProps = {
  searchParams?: Promise<{
    search?: string | string[];
  }>;
};

export default async function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const params = await searchParams;
  const search = Array.isArray(params?.search) ? params.search[0] : params?.search;

  return <PolicyExplorerPage initialSearch={search} />;
}
