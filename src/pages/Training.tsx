import React, { useState } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Trophy, Quote, Tag, Search, Filter, Edit3, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { TrainingData } from '../types';
import { cn } from '../lib/utils';
import { EXPERT_PROPOSAL_PRINCIPLES } from '../lib/expertTraining';

const Training = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'principles'>('library');
  const [editId, setEditId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({
    jobTitle: '',
    jobDescription: '',
    coverLetter: '',
    tags: '',
    isWinning: false,
  });

  const { data: trainingData, isLoading } = useQuery({
    queryKey: ['trainingData'],
    queryFn: () => firestoreService.getTrainingData(),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => firestoreService.addTrainingData({
      ...data,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : data.tags,
      createdAt: Date.now(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingData'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => firestoreService.updateTrainingData(id, {
      ...data,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : data.tags,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingData'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => firestoreService.deleteTrainingData(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingData'] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setNewEntry({ jobTitle: '', jobDescription: '', coverLetter: '', tags: '', isWinning: false });
  };

  const startEdit = (item: TrainingData) => {
    setNewEntry({
      jobTitle: item.jobTitle,
      jobDescription: item.jobDescription,
      coverLetter: item.coverLetter,
      tags: item.tags.join(', '),
      isWinning: item.isWinning,
    });
    setEditId(item.id!);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: newEntry });
    } else {
      addMutation.mutate(newEntry);
    }
  };

  const seedMutation = useMutation({
    mutationFn: async () => {
      const expertBids = [
        {
          jobTitle: "Meal Prep E-commerce Website",
          jobDescription: "I am seeking a skilled web developer to create a website for my new meal prep company. The website should include features for online payments and a subscription model, similar to existing meal prep websites. I don't want the website to be too overly complicated hence the lower budget however for the right person i could discuss the budget. The ideal candidate will have experience in e-commerce and subscription-based platforms, ensuring a seamless user experience. The project requires a creative approach to design and functionality, aligning with the brand's vision and target audience. I already have a gym brand/website that i would like to ensure still looks similar in terms of brand/colours etc (www.subtle-studio.co.uk).",
          coverLetter: "Hello Josh, \n\nI have already built a similar website like the one you're looking for (mealprepsundayservice.com). I've reviewed your gym brand website, and I'll implement the same aesthetic for your meal preparations site to ensure brand consistency.\n\nFor this, I recommend the following architecture:\n>> Home\n>> Meal Plans / Shop\n--> Single Meal Product\n>> About\n>> How It Works\n>> FAQ\n>> Contact\n>> Delivery Areas\n\nThe site will feature high-converting functionality:\n>> Online Payments & Subscription Plans\n>> Smooth Cart & Checkout\n>> Customer Accounts (Login/Register)\n\nTo ensure a successful launch, I follow a zero-risk roadmap:\n1. Design unique, modern layouts aligned with Subtle Studio's style.\n2. Optimize for seamless performance across mobile, tablet, and desktop.\n3. Provide 30 days of post-launch support and video instructions for easy maintenance.\n\nI can deliver the full vision within 10 days for $385 USD. Let me know if that sounds like a plan!",
          tags: ["e-commerce", "subscription", "meal-prep", "brand-alignment"],
          isWinning: true,
          createdAt: Date.now() - 5000
        },
        {
          jobTitle: "Logo Animation - Infinite Horizontal Scroll",
          jobDescription: "A horizontal infinite scrolling row of icons/logos moving continuously from left to right. Icons should appear in grayscale normally, but when passing through the center area of the screen they become fully colored. Website logo stays fixed in the center while the animation loops seamlessly. Elementor compatible, smooth infinite loop, responsive, clean modern style.",
          coverLetter: "Continuous infinite loops in Elementor often glitch at the 'seam' if using standard plugins. I've developed a lightweight CSS/JS implementation for this exact center-focus color transition using Intersection Observer or a scroll-percentage trigger. This ensures zero performance lag compared to heavy animation libraries. I can deliver a clean, responsive section that allows you to swap logos easily in the future. Would you like to see a quick sandbox demo of this grayscale-to-color transition?",
          tags: ["animation", "elementor", "javascript", "css-performance"],
          isWinning: true,
          createdAt: Date.now() - 8000
        },
        {
          jobTitle: "Senior React Developer - Fintech App",
          jobDescription: "Looking for a React expert to help us build a complex dashboard for a wealth management platform. Needs experience with D3.js and high-performance data rendering.",
          coverLetter: "High-performance data rendering in wealth management usually bottlenecks at the state reconciliation layer, not just the D3 transitions. I recently solved this for a similar platform by implementing a hybrid Canvas/SVG strategy that handled 10,000+ real-time price updates without dropping frames. I can help you architect a modular system that's both fast and maintainable. Do you have a technical spec or a Figma link for the current dashboard design?",
          tags: ["react", "fintech", "performance", "architecture"],
          isWinning: true,
          createdAt: Date.now() - 10000
        },
        {
          jobTitle: "UI/UX Designer for SaaS Landing Page",
          jobDescription: "We need a modern, high-converting landing page for our new AI tool. Looking for a clean, glassmorphism aesthetic.",
          coverLetter: "Most SaaS landing pages fail because they prioritize 'shiny' visuals over a clear conversion hierarchy. For an AI tool, your biggest hurdle isn't looking good—it's building trust and clarity in under 3 seconds. I've spent the last 2 years perfecting that 'Linear' aesthetic while maintaining 20%+ conversion rates on hero sections. I can share a specific strategy for your CTA placement once I understand your primary user persona. Are you targeting developers or non-technical founders?",
          tags: ["ui-ux", "conversion", "saas", "design-strategy"],
          isWinning: true,
          createdAt: Date.now() - 20000
        },
        {
          jobTitle: "Backend API Optimization - Node.js",
          jobDescription: "Our current API is slow and frequently times out during peak hours. Need an expert to identify and fix performance issues.",
          coverLetter: "API timeouts at scale usually point to unindexed database queries or blocking operations in the event loop—both are squashable within 48 hours. I've rescued production backends from 5-second latencies by setting up proper profiling and offloading heavy tasks to child processes. I can do a deep audit of your current Node.js setup today and identify the top 3 bottlenecks before you lose more customers. Have you already implemented any basic monitoring like New Relic or Datadog?",
          tags: ["nodejs", "optimization", "backend", "scalability"],
          isWinning: true,
          createdAt: Date.now() - 30000
        }
      ];

      for (const bid of expertBids) {
        await firestoreService.addTrainingData(bid);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingData'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-6 border-b pb-4">
        <button 
          onClick={() => setActiveTab('library')}
          className={cn(
            "text-sm font-bold tracking-widest uppercase pb-4 -mb-4 transition-all border-b-2",
            activeTab === 'library' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Training Library
        </button>
        <button 
          onClick={() => setActiveTab('principles')}
          className={cn(
            "text-sm font-bold tracking-widest uppercase pb-4 -mb-4 transition-all border-b-2",
            activeTab === 'principles' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Master Principles
        </button>
      </div>

      {activeTab === 'library' ? (
        <>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">AI Training Library</h2>
              <p className="text-muted-foreground">Train BidBot on your personal writing style and winning patterns.</p>
            </div>
            <div className="flex gap-3">
              {(!trainingData || trainingData.length === 0) && (
                <button
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="px-4 py-2 text-sm font-medium border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Seed Expert Bids
                </button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Training Data
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-card border rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">{editId ? 'Edit Training Example' : 'New Training Example'}</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">Job Title</label>
                    <input
                      type="text"
                      className="w-full bg-muted/30 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newEntry.jobTitle}
                      onChange={e => setNewEntry({ ...newEntry, jobTitle: e.target.value })}
                      placeholder="e.g. Senior React Developer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">Job Description</label>
                    <textarea
                      className="w-full bg-muted/30 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
                      value={newEntry.jobDescription}
                      onChange={e => setNewEntry({ ...newEntry, jobDescription: e.target.value })}
                      placeholder="Paste the original job post..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">Tags (comma separated)</label>
                    <div className="flex items-center gap-2 bg-muted/30 border rounded-lg px-3 py-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        className="flex-1 bg-transparent outline-none"
                        value={newEntry.tags}
                        onChange={e => setNewEntry({ ...newEntry, tags: e.target.value })}
                        placeholder="react, typescript, frontend"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">Your Response (Cover Letter)</label>
                    <textarea
                      className="w-full bg-muted/30 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none h-[220px] resize-none"
                      value={newEntry.coverLetter}
                      onChange={e => setNewEntry({ ...newEntry, coverLetter: e.target.value })}
                      placeholder="Paste your winning cover letter..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={newEntry.isWinning}
                        onChange={e => setNewEntry({ ...newEntry, isWinning: e.target.checked })}
                      />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">Mark as Winning Proposal</span>
                    </label>
                    <div className="flex gap-3">
                      <button onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-all">Cancel</button>
                      <button
                        onClick={handleSave}
                        disabled={addMutation.isPending || updateMutation.isPending}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        {editId ? 'Update Entry' : 'Save Entry'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">Loading training library...</div>
            ) : trainingData?.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-muted/20 border border-dashed rounded-2xl">
                <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Your training library is empty. Add your best bids to get started.</p>
              </div>
            ) : (
              trainingData?.map((data) => (
                <div key={data.id} className="bg-card border rounded-2xl p-6 space-y-4 group hover:border-primary/50 transition-all relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold pr-16">{data.jobTitle || 'Untitled Project'}</h4>
                      <p className="text-xs text-muted-foreground">{format(data.createdAt, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {data.isWinning && (
                        <div className="bg-yellow-500/10 text-yellow-500 p-1.5 rounded-full" title="Winning Entry">
                          <Trophy className="h-4 w-4 fill-current" />
                        </div>
                      )}
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(data)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                          title="Edit Entry"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(data.id!)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">Target Job</span>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{data.jobDescription}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary/60 tracking-widest">Saved Bid</span>
                      <p className="text-sm font-medium line-clamp-3 leading-relaxed bg-muted/30 p-3 rounded-lg border border-dashed italic">
                        "{data.coverLetter}"
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {Array.isArray(data.tags) && data.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted rounded-md text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                    {(!data.tags || data.tags.length === 0) && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-muted/50 rounded-md text-muted-foreground/40 italic">
                        No tags
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="bg-card border rounded-3xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Elite Training Intelligence</h3>
              <p className="text-sm text-muted-foreground">These core principles guide BidBot's internal decision-making process for every generation.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Psychology Training
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground pl-3.5 border-l-2 border-muted">
                  Focus on solving problems, reducing risk, and business results. Avoid life stories and generic experience dumps.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Hook Intelligence
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground pl-3.5 border-l-2 border-muted">
                  The first 2 lines determine success. Reference the project immediately, identify a major challenge, and sound authoritative.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Trust Building
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground pl-3.5 border-l-2 border-muted">
                  Explain solutions simply to build credibility. Use "I'd likely..." or "I understand that..." to show collaborative expertise.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 font-mono text-[10px] overflow-auto max-h-[400px] border">
              <div className="mb-4 flex items-center justify-between">
                <span className="uppercase text-[10px] font-bold text-muted-foreground">Raw Training Manifest</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-bold">ACTIVE</span>
              </div>
              <pre className="whitespace-pre-wrap">{EXPERT_PROPOSAL_PRINCIPLES.trim()}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
