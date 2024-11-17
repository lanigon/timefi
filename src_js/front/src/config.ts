import { http, createConfig } from 'wagmi'
import { sepolia, polygonAmoy, flowTestnet} from 'wagmi/chains'

export const config = createConfig({
  chains: [sepolia, polygonAmoy, flowTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [flowTestnet.id]: http(),
    [sepolia.id]: http(
      'https://sepolia.infura.io/v3/2c0315e866694b5f8855f369ba30a4b0'
    ),
    [polygonAmoy.id]: http()
  },
})
