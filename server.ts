import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { EXPERT_PROPOSAL_PRINCIPLES } from './src/lib/expertTraining';

dotenv.config();

let genAI: GoogleGenerativeAI | null = null;
let openai: OpenAI | null = null;

async function startServer() {
  console.log('Starting server initialization...');
  
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      genAI = new GoogleGenerativeAI(geminiKey);
      console.log('Gemini AI initialized');
    } catch (e) {
      console.error('Failed to initialize Gemini:', e);
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      openai = new OpenAI({ apiKey: openaiKey });
      console.log('OpenAI initialized');
    } catch (e) {
      console.error('Failed to initialize OpenAI:', e);
    }
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Proposal Generation Endpoint
  app.post('/api/generate-proposal', async (req, res) => {
    try {
      const { jobDescription, trainingData, generatedBids, settings, blockedKeywords } = req.body;
      
      const geminiKey = process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!geminiKey && !openaiKey) {
        return res.status(400).json({ error: 'No AI API Key found (Gemini or OpenAI). Please set one in environment variables.' });
      }

      // RAG Logic
      const combinedLibrary = [
        ...(trainingData || []),
        ...(generatedBids || [])
          .filter((gb: any) => gb.status === 'won')
          .map((gb: any) => ({
            jobTitle: gb.jobTitle,
            jobDescription: gb.jobDescription,
            coverLetter: gb.generatedContent,
            isWinning: true
          }))
      ];

      const relevantSamples = combinedLibrary
        .filter((item: any) => {
          const keywords = item.jobTitle?.split(' ') || [];
          return keywords.some((k: string) => jobDescription.toLowerCase().includes(k.toLowerCase()));
        })
        .slice(0, 5);

      const systemPrompt = `
        ${EXPERT_PROPOSAL_PRINCIPLES}

        ## ACTIVE FREELANCER CUSTOMIZATION
        - Persona: ${settings?.persona || 'Elite Freelancer'}
        - Tone: ${settings?.tone || 'Authoritative & Practical'}
        - Confidence: ${settings?.confidence || 'High'}
        - Desired Greeting: ${settings?.greetingStyle || 'Professional but personal'}

        ## HISTORICAL WINNING CONTEXT (RAG)
        Use these as reference for style and structural rhythm, but DO NOT copy them if they don't apply:
        ${relevantSamples.map((s: any) => `JOB DESCRIPTION: ${s.jobDescription}\nWINNING PROPOSAL: ${s.coverLetter}`).join('\n---\n')}

        ## NEGATIVE CONSTRAINTS (NEVER DO THESE)
        - Blocked phrases: ${(blockedKeywords || []).map((k: any) => k.phrase).join(', ')}
        - No fluff about "working hard" or "passionate developer".
        - No AI-typical sentence structures (e.g. "Firstly...", "Moreover...", "In conclusion...").

        ## TASK
        Generate a conversion-optimized cover letter for this job post. 
        Focus on the "Hook" and "Authority" rules from the training manifest.
        
        JOB POST:
        ${jobDescription}

        OUTPUT FORMAT:
        Return only the final cover letter text. No preamble or meta-commentary.
      `;

      let proposal = '';

      if (openaiKey) {
        if (!openai) openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Generate proposal for: ${jobDescription}` }],
          temperature: 0.7,
        });
        proposal = response.choices[0].message.content || '';
      } else if (geminiKey) {
        if (!genAI) genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(systemPrompt);
        proposal = result.response.text();
      }

      // Simple heuristic score based on the principles
      const hasHook = proposal.length > 50 && !proposal.toLowerCase().includes('dear');
      const hasBulletPoints = proposal.includes('>>') || proposal.includes('-') || proposal.includes('*');
      const lengthScore = proposal.split(' ').length > 100 ? 10 : 0;
      
      const score = 75 + (hasHook ? 10 : 0) + (hasBulletPoints ? 10 : 0) + (lengthScore > 0 ? 5 : 0);

      res.json({ proposal, score: Math.min(score, 98) });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: 'Failed to generate proposal' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
