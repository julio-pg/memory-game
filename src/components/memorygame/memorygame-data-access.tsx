import { getMemorygameProgram, getMemorygameProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useMemorygameProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getMemorygameProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getMemorygameProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['memorygame', 'all', { cluster }],
    queryFn: () => program.account.memorygame.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['memorygame', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ memorygame: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useMemorygameProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useMemorygameProgram()

  const accountQuery = useQuery({
    queryKey: ['memorygame', 'fetch', { cluster, account }],
    queryFn: () => program.account.memorygame.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['memorygame', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ memorygame: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['memorygame', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ memorygame: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['memorygame', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ memorygame: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['memorygame', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ memorygame: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
