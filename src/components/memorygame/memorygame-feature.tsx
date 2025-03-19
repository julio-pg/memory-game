import { useWallet } from '@solana/wallet-adapter-react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { useMemorygameProgram } from './memorygame-data-access'
import { MemorygameCreate, MemorygameList } from './memorygame-ui'

export default function MemorygameFeature() {
  const { publicKey } = useWallet()
  const { programId } = useMemorygameProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Memorygame"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <MemorygameCreate />
      </AppHero>
      <MemorygameList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
