import React, { useEffect } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Brain, Sparkles, Volume2, Maximize2, ShieldCheck, User } from 'lucide-react';

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['aiSettings'],
    queryFn: () => firestoreService.getAISettings(),
  });

  const saveMutation = useMutation({
    mutationFn: (newSettings: any) => firestoreService.updateAISettings(newSettings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiSettings'] }),
  });

  const updateSetting = (key: string, value: string) => {
    saveMutation.mutate({ ...settings, [key]: value });
  };

  const options = {
    tone: ['Professional', 'Casual', 'Bold', 'Friendly', 'Direct', 'Technical'],
    length: ['Concise (Quick)', 'Standard', 'Detailed', 'Comprehensive'],
    confidence: ['Humble', 'Confident', 'Expert', 'Aggressive'],
    ctaStyle: ['Question', 'Direct Request', 'Scheduled Call', 'Project First'],
    greetingStyle: ['Formal', 'Casual ("Hi")', 'Minimal (No Greeting)', 'Contextual'],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Personality</h2>
        <p className="text-muted-foreground">Fine-tune how BidBot communicates with your potential clients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Settings */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Response Style
            </h3>
            <div className="space-y-4">
              <SettingSelect
                label="Writing Tone"
                value={settings?.tone || 'Professional'}
                options={options.tone}
                onChange={v => updateSetting('tone', v)}
              />
              <SettingSelect
                label="Bid Length"
                value={settings?.length || 'Standard'}
                options={options.length}
                onChange={v => updateSetting('length', v)}
              />
              <SettingSelect
                label="Confidence Level"
                value={settings?.confidence || 'Confident'}
                options={options.confidence}
                onChange={v => updateSetting('confidence', v)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Proposal Structure
            </h3>
            <div className="space-y-4">
              <SettingSelect
                label="Greeting Style"
                value={settings?.greetingStyle || 'Casual'}
                options={options.greetingStyle}
                onChange={v => updateSetting('greetingStyle', v)}
              />
              <SettingSelect
                label="Call to Action"
                value={settings?.ctaStyle || 'Question'}
                options={options.ctaStyle}
                onChange={v => updateSetting('ctaStyle', v)}
              />
            </div>
          </section>
        </div>

        {/* Persona Textarea */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Freelancer Persona
          </h3>
          <div className="bg-card border rounded-2xl p-6 space-y-4 flex flex-col h-[calc(100%-40px)]">
            <p className="text-xs text-muted-foreground">
              Describe your background and expertise in third person. This will be injected into every generation.
            </p>
            <textarea
              className="flex-1 w-full bg-muted/30 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="e.g. A Senior React Developer with 8 years of experience in FinTech and UI/UX design..."
              value={settings?.persona || ''}
              onChange={e => updateSetting('persona', e.target.value)}
            />
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="h-3 w-3" />
              Stored Securely in Firebase
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingSelect = ({ label, value, options, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold px-1">{label}</label>
    <select
      className="w-full bg-card border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer hover:bg-muted/30 transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default Settings;
