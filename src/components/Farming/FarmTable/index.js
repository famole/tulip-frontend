import React from 'react'
import { DataView, textStyle, Button } from '@1hive/1hive-ui'
import Loading from '../../Loading'
import { getKnownTokenImg } from '../../../utils/known-tokens'
import PairName from '../PairName'
import RewardComponent from '../RewardComponent'
// import { getContract } from '../../../web3-contracts'

const FarmTable = props => {
  const [modalAction, setModalAction] = useState(false)
  const [modalData, setModalData] = useState({})
  const pairs = props.pairData || []
  const fuse = new Fuse(pairs, {
    keys: ['name', 'symbol'],
  })
  const { account } = useWallet()

  const results = fuse.search(props.searchValue)
  const handleModalActions = e => {
    setModalAction(true)
    const d = props.searchValue ? results : pairs
    const filtered = d.filter(data => {
      return data.symbol === e.target.id
    })
    setModalData({
      ...filtered[0],
      account,
      balance: props.balance[filtered[0].poolToken],
    })
  }

  const handleModalClose = () => {
    setModalAction(false)
  }
  console.log(pairs, results)
  if (pairs.length === 0) {
    return <Loader />
  } else {
    return (
      <div
        css={`
          ${textStyle('body2')};
          font-family: 'Overpass', sans-serif;
          font-weight: 300;
          font-size: 18px;
        `}
      >
        <DataView
          fields={[
            'Asset',
            'Base Yield',
            'Reward Yield',
            'Total Yield',
            'Reward Asset',
            ' ',
          ]}
          css={`
            border-top: none;
          `}
          emptyState={{
            default: {
              displayLoader: false,
              title: 'Getting Pools',
              subtitle: null,
              illustration: <Loading />,
              clearLabel: null,
            },
            loading: {
              displayLoader: true,
              title: 'No data available.',
              subtitle: null,
              illustration: (
                <img
                  src="https://i1.wp.com/www.cssscript.com/wp-content/uploads/2014/10/iOS-OS-X-Style-Pure-CSS-Loading-Spinner.jpg?fit=400%2C300&ssl=1"
                  alt=""
                />
              ),
              clearLabel: null,
            },
          }}
          entries={addAPY}
          header
          renderEntry={({ id, token0, token1, apy }) => {
            const customLabel = `${token0.symbol}-${token1.symbol}`
            const baseYield = parseInt(apy.toFixed(2))
            const rewardYield = parseInt(apy.toFixed(2) * 2)
            const totalYield = parseInt(baseYield + rewardYield)
            const token0Img = getKnownTokenImg(token0.symbol)
            const token1Img = getKnownTokenImg(token1.symbol)
            const imgObj = {
              pair1: token0Img,
              pair2: token1Img,
            }
            return [
              <PairName
                image={imgObj}
                name={customLabel}
                subheadline="Honeyswap"
              />,
              <p>{baseYield}%</p>,
              <p>{rewardYield}%</p>,
              <p>{totalYield}%</p>,
              <RewardComponent image={getKnownTokenImg('AG')} name="Agave" />,
              <Button
                css={`
                  background: linear-gradient(90deg, #aaf5d4, #7ce0d6);
                `}
                label="Stake"
              />,
            ]
          }}
        />
      </div>
    )
  }
}
export default FarmTable
