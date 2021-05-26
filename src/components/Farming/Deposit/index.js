import React, { useState, useRef } from 'react'
import { Button, TransactionProgress } from '@1hive/1hive-ui'
import { useCreateDeposit } from '../../../hooks/useCreateDeposit'
import { getNetworkConfig } from '../../../networks'

const Deposit = props => {
  const [visible, setVisible] = useState(false)
  const [txHash, setTxHash] = useState('')
  const { token, amount, days, maxDays } = props
  const network = getNetworkConfig()
  const opener = useRef()

  const transactionTime = new Date()
  transactionTime.setSeconds(transactionTime.getSeconds() + 8)

  const calculateUnlockTimestamp = days => {
    if (days === 0 || !days) {
      return 0
    }

    const date = new Date()
    let unlockTimestamp = Math.floor(date.setDate(date.getDate() + days) / 1000)
    // add or remove 100 seconds on the max/min value to cover for rounding errors
    if (days === 1) {
      unlockTimestamp += 100
    }
    if (days === maxDays) {
      unlockTimestamp -= 100
    }
    return unlockTimestamp
  }

  const unlockTimestamp = calculateUnlockTimestamp(days)

  const deposit = useCreateDeposit(token, amount.toString(), unlockTimestamp)
  const handleDeposit = () => {
    deposit()
      .then(x => {
        console.log(typeof x)
        if (x && x.message === undefined) {
          console.log(x, typeof x)
          setVisible(true)
          setTxHash(x.hash)
          x.wait()
            .then(() => {
              setVisible(false)
              props.onTransactionComplete()
            })
            .catch(err => console.log(err))
        }
      })
      .catch(err => console.log(err))
  }
  return (
    <>
      <TransactionProgress
        transactionHash={txHash}
        transactionHashUrl={network.txUrl + txHash}
        progress={1}
        visible={visible}
        endTime={transactionTime}
        onClose={() => setVisible(false)}
        opener={opener}
        slow={false}
      />
      <Button
        css={`
          background: linear-gradient(90deg, #aaf5d4, #7ce0d6);
        `}
        label="Deposit"
        onClick={handleDeposit}
        wide
        ref={opener}
      />
    </>
  )
}

export default Deposit
