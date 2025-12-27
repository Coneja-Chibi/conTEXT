#!/usr/bin/env node
/**
 * Update Snapshot Script
 *
 * Fetches latest model data from OpenRouter and saves to snapshots/latest.json
 * Run manually or via GitHub Actions daily.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '..', 'snapshots', 'latest.json');
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/models';

async function fetchModels() {
  return new Promise((resolve, reject) => {
    https.get(OPENROUTER_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔄 Fetching models from OpenRouter...');

  try {
    const data = await fetchModels();

    if (!data?.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format');
    }

    const modelCount = data.data.length;
    const providers = new Set(data.data.map((m) => m.id.split('/')[0]));

    // Add metadata
    const snapshot = {
      _meta: {
        fetchedAt: new Date().toISOString(),
        modelCount,
        providerCount: providers.size,
        source: 'openrouter',
      },
      ...data,
    };

    // Write to file
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));

    console.log(`✅ Saved ${modelCount} models from ${providers.size} providers`);
    console.log(`📁 Written to: ${SNAPSHOT_PATH}`);

    // Print some stats
    const byProvider = {};
    data.data.forEach((m) => {
      const p = m.id.split('/')[0];
      byProvider[p] = (byProvider[p] || 0) + 1;
    });

    console.log('\n📊 Top providers:');
    Object.entries(byProvider)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([provider, count]) => {
        console.log(`   ${provider}: ${count} models`);
      });

    // Context distribution
    const tiers = {
      massive: data.data.filter((m) => m.context_length >= 500000).length,
      large: data.data.filter((m) => m.context_length >= 128000 && m.context_length < 500000).length,
      medium: data.data.filter((m) => m.context_length >= 32000 && m.context_length < 128000).length,
      small: data.data.filter((m) => m.context_length >= 8000 && m.context_length < 32000).length,
      tiny: data.data.filter((m) => m.context_length < 8000).length,
    };

    console.log('\n📏 Context distribution:');
    Object.entries(tiers).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} models`);
    });

  } catch (err) {
    console.error('❌ Failed to update snapshot:', err.message);
    process.exit(1);
  }
}

main();
