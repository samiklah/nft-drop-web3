import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typings'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

interface Props {
  collection: Collection
}

function NFTDropPage({ collection }: Props) {
  const [claimedSupply, setClaimedSupply] = useState<number>()
  const [unclaimedSupply, setUnclaimedSupply] = useState<number>()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [priceInEth, setPriceInEth] = useState<string>()
  const [loading, setLoading] = useState(true)

  // Auth
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const disconnect = useDisconnect()
  // ---

  const nftDrop = useNFTDrop(collection.address)

  console.log(claimedSupply)
  console.log(totalSupply?.toNumber())

  useEffect(() => {
    const fetchPrice = async () => {
      if (!nftDrop) return
      const claimConditions = await nftDrop.claimConditions.getAll()

      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)
    }

    fetchPrice()
  }, [nftDrop])

  useEffect(() => {
    const fetchNFTDropData = async () => {
      if (!nftDrop) return

      setLoading(true)

      const unclaimed = await nftDrop.getAllUnclaimed()
      const claimed = await nftDrop.getAllClaimed()
      const total = await nftDrop.totalSupply()

      setUnclaimedSupply(unclaimed.length)
      setClaimedSupply(claimed.length)
      setTotalSupply(total)

      setLoading(false)
    }

    fetchNFTDropData()
  }, [nftDrop])

  const mintNft = () => {
    //   Address of NFT destination (buyer)
    if (!nftDrop || !address) return

    const quantity = 1 // how many unique NFTs you want to claim

    setLoading(true)
    const notification = toast.loading('Minting NFT...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
    })

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = tx[0].receipt // the transaction receipt
        const claimedTokenId = tx[0].id // the id of the NFT claimed
        const claimedNFT = await tx[0].data() // (optional) get the claimed NFT metadata

        console.log(receipt)
        console.log(claimedTokenId)
        console.log(claimedNFT)

        toast('Hooray.. You Successfully Minted!', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })
      })
      .catch((err) => {
        toast('Whoops.. Something went Wrong!', {
          style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })
      })
      .finally(() => {
        setLoading(false)
        toast.dismiss(notification)
      })
  }

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position="bottom-center" />
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 pt-10 shadow-2xl lg:col-span-4 lg:pt-0">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage).url()!}
              alt=""
            />
          </div>
          <div className="space-y-2 p-5 text-center">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={'/'}>
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{' '}
              <span className="font-extrabold underline decoration-pink-600/50">
                PAPAFAM
              </span>{' '}
              NFT Market Place
            </h1>
          </Link>

          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className={`rounded-full ${
              address ? 'bg-gray-300 text-gray-700' : 'bg-rose-400 text-white'
            } px-4 py-2 text-xs font-bold  lg:px-5 lg:py-3 lg:text-base`}
          >
            {address ? 'Sign Out' : 'Sign In'}
          </button>
        </div>

        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}

        {/* Content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()!}
            alt=""
          />
          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>
          {!loading ? (
            <p className="pt-2 text-xl text-green-500">
              {claimedSupply} / {totalSupply?.toString()} NFT's claimed
            </p>
          ) : (
            <p className="pt-2 text-xl">Loading Supply Count...</p>
          )}

          {loading && (
            <img
              className="h-80 w-80 object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            />
          )}
        </div>

        {/* Mint button */}
        <button
          disabled={
            loading || claimedSupply === totalSupply?.toNumber() || !address
          }
          className="h-16 w-full rounded-full bg-red-600 text-white disabled:bg-gray-400"
          onClick={mintNft}
        >
          {loading ? (
            <>Loading...</>
          ) : claimedSupply === totalSupply?.toNumber() ? (
            <>SOLD OUT</>
          ) : !address ? (
            <>Sign In to Mint</>
          ) : (
            <span className="font-bold">Mint NFT ({priceInEth} ETH)</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NFTDropPage

// Uncomment if you want ISR
// -----------------------------------------------------------------------------
// export const getStaticPaths = async () => {
//   const query = `*[_type == "collection"]{
//         _id,
//         slug {
//             current
//         },
//       }`

//   const collections = await sanityClient.fetch(query)

//   console.log(collections)

//   const paths = collections.map((collection: Collection) => ({
//     params: {
//       id: collection.slug.current,
//     },
//   }))

//   console.log(paths)

//   return {
//     paths,
//     fallback: 'blocking',
//   }
// }
// -----------------------------------------------------------------------------

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
        _id,
        title,
        address,
        description,
        nftCollectionName,
        mainImage {
            asset
        },
        previewImage {
            asset
        },
        slug {
            current
        },
        creator-> {
            _id,
            name,
            address,
            slug {
                current
            },
        },
    }`

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  })

  console.log(collection)

  if (!collection) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      collection,
    },

    // Uncomment if you want ISR
    // -----------------------------------------------------------------------------
    // revalidate: 60, // after 60 seconds, itll update the old cached version
    // -----------------------------------------------------------------------------
  }
}
