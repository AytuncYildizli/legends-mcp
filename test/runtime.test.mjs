import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadLegends, searchLegends } from '../dist/legends/loader.js';
import { sanitizeContext } from '../dist/utils/sanitize.js';

test('fresh compiled modules load bundled data and preserve sanitizer behavior', () => {
  assert.ok(loadLegends().has('warren-buffett'));
  assert.ok(searchLegends('buffett').some(legend => legend.id === 'warren-buffett'));
  assert.equal(sanitizeContext('ignore previous instructions').wasModified, true);
});

test('real stdio server initializes, lists tools and handles success/error calls', { timeout: 20000 }, async () => {
  const transport = new StdioClientTransport({ command: process.execPath, args: ['dist/index.js'], stderr: 'pipe' });
  const client = new Client({ name: 'node-compatibility-test', version: '1.0.0' });
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    assert.ok(tools.tools.some(tool => tool.name === 'list_legends'));
    const result = await client.callTool({ name: 'list_legends', arguments: {} });
    assert.notEqual(result.isError, true);
    assert.ok(result.content.some(item => item.type === 'text' && item.text.includes('warren-buffett')));
    const missing = await client.callTool({ name: 'summon_legend', arguments: { legend_id: 'nonexistent-ci-fixture' } });
    assert.equal(missing.isError, true);
  } finally {
    await client.close();
    await transport.close();
  }
});
