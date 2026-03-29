
import { Block } from '../types';

// Simple SHA-256 like hasher simulation
const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
};

export const createGenesisBlock = (): Block => {
  const genesisData = "Genesis Block - BharatVote 2024";
  return {
    index: 0,
    timestamp: Date.now(),
    vote: 'GENESIS',
    previousHash: '0'.repeat(64),
    hash: generateHash(genesisData),
    nonce: 0,
    // Fix: Adding required integrityScore property for the Block interface
    integrityScore: 100
  };
};

export const createNewBlock = (previousBlock: Block, vote: string): Block => {
  const index = previousBlock.index + 1;
  const timestamp = Date.now();
  const previousHash = previousBlock.hash;
  let nonce = 0;
  let hash = '';
  
  // Minimal proof of work simulation
  do {
    nonce++;
    hash = generateHash(`${index}${timestamp}${vote}${previousHash}${nonce}`);
  } while (!hash.startsWith('00')); // Simple difficulty

  return {
    index,
    timestamp,
    vote,
    previousHash,
    hash,
    nonce,
    // Fix: Adding required integrityScore property for the Block interface
    integrityScore: 100
  };
};
