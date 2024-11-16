import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygonAmoy } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(
      'https://sepolia.infura.io/v3/2c0315e866694b5f8855f369ba30a4b0'
    ),
    [polygonAmoy.id]: http('https://polygon-amoy.infura.io/v3/2c0315e866694b5f8855f369ba30a4b0')
  },
})
