import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Memorygame } from '../target/types/memorygame'

describe('memorygame', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Memorygame as Program<Memorygame>

  const memorygameKeypair = Keypair.generate()

  it('Initialize Memorygame', async () => {
    await program.methods
      .initialize()
      .accounts({
        memorygame: memorygameKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([memorygameKeypair])
      .rpc()

    const currentCount = await program.account.memorygame.fetch(memorygameKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Memorygame', async () => {
    await program.methods.increment().accounts({ memorygame: memorygameKeypair.publicKey }).rpc()

    const currentCount = await program.account.memorygame.fetch(memorygameKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Memorygame Again', async () => {
    await program.methods.increment().accounts({ memorygame: memorygameKeypair.publicKey }).rpc()

    const currentCount = await program.account.memorygame.fetch(memorygameKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Memorygame', async () => {
    await program.methods.decrement().accounts({ memorygame: memorygameKeypair.publicKey }).rpc()

    const currentCount = await program.account.memorygame.fetch(memorygameKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set memorygame value', async () => {
    await program.methods.set(42).accounts({ memorygame: memorygameKeypair.publicKey }).rpc()

    const currentCount = await program.account.memorygame.fetch(memorygameKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the memorygame account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        memorygame: memorygameKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.memorygame.fetchNullable(memorygameKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
