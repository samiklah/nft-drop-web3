import { useNFTCollection, useNFTDrop } from '@thirdweb-dev/react'
import { NFTMetadata, NFTMetadataOwner } from '@thirdweb-dev/sdk'
import { useEffect, useState } from 'react'

function NFTListComponent() {
  const [nfts, setNfts] = useState<NFTMetadata[]>([])
  const nftDrop = useNFTDrop('0x944f631Ae91F1382F913e103132791442dCEeB50')

  useEffect(() => {
    const fetchNFTDropData = async () => {
      const unclaimed = await nftDrop?.getAllUnclaimed()

      if (unclaimed) {
        setNfts(unclaimed)
      }
    }

    fetchNFTDropData()
  }, [nftDrop])

  console.log('nfts >> ', nfts)

  return (
    <div className="">
      <h1>Hello</h1>
      {nfts.map((nft) => {
        console.log(nft)
        return (
          <div
            key={nft.id.toString()}
            className="cursor-pointer text-ellipsis rounded-md bg-gray-600 text-white shadow-sm transition-all duration-200 hover:scale-105"
          >
            <img src={nft.image} className="h-32 w-32 rounded-t-md" alt="" />
            <div className="p-2">
              <p className="text-left text-sm font-bold">{nft.name}</p>
            </div>
            <button onClick={() => nft}>Buy NFT</button>
          </div>
        )
      })}
    </div>
  )
}

export default NFTListComponent
