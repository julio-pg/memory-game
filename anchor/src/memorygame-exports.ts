// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import MemorygameIDL from '../target/idl/memorygame.json'
import type { Memorygame } from '../target/types/memorygame'

// Re-export the generated IDL and type
export { Memorygame, MemorygameIDL }

// The programId is imported from the program IDL.
export const MEMORYGAME_PROGRAM_ID = new PublicKey(MemorygameIDL.address)

// This is a helper function to get the Memorygame Anchor program.
export function getMemorygameProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...MemorygameIDL, address: address ? address.toBase58() : MemorygameIDL.address } as Memorygame, provider)
}

// This is a helper function to get the program ID for the Memorygame program depending on the cluster.
export function getMemorygameProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Memorygame program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return MEMORYGAME_PROGRAM_ID
  }
}
