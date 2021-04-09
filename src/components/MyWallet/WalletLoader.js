import React from 'react'
import MyWallet from './MyWallet'
import Loader from '../Loader'
import { useNetBalance } from '../../hooks/useWalletData'

function WalletLoader() {
  const walletData = useNetBalance()
  console.log('>>>>>>', walletData.isFetching)
  if (walletData.isFetching) {
    return <Loader />
  }

  return <MyWallet walletData={walletData} />
}

export default WalletLoader
