import React, { useState, useEffect, useRef } from 'react';
import { QuerySchema } from '../schemas';
import { api } from '../lib/api';
import SynthesisResult from './SynthesisResult';
import { 
  Send, 
  Sparkles, 
  Globe, 
  ShieldAlert, 
  Loader2, 
  MessageSquareCode, 
  HelpCircle, 
  Layers, 
  CornerDownLeft,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function ChatInterface({ workspaceId, documents = [] }) {
  const [queries, setQueries] = useState([]);
  const [question, setQuestion] = useState('');
  const [includeWebSearch, setIncludeWebSearch] = useState(false);
  const [strictCitationsOnly, setStrictCitationsOnly] = useState(true);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch past query history for this workspace
  useEffect(() => {
    let mounted = true;
    async function loadQueries() {
      try {
        setLoadingHistory(true);
        const res = await api.listQueries(workspaceId);
        if (mounted && res.queries) {
          setQueries(res.queries);
        }
      } catch (err) {
        console.error('Failed to load queries history:', err);
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    }
    loadQueries();
    return () => { mounted = false; };
  }, [workspaceId]);

  // Auto-scroll to bottom of queries list when updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queries, isSynthesizing]);

  // Auto-expand textarea height
  const handleTextareaChange = (e) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
    }
  };

  const handleSubmitQuery = async (customQuestion) => {
    const q = customQuestion || question;
    setError(null);

    // Validate with Zod
    const validation = QuerySchema.safeParse({
      workspaceId,
      question: q,
      includeWebSearch,
      strictCitationsOnly
    });

    if (!validation.success) {
      const issues = validation.error.flatten().fieldErrors;
      setError(issues.question?.[0] || 'Please provide a valid question (at least 10 characters)');
      return;
    }

    if (documents.length === 0) {
      setError('Cannot synthesize answer: No documents have been ingested into this workspace. Please upload research documents first.');
      return;
    }

    setIsSynthesizing(true);
    setStatusMessage('Querying workspace corpus...');

    const step1 = setTimeout(() => {
      setStatusMessage('Analyzing cross-document evidence & extracting key facts...');
    }, 1000);

    const step2 = setTimeout(() => {
      setStatusMessage('Validating citations & formatting markdown synthesis with Gemini...');
    }, 2200);

    try {
      const res = await api.submitQuery({
        workspaceId,
        question: q,
        includeWebSearch,
        strictCitationsOnly
      });

      clearTimeout(step1);
      clearTimeout(step2);

      if (res.query) {
        setQueries((prev) => [...prev, res.query]);
        setQuestion('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (err) {
      console.error('Synthesis error:', err);
      setError(err.message || 'Failed to synthesize query response');
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      setIsSynthesizing(false);
      setStatusMessage('');
    }
  };

  const suggestions = [
    "What are the central methodologies and experimental results across the corpus?",
    "Identify any conflicting claims, contradictions, or divergences between the sources.",
    "Synthesize an executive briefing highlighting key opportunities, risks, and next steps."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-card/60 backdrop-blur-md rounded-3xl border border-border/70 overflow-hidden shadow-2xl">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
        {/* Welcome / Empty state */}
        {queries.length === 0 && !isSynthesizing && (
          <div className="max-w-2xl mx-auto py-10 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-primary-foreground mx-auto mb-4 shadow-lg shadow-primary/20">
              <MessageSquareCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Deep Cross-Document Synthesis</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Ask comprehensive research questions across your <strong className="text-primary font-semibold">{documents.length}</strong> ingested sources. 
              The Gemini engine synthesizes evidence-backed answers with strict traceability to eliminate hallucinations.
            </p>

            {/* Quick Suggestions */}
            <div className="text-left space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Inquiries
              </span>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(s);
                      handleSubmitQuery(s);
                    }}
                    className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-all text-left flex items-center justify-between group shadow-sm hover:shadow"
                  >
                    <span>{s}</span>
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Queries History */}
        {queries.map((q) => (
          <div key={q.id} className="space-y-4 max-w-4xl mx-auto">
            {/* User Question Bubble */}
            <div className="flex justify-end">
              <div className="max-w-2xl bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
                <p className="font-medium">{q.question}</p>
                <div className="text-[10px] text-primary-foreground/80 mt-1.5 font-mono flex items-center justify-end space-x-1">
                  <span>{new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* AI Synthesized Answer Card */}
            <SynthesisResult
              workspaceId={workspaceId}
              answer={q.answer}
              citations={q.citations || []}
              citationDetails={q.citation_details || []}
              question={q.question}
              timestamp={q.created_at}
            />
          </div>
        ))}

        {/* Active Synthesizing Spinner */}
        {isSynthesizing && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in">
            <div className="flex justify-end">
              <div className="max-w-2xl bg-primary/90 text-primary-foreground p-4 rounded-2xl rounded-tr-sm text-sm">
                <p className="font-medium">{question}</p>
              </div>
            </div>

            <Card className="p-6 border-primary/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 animate-pulse" />
              <div className="flex items-center space-x-3 text-primary text-sm">
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                <span className="font-mono text-xs">{statusMessage}</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Toggles Footer */}
      <div className="border-t border-border/60 bg-card/90 p-4 md:p-5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-destructive hover:underline font-bold text-xs ml-2">Dismiss</button>
            </div>
          )}

          {/* Form Controls Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              {/* Strict Citations Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={strictCitationsOnly}
                  onChange={(e) => setStrictCitationsOnly(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring bg-background w-4 h-4 cursor-pointer"
                />
                <span className={`font-medium ${strictCitationsOnly ? 'text-primary' : 'text-muted-foreground'}`}>
                  Strict Citations Only
                </span>
              </label>

              {/* Include Web Search Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring bg-background w-4 h-4 cursor-pointer"
                />
                <span className={`flex items-center space-x-1 font-medium ${includeWebSearch ? 'text-cyan-500 dark:text-cyan-400' : 'text-muted-foreground'}`}>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Include Web Search</span>
                </span>
              </label>
            </div>

            <div className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">Enter</kbd> to synthesize, <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">Shift+Enter</kbd> for newline
            </div>
          </div>

          {/* Input Box */}
          <div className="relative flex items-end bg-background border border-border/80 rounded-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all p-2 shadow-sm">
            <textarea
              ref={textareaRef}
              rows={2}
              value={question}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a synthesis question across the workspace documents (e.g. Compare the methodologies of paper A and paper B)..."
              className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 leading-relaxed max-h-60"
            />
            <Button
              onClick={() => handleSubmitQuery()}
              disabled={isSynthesizing || question.trim().length < 10}
              size="icon"
              className="h-10 w-10 shrink-0 shadow-md shadow-primary/20"
              title="Synthesize Answer"
            >
              {isSynthesizing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
