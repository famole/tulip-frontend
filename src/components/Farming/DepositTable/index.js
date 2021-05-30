import React, { useState } from 'react'
import { DataView, GU, textStyle } from '@1hive/1hive-ui'
import { useWallet } from '../../../providers/Wallet'
import Fuse from 'fuse.js'
import Loader from '../../Loader'
import PairName from '../PairName'
import RewardComponent from '../RewardComponent'
import { KNOWN_FORMATS, dateFormat } from '../../../utils/date-utils'
import Withdraw from '../Withdraw'
import Harvest from '../Harvest'
import Icon from '../../../assets/tulip/icon.svg'
import { getNetworkConfig } from '../../../networks'
// import xComb from '../../../assets/coins/xcomb.svg'
import UserErrorScreen from '../../Errors/UserErrorScreen'
import { truncateDecimals } from '../../../lib/math-utils'

const DepositTable = props => {
  const {
    account,
    _web3ReactContext: { chainId },
  } = useWallet()

  let tokenImage = Icon
  let tokenName = 'xComb'
  const network = getNetworkConfig(chainId)

  if (network) {
    tokenImage = network.token.image
    tokenName = network.token.name
  }

  const depositArray = []
  const [errorVisible, setErrorVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const opener = React.createRef()
  if (typeof props.depositData !== 'string' && props.depositData) {
    for (const {
      id,
      amount,
      pool,
      referrer,
      rewardDebt,
      unlockTime,
      rewardShare,
      setRewards,
      symbol,
      rewardBalance,
      pairInfo,
    } of props.depositData) {
      const depositInfoObj = {
        id,
        amount: truncateDecimals(amount),
        pool,
        referrer,
        rewardBalance,
        rewardDebt: rewardDebt.toFixed(3),
        unlockTime: dateFormat(unlockTime, KNOWN_FORMATS.standard),
        rewardShare: rewardShare,
        setRewards: setRewards,
        symbol: symbol[0],
        pairInfo,
      }
      depositArray.push(depositInfoObj)
    }
    depositArray.sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id)
    })
  }
  const fuse = new Fuse(depositArray, {
    keys: [
      'pairInfo.token0.name',
      'pairInfo.token0.symbol',
      'pairInfo.token1.symbol',
      'pairInfo.token1.name',
    ],
  })
  const results = fuse.search(props.searchValue)

  const handleError = err => {
    if (err && err.data && err.data.message) {
      setErrorVisible(true)
      setErrorMessage(`${err.data.data}: ${err.data.message}`)
    } else if (err && err.message) {
      setErrorVisible(true)
      setErrorMessage(err.message)
    }
  }
  const closeError = () => {
    setErrorVisible(false)
  }

  return (
    <div
      css={`
        ${textStyle('body2')};
        font-family: 'Overpass', sans-serif;
        font-weight: 300;
        font-size: 18px;
      `}
    >
      <UserErrorScreen
        isVisible={errorVisible}
        opener={opener}
        onClose={closeError}
      >
        <p>
          <b>Error</b>
        </p>
        <p>{errorMessage}</p>
      </UserErrorScreen>
      <DataView
        fields={[
          'Deposit Asset',
          'Deposit Balance',
          'Unlock Date',
          'Reward Asset',
          'Reward Balance',
          '',
          '',
        ]}
        css={`
          border-top: none;
          margin-bottom: 20px;
        `}
        emptyState={{
          default: {
            displayLoader: false,
            title: `${
              props.searchValue
                ? 'No results'
                : account
                ? 'No results'
                : 'Connect your account to see your deposits'
            }`,
            subtitle: null,
            illustration: (
              <img src={tokenImage} height={6 * GU} width={5.5 * GU} />
            ),
            clearLabel: null,
          },
          loading: {
            displayLoader: true,
            title: 'No data available.',
            subtitle: null,
            illustration: <Loader />,
            clearLabel: null,
          },
        }}
        entries={account ? (props.searchValue ? results : depositArray) : []}
        renderEntry={({
          id,
          amount,
          pool,
          referrer,
          rewardDebt,
          unlockTime,
          rewardShare,
          setRewards,
          symbol,
          rewardBalance,
          pairInfo,
        }) => {
          const imgObj = {
            pair1: pairInfo ? pairInfo.token0.logoURI : undefined,
            pair2: pairInfo ? pairInfo.token1.logoURI : undefined,
          }
          const customLabel = () => {
            if (!pairInfo) return symbol

            return (
              pairInfo.token0.symbol + ' - ' + pairInfo.token1.symbol + ' LP'
            )
          }
          const unlockDate = new Date(unlockTime).getTime() / 1000 + 100 // add 100 seconds to be sure the time is reached
          const currentTime = Math.ceil(Date.now() / 1000)
          const withdrawDisabled = unlockDate > currentTime
          // const pendingReward = (Number(rewardBalance) / 1e18).toFixed(3)
          const pendingReward = truncateDecimals(Number(rewardBalance) / 1e18)
          if (new Date(unlockTime).getTime() === 0) {
            unlockTime = 'Not locked'
          }
          return [
            <PairName
              image={imgObj}
              name={customLabel()}
              subheadline="Honeyswap"
            />,
            <p>{amount}</p>,
            <p>{unlockTime}</p>,
            <RewardComponent image={tokenImage} name={tokenName} />,
            <p>{pendingReward}</p>,
            <Withdraw
              id={id}
              disabled={withdrawDisabled}
              onError={handleError}
              opener={opener}
            />,
            <Harvest id={id} onError={handleError} />,
          ]
        }}
      />
    </div>
  )
}

export default DepositTable
