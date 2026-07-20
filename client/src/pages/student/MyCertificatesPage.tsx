import { Alert, Grid, Pagination, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { listMyCertificates } from '@/api/certificates.api';
import { CertificateCard } from '@/components/student/CertificateCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingBox } from '@/components/common/LoadingBox';
import { PageHeader } from '@/components/common/PageHeader';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { Certificate } from '@/types/certificate.types';

export function MyCertificatesPage() {
  const collegeSlug = useCollegeSlug();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCertificates(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listMyCertificates(collegeSlug, { page, limit: 9 });

        if (cancelled) return;

        setCertificates(result.items);
        setTotalPages(result.meta.totalPages);
      } catch {
        if (!cancelled) {
          setError('Could not load your certificates.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCertificates();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, page]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="My certificates"
        subtitle="Certificates earned from attended events"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <LoadingBox />
      ) : certificates.length ? (
        <>
          <Grid container spacing={2}>
            {certificates.map((certificate) => (
              <Grid key={certificate.id} size={{ xs: 12, md: 4 }}>
                <CertificateCard certificate={certificate} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center' }}
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No certificates yet"
          description="Attend events and certificates will appear here once issued."
        />
      )}
    </Stack>
  );
}
