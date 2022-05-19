import {
  BigNumber,
  BigNumberish,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
} from "ethers";
import { ItemType, Network, OrderType } from "./constants";

export type SeaportConfig = {
  // Used because fulfillments may be invalid if confirmations take too long. Default buffer is 5 minutes
  ascendingAmountFulfillmentBuffer?: number;

  // Allow users to optionally skip balance and approval checks on order creation
  balanceAndApprovalChecksOnOrderCreation?: boolean;

  // Mainly used for defaulting the contract address
  network?: Network;

  // A mapping of conduit key to conduit
  conduitKeyToConduit?: Record<string, string>;

  overrides?: {
    contractAddress?: string;
    // A default conduit key to use when creating and fulfilling orders
    defaultConduitKey?: string;
  };
};

export type OfferItem = {
  itemType: ItemType;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
};

export type ConsiderationItem = {
  itemType: ItemType;
  token: string;
  identifierOrCriteria: string;
  startAmount: string;
  endAmount: string;
  recipient: string;
};

export type Item = OfferItem | ConsiderationItem;

export type OrderParameters = {
  offerer: string;
  zone: string;
  orderType: OrderType;
  startTime: BigNumberish;
  endTime: BigNumberish;
  zoneHash: string;
  salt: string;
  offer: OfferItem[];
  consideration: ConsiderationItem[];
  totalOriginalConsiderationItems: BigNumberish;
  conduitKey: string;
};

export type OrderComponents = OrderParameters & { nonce: number };

export type Order = {
  parameters: OrderParameters;
  signature: string;
};

export type AdvancedOrder = Order & {
  numerator: BigNumber;
  denominator: BigNumber;
  extraData: string;
};

export type BasicErc721Item = {
  itemType: ItemType.ERC721;
  token: string;
  identifier: string;
};

export type Erc721ItemWithCriteria = {
  itemType: ItemType.ERC721;
  token: string;
  identifiers: string[];
  // Used for criteria based items i.e. offering to buy 5 NFTs for a collection
  amount?: string;
  endAmount?: string;
};

type Erc721Item = BasicErc721Item | Erc721ItemWithCriteria;

export type BasicErc1155Item = {
  itemType: ItemType.ERC1155;
  token: string;
  identifier: string;
  amount: string;
  endAmount?: string;
};

export type Erc1155ItemWithCriteria = {
  itemType: ItemType.ERC1155;
  token: string;
  identifiers: string[];
  amount: string;
  endAmount?: string;
};

type Erc1155Item = BasicErc1155Item | Erc1155ItemWithCriteria;

export type CurrencyItem = {
  token?: string;
  amount: string;
  endAmount?: string;
};

export type CreateInputItem = Erc721Item | Erc1155Item | CurrencyItem;

export type ConsiderationInputItem = CreateInputItem & { recipient?: string };

export type TipInputItem = CreateInputItem & { recipient: string };

export type Fee = {
  recipient: string;
  basisPoints: number;
};

export type CreateOrderInput = {
  conduitKey?: string;
  zone?: string;
  startTime?: string;
  endTime?: string;
  offer: readonly CreateInputItem[];
  consideration: readonly ConsiderationInputItem[];
  nonce?: number;
  fees?: readonly Fee[];
  allowPartialFills?: boolean;
  restrictedByZone?: boolean;
  useProxy?: boolean;
  salt?: string;
};

export type InputCriteria = {
  identifier: string;
  validIdentifiers: string[];
};

export type OrderStatus = {
  isValidated: boolean;
  isCancelled: boolean;
  totalFilled: BigNumber;
  totalSize: BigNumber;
};

export type OrderWithNonce = {
  parameters: OrderComponents;
  signature: string;
};

export type TransactionMethods = {
  buildTransaction: (overrides?: Overrides) => Promise<PopulatedTransaction>;
  callStatic: <T>(overrides?: Overrides) => Promise<T>;
  estimateGas: (overrides?: Overrides) => Promise<BigNumber>;
  transact: (overrides?: Overrides) => Promise<ContractTransaction>;
};

export type ApprovalAction = {
  type: "approval";
  token: string;
  identifierOrCriteria: string;
  itemType: ItemType;
  operator: string;
  transactionMethods: TransactionMethods;
};

export type ExchangeAction = {
  type: "exchange";
  transactionMethods: TransactionMethods;
};

export type CreateOrderAction = {
  type: "create";
  getMessageToSign: () => Promise<string>;
  createOrder: () => Promise<OrderWithNonce>;
};

export type TransactionAction = ApprovalAction | ExchangeAction;

export type CreateOrderActions = readonly [
  ...ApprovalAction[],
  CreateOrderAction
];

export type OrderExchangeActions = readonly [
  ...ApprovalAction[],
  ExchangeAction
];

export type OrderUseCase<T extends CreateOrderAction | ExchangeAction> = {
  actions: T extends CreateOrderAction
    ? CreateOrderActions
    : OrderExchangeActions;
  executeAllActions: () => Promise<
    T extends CreateOrderAction ? OrderWithNonce : ContractTransaction
  >;
};

export type FulfillmentComponent = {
  orderIndex: number;
  itemIndex: number;
};

export type Fulfillment = {
  offerComponents: FulfillmentComponent[];
  considerationComponents: FulfillmentComponent[];
};
