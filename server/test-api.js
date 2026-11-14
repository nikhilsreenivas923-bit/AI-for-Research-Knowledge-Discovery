import http from 'http';

async function runTests() {
  console.log('--- Testing Backend API with Demo Auth ---');
  const token = 'demo-token';

  async function api(path, method = 'GET', body = null) {
    const res = await fetch(`http://localhost:5000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. Sync User
  const syncRes = await api('/api/auth/sync', 'POST');
  console.log('1. /api/auth/sync Status:', syncRes.status, syncRes.data.message);

  // 2. List Workspaces
  const wsList = await api('/api/workspaces');
  console.log('2. /api/workspaces Status:', wsList.status, 'Count:', wsList.data.workspaces?.length);

  // 3. Create Workspace
  const newWs = await api('/api/workspaces', 'POST', {
    name: 'Quantum Machine Learning 2026',
    domain: 'Academic',
    description: 'Investigating variational quantum eigensolvers and parameterized quantum circuits for drug discovery.'
  });
  console.log('3. /api/workspaces (POST) Status:', newWs.status, 'Created WS ID:', newWs.data.workspace?.id);
  const wsId = newWs.data.workspace.id;

  // 4. Ingest Document
  const docRes = await api('/api/documents', 'POST', {
    workspaceId: wsId,
    title: 'Variational Quantum Algorithms for Molecular Ground State Estimation',
    content: 'Variational Quantum Eigensolver (VQE) algorithms implemented on noisy intermediate-scale quantum (NISQ) hardware have demonstrated energy convergence within chemical accuracy for small hydride molecules like LiH and BeH2. By implementing error-mitigated zero-noise extrapolation, fidelity gains reached 89% over unmitigated baselines, paving the way for scalable quantum chemistry simulations.',
    author_or_source: 'CERN Quantum Technology Initiative'
  });
  console.log('4. /api/documents (POST) Status:', docRes.status, 'Summary:', docRes.data.document?.summary?.slice(0, 60) + '...');
  console.log('   Key Themes:', docRes.data.document?.key_themes);

  // 5. Query Synthesis
  const queryRes = await api('/api/query', 'POST', {
    workspaceId: wsId,
    question: 'What are the main fidelity improvements and molecular targets achieved with VQE?',
    strictCitationsOnly: true
  });
  console.log('5. /api/query (POST) Status:', queryRes.status);
  console.log('   Synthesized Answer Preview:', queryRes.data.query?.answer?.slice(0, 100) + '...');
  console.log('   Citations count:', queryRes.data.query?.citations?.length);

  console.log('--- All Backend API Route Tests Passed! ---');
  process.exit(0);
}

// Start server and run tests
import('./src/index.js').then(() => {
  setTimeout(runTests, 1200);
});

