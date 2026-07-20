import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { formatDate } from '@/utils/format';
import type { Certificate } from '@/types/certificate.types';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const verifyUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <VerifiedOutlinedIcon color="primary" />
            <Typography variant="overline" color="text.secondary">
              Certificate
            </Typography>
          </Stack>

          <Typography variant="h6">{certificate.eventTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            {certificate.clubName ?? 'Club event'} · {formatDate(certificate.eventDate)}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            #{certificate.certificateNumber}
          </Typography>

          <Chip
            size="small"
            label={certificate.status}
            color={certificate.status === 'issued' ? 'success' : 'error'}
            sx={{ alignSelf: 'flex-start' }}
          />

          <Stack direction="row" spacing={1}>
            {certificate.fileUrl ? (
              <Button href={certificate.fileUrl} target="_blank" rel="noreferrer" size="small">
                Download
              </Button>
            ) : null}
            <Button href={verifyUrl} target="_blank" rel="noreferrer" size="small" variant="outlined">
              Verify
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
