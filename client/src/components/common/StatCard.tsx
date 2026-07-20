import { Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <StackRow icon={icon}>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>
            {value}
          </Typography>
          {hint ? (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          ) : null}
        </StackRow>
      </CardContent>
    </Card>
  );
}

function StackRow({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  if (!icon) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ marginTop: 4, opacity: 0.8 }}>{icon}</div>
      <div>{children}</div>
    </div>
  );
}
