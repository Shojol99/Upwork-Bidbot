import React, { useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Trash2, Plus, Ban, AlertCircle } from 'lucide-react';

const BlockedKeywords = () => {
  const queryClient = useQueryClient();
  const [newPhrase, setNewPhrase] = useState('');

  const { data: keywords, isLoading } = useQuery({
    queryKey: ['blockedKeywords'],
    queryFn: () => firestoreService.getBlockedKeywords(),
  });

  const addMutation = useMutation({
    mutationFn: (phrase: string) => firestoreService.addBlockedKeyword(phrase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedKeywords'] });
      setNewPhrase('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // firestoreService doesn't have delete, but we can easily call it
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      return await deleteDoc(doc(db, 'blocked_keywords', id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blockedKeywords'] }),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Blocked Phrases</h2>
        <p className="text-muted-foreground">Define specific phrases or words you want the AI to never use in generated proposals.</p>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex gap-4">
        <div className="bg-destructive/10 p-2 rounded-full h-fit mt-1">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h4 className="font-bold text-destructive">Pro Tip: Filter Generic AI Wording</h4>
          <p className="text-sm text-destructive/80 mt-1">
            Upwork clients can easily spot AI. Block phrases like "I am writing to express my interest" or "Dear Hiring Manager" 
            to ensure your bids feel organic and human.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          className="flex-1 bg-card border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
          placeholder="Enter a blocked phrase..."
          value={newPhrase}
          onChange={e => setNewPhrase(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && newPhrase && addMutation.mutate(newPhrase)}
        />
        <button
          onClick={() => newPhrase && addMutation.mutate(newPhrase)}
          className="bg-foreground text-background px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-10 text-center text-muted-foreground">Loading rules...</div>
        ) : keywords?.length === 0 ? (
          <div className="col-span-full py-10 text-center bg-muted/20 border border-dashed rounded-2xl flex flex-col items-center gap-2">
            <Ban className="h-8 w-8 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground font-medium">No blocked phrases yet.</p>
          </div>
        ) : (
          keywords?.map((kw) => (
            <div key={kw.id} className="bg-card border rounded-xl p-4 flex items-center justify-between group hover:border-destructive/30 transition-all">
              <span className="font-medium text-sm">{kw.phrase}</span>
              <button
                onClick={() => deleteMutation.mutate(kw.id!)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all sm:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockedKeywords;
