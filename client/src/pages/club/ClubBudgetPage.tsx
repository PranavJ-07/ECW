import {
  Alert,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listBudgetExpenses, listClubBudgets } from '@/api/budgets.api';
import { LoadingBox } from '@/components/common/LoadingBox';
import { StatCard } from '@/components/common/StatCard';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import type { BudgetSummary, Expense } from '@/types/budget.types';
import { formatCents } from '@/utils/money';
import { EmptyState } from '@/components/common/EmptyState';

export function ClubBudgetPage() {
  const { clubSlug = '' } = useParams();
  const collegeSlug = useCollegeSlug();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const budgetResult = await listClubBudgets(collegeSlug, clubSlug);
        if (cancelled) return;

        setBudgets(budgetResult.items);

        const activeBudget = budgetResult.items.find((budget) => budget.status === 'active');
        if (activeBudget) {
          const expenseResult = await listBudgetExpenses(collegeSlug, clubSlug, activeBudget.id);
          if (!cancelled) setExpenses(expenseResult.items);
        }
      } catch {
        if (!cancelled) setError('Could not load club budget data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, clubSlug]);

  if (loading) return <LoadingBox />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const activeBudget = budgets.find((budget) => budget.status === 'active') ?? budgets[0];
  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmountCents, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.totalSpentCents, 0);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total allocated" value={formatCents(totalAllocated)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total spent" value={formatCents(totalSpent)} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label="Active budgets"
            value={budgets.filter((budget) => budget.status === 'active').length}
          />
        </Grid>
      </Grid>

      {budgets.length ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Budget</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Allocated</TableCell>
                <TableCell>Spent</TableCell>
                <TableCell>Remaining</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id} hover>
                  <TableCell>{budget.name}</TableCell>
                  <TableCell>{budget.fiscalYear}</TableCell>
                  <TableCell>{formatCents(budget.allocatedAmountCents, budget.currency)}</TableCell>
                  <TableCell>{formatCents(budget.totalSpentCents, budget.currency)}</TableCell>
                  <TableCell>{formatCents(budget.remainingCents, budget.currency)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={budget.status} variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState
          title="No budgets yet"
          description="Budgets are created by club treasurers or college admins."
        />
      )}

      {activeBudget && expenses.length ? (
        <Stack spacing={1}>
          <Typography variant="h6">Recent expenses — {activeBudget.name}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.slice(0, 10).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{formatCents(expense.amountCents, expense.currency)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      ) : null}
    </Stack>
  );
}
