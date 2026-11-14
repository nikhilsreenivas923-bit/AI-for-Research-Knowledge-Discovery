import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const isSupabaseConfigured = () => {
  return (
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key'
  );
};

// Admin client with service role for server-side management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// In-Memory store fallback for seamless zero-setup local dev / demo testing
// until the user provides active Supabase credentials
class MemoryStore {
  constructor() {
    this.profiles = new Map();
    this.workspaces = new Map();
    this.documents = new Map();
    this.queries = new Map();
    this.initDemoSeed();
  }

  initDemoSeed() {
    const demoUserId = '00000000-0000-4000-a000-000000000001';
    this.profiles.set(demoUserId, {
      id: demoUserId,
      email: 'researcher@researchmind.ai',
      created_at: new Date().toISOString()
    });

    const ws1Id = '11111111-1111-4111-a111-111111111111';
    this.workspaces.set(ws1Id, {
      id: ws1Id,
      user_id: demoUserId,
      name: 'Autonomous Agentic Systems & Reasoning',
      domain: 'Academic',
      description: 'Frontier research on test-time compute, MCTS policy guided generation, and multi-agent coordination frameworks.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    });

    const doc1Id = '22222222-2222-4222-a222-222222222221';
    this.documents.set(doc1Id, {
      id: doc1Id,
      workspace_id: ws1Id,
      title: 'Scaling Laws for Test-Time Compute in Complex Reasoning',
      content: 'Scaling test-time compute allows large language models to allocate additional search and verification FLOPs during inference. Through Monte Carlo Tree Search (MCTS) and process reward models (PRMs), systems demonstrate non-linear performance gains on Olympiad-level mathematics and formal verification benchmarks. Key findings show that dynamic revision loops outperform linear chain-of-thought expansion by 42% on hard reasoning targets.',
      author_or_source: 'Stanford AI Lab & DeepMind (2026)',
      summary: 'Investigates test-time compute scaling via MCTS and process reward models. Demonstrates dynamic revision loops outperform linear chain-of-thought by 42% on complex benchmarks.',
      key_themes: ['Test-Time Compute', 'Process Reward Models (PRMs)', 'MCTS', 'Inference FLOPs'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    });

    const doc2Id = '22222222-2222-4222-a222-222222222222';
    this.documents.set(doc2Id, {
      id: doc2Id,
      workspace_id: ws1Id,
      title: 'Memory Consolidation and Hierarchical Subagent Swarms',
      content: 'Scalable multi-agent coordination requires resilient memory hierarchies separating ephemeral task context from persistent associative knowledge. When deploying swarms of specialized workers, distributed blackboard architectures reduce context window saturation by 68% compared to naive concatenation of conversational histories. However, coordination latency increases proportionally to swarm diameter unless asynchronous broadcast protocols are enforced.',
      author_or_source: 'MIT CSAIL Autonomous Systems Group',
      summary: 'Proposes distributed blackboard architectures for multi-agent swarms. Reduces context saturation by 68% while discussing latency mitigation through asynchronous broadcasts.',
      key_themes: ['Multi-Agent Swarms', 'Context Saturation', 'Blackboard Architecture', 'Asynchronous Broadcast'],
      created_at: new Date(Date.now() - 86400000).toISOString()
    });

    const q1Id = '33333333-3333-4333-a333-333333333331';
    this.queries.set(q1Id, {
      id: q1Id,
      workspace_id: ws1Id,
      question: 'How do test-time compute scaling and blackboard multi-agent architectures mitigate inference limitations?',
      answer: '### Cross-Document Synthesis: Inference Optimization\n\nSynthesizing findings across the workspace corpus reveals two complementary strategies for overcoming model inference boundaries:\n\n1. **Inference Compute Scaling via Dynamic Search**: According to *Scaling Laws for Test-Time Compute in Complex Reasoning*, allocating search and verification FLOPs via Monte Carlo Tree Search (MCTS) and Process Reward Models (PRMs) yields a **42% performance improvement** over static chain-of-thought. This replaces brute-force generation with verifiable reasoning trajectories.\n\n2. **Context Saturation Mitigation in Agent Swarms**: As detailed in *Memory Consolidation and Hierarchical Subagent Swarms*, naive conversational concatenation creates rapid context window saturation. Employing a distributed blackboard pattern **diminishes context saturation by 68%**, provided asynchronous broadcast mechanisms handle inter-agent communication latency.\n\nTogether, these architectures transition reasoning systems from monolithic static prompting into verifiable, modular computation.',
      citations: [doc1Id, doc2Id],
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    });
  }
}

export const memoryStore = new MemoryStore();

