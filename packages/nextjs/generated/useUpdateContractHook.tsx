import { Abi } from "viem";
import { useNetwork, usePublicClient } from "wagmi";
import contracts from "./deployedContracts";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const abi: Abi = [
  {
    inputs: [],
    name: "identityRegistry",
    outputs: [
      {
        internalType: "contract IIdentityRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "compliance",
    outputs: [
      {
        internalType: "contract IModularCompliance",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "identityStorage",
    outputs: [
      {
        internalType: "contract IIdentityRegistryStorage",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "issuersRegistry",
    outputs: [
      {
        internalType: "contract ITrustedIssuersRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "topicsRegistry",
    outputs: [
      {
        internalType: "contract IClaimTopicsRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  }
];

export default function useUpdateContractHook() {
  const publicClient = usePublicClient();
  const network = useNetwork();
  async function updateContractAddress(address: string) {
    const identityRegistryAddress = await publicClient.readContract({ address, abi, functionName: 'identityRegistry' }) as string;
    const complianceAddress = await publicClient.readContract({ address, abi, functionName: 'compliance' }) as string;

    const identityStorageAddress = await publicClient.readContract({ address: identityRegistryAddress, abi, functionName: 'identityStorage' }) as string;
    const issuersRegistryAddress = await publicClient.readContract({ address: identityRegistryAddress, abi, functionName: 'issuersRegistry' }) as string;
    const topicsRegistryAddress = await publicClient.readContract({ address: identityRegistryAddress, abi, functionName: 'topicsRegistry' }) as string;

    const addressMap: { [key: string]: string } = {
      Token: address,
      IdentityRegistry: identityRegistryAddress,
      ModularCompliance: complianceAddress,
      IdentityRegistryStorage: identityStorageAddress,
      TrustedIssuersRegistry: issuersRegistryAddress,
      ClaimTopicsRegistry: topicsRegistryAddress,
    };

    console.log(network.chain?.id);

    localStorage.setItem(`__tokenyze__.${network.chain?.id}.contractAddress`, JSON.stringify(addressMap));
  }

  function getContract() {
    const contractData = contracts as GenericContractsDeclaration;
    const chainId = network.chain?.id || 43113;

    const addresses = localStorage.getItem(`__tokenyze__.${network.chain?.id}.contractAddress`);

    const addressMap = addresses ? JSON.parse(addresses) : null;

    if (!contractData?.[chainId]?.[0] && addressMap) {
      const contractObj = contractData?.[chainId]?.[0];

      for (const [contractName, newAddress] of Object.entries<string>(addressMap)) {
        contractObj.contracts[contractName].address = newAddress;
      }
    }

    return contractData;
  }

  return { updateContractAddress, getContract }
}