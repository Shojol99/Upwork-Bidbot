import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firestoreService } from '../lib/firestoreService';
import { format } from 'date-fns';
import { Trophy, XCircle, Clock, ExternalLink, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GeneratedBid } from '../types';

const History = () => {
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery({
    queryKey: ['generatedBids'],
    queryFn: () => firestoreService.getGeneratedBids(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'won' | 'lost' | 'pending' }) => {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      return await updateDoc(doc(db, 'generated_bids', id), { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['generatedBids'] }),
  });

  const stats = bids?.reduce(
    (acc, bid) => {
      acc.total++;
      if (bid.status === 'won') acc.won++;
      if (bid.status === 'lost') acc.lost++;
      return acc;
    },
    { total: 0, won: 0, lost: 0 }
  ) || { total: 0, won: 0, lost: 0 };

  const winRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Proposal History</h2>
          <p className="text-muted-foreground">Monitor performance and train BidBot on your win rate.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Bids" value={stats.total} icon={Clock} color="text-blue-500" />
        <StatCard label="Won" value={stats.won} icon={Trophy} color="text-yellow-500" />
        <StatCard label="Lost" value={stats.lost} icon={XCircle} color="text-red-500" />
        <StatCard label="Win Rate" value={`${winRate}%`} icon={BarChart3} color="text-green-500" />
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-b">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Job Info</th>
                <th className="px-6 py-4">Generated On</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">Loading history...</td>
                </tr>
              ) : bids?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground h-64 italic">No proposals generated yet.</td>
                </tr>
              ) : (
                bids?.map((bid: GeneratedBid) => (
                  <tr key={bid.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={bid.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-sm truncate">{bid.jobTitle}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{bid.jobDescription}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {format(bid.createdAt, 'MMM d, p')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[60px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${bid.score}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold">{bid.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: bid.id!, status: 'won' })}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            bid.status === 'won' ? "bg-yellow-500 text-white" : "hover:bg-yellow-500/10 text-yellow-500"
                          )}
                          title="Mark as Won"
                        >
                          <Trophy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: bid.id!, status: 'lost' })}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            bid.status === 'lost' ? "bg-red-500 text-white" : "hover:bg-red-500/10 text-red-500"
                          )}
                          title="Mark as Lost"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-card border rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <Icon className={cn("h-4 w-4", color)} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: GeneratedBid['status'] }) => {
  const styles = {
    pending: "bg-blue-500/10 text-blue-500",
    won: "bg-yellow-500/10 text-yellow-500",
    lost: "bg-red-500/10 text-red-500",
  };
  return (
    <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full", styles[status])}>
      {status}
    </span>
  );
};

export default History;
