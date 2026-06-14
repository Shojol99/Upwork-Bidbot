import React, { useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, FileText, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastProposal, setLastProposal] = useState<string | null>(null);

  const { data: trainingData } = useQuery({
    queryKey: ['trainingData'],
    queryFn: () => firestoreService.getTrainingData(),
  });

  const { data: generatedBids } = useQuery({
    queryKey: ['generatedBids'],
    queryFn: () => firestoreService.getGeneratedBids(),
  });

  const { data: settings } = useQuery({
    queryKey: ['aiSettings'],
    queryFn: () => firestoreService.getAISettings(),
  });

  const { data: blockedKeywords } = useQuery({
    queryKey: ['blockedKeywords'],
    queryFn: () => firestoreService.getBlockedKeywords(),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          trainingData,
          generatedBids,
          settings,
          blockedKeywords,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate');
      return response.json();
    },
    onSuccess: (data) => {
      setLastProposal(data.proposal);
      setIsGenerating(false);
      // Save to history
      firestoreService.addGeneratedBid({
        jobTitle: "New Job", // Ideally extract from JD
        jobDescription,
        generatedContent: data.proposal,
        status: 'pending',
        score: data.score,
        createdAt: Date.now(),
      });

      // Special learning: If the score is very high, we could optionally auto-add to training base
      // but for now we rely on the server merging history into RAG context.
      
      queryClient.invalidateQueries({ queryKey: ['generatedBids'] });
    },
    onError: () => setIsGenerating(false),
  });

  const handleCopy = () => {
    if (lastProposal) {
      navigator.clipboard.writeText(lastProposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Bid Generator</h2>
        <p className="text-muted-foreground">Paste an Upwork job description below to generate a hyper-personalized proposal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
        {/* Left: Input */}
        <div className="space-y-4 flex flex-col">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Job Description</label>
          <div className="relative flex-1 group">
            <textarea
              className="w-full h-full p-6 bg-card border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm leading-relaxed"
              placeholder="Paste the full job post details here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            {jobDescription && (
              <button
                onClick={() => generateMutation.mutate()}
                disabled={isGenerating}
                className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                Generate Proposal
              </button>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Proposal</label>
            {lastProposal && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-muted/20 border rounded-2xl overflow-y-auto p-8 relative">
            <AnimatePresence mode="wait">
              {lastProposal ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={lastProposal}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  <ReactMarkdown>{lastProposal}</ReactMarkdown>
                </motion.div>
              ) : isGenerating ? (
                <div className="h-full flex items-center justify-center flex-col gap-4">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse font-mono">Analyzing previous winning bids...</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="bg-muted p-4 rounded-full inline-block">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      Your generated proposal will appear here.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
