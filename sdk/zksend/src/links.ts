// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import type { CoinStruct, ObjectOwner, SuiObjectChange } from '@mysten/sui.js/client';
import type { Keypair, Signer } from '@mysten/sui.js/cryptography';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import type { TransactionObjectInput } from '@mysten/sui.js/transactions';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import {
	fromB64,
	normalizeStructTag,
	normalizeSuiAddress,
	normalizeSuiObjectId,
	parseStructTag,
	SUI_TYPE_ARG,
} from '@mysten/sui.js/utils';

export interface ZkSendLinkBuilderOptions {
	host?: string;
	path?: string;
	mist?: number;
	keypair?: Keypair;
	client?: SuiClient;
	sender: string;
}

export interface ZkSendLinkOptions {
	keypair?: Keypair;
	client?: SuiClient;
}

const DEFAULT_ZK_SEND_LINK_OPTIONS = {
	host: 'https://zksend.com',
	path: '/claim',
	client: new SuiClient({ url: getFullnodeUrl('mainnet') }),
};

const SUI_COIN_TYPE = normalizeStructTag(SUI_TYPE_ARG);
const SUI_COIN_OBJECT_TYPE = normalizeStructTag('0x2::coin::Coin<0x2::sui::SUI>');

interface CreateZkSendLinkOptions {
	transactionBlock?: TransactionBlock;
	calculateGas?: (options: {
		mist: bigint;
		objects: TransactionObjectInput[];
		gasEstimateFromDryRun: bigint;
	}) => Promise<bigint> | bigint;
}

export class ZkSendLinkBuilder {
	#host: string;
	#path: string;
	#keypair: Keypair;
	#client: SuiClient;
	#objects = new Set<TransactionObjectInput>();
	#mist = 0n;
	#sender: string;

	constructor({
		host = DEFAULT_ZK_SEND_LINK_OPTIONS.host,
		path = DEFAULT_ZK_SEND_LINK_OPTIONS.path,
		keypair = new Ed25519Keypair(),
		client = DEFAULT_ZK_SEND_LINK_OPTIONS.client,
		sender,
	}: ZkSendLinkBuilderOptions) {
		this.#host = host;
		this.#path = path;
		this.#keypair = keypair;
		this.#client = client;
		this.#sender = normalizeSuiAddress(sender);
	}

	addClaimableMist(amount: bigint) {
		this.#mist += amount;
	}

	addClaimableObject(id: TransactionObjectInput) {
		this.#objects.add(id);
	}

	getLink(): string {
		const link = new URL(this.#host);
		link.pathname = this.#path;
		link.hash = this.#keypair.export().privateKey;

		return link.toString();
	}

	async create({
		signer,
		...options
	}: CreateZkSendLinkOptions & {
		signer: Signer;
	}) {
		const txb = await this.createSendTransaction(options);

		return this.#client.signAndExecuteTransactionBlock({
			transactionBlock: await txb.build({ client: this.#client }),
			signer,
		});
	}
	async createSendTransaction({
		transactionBlock: txb = new TransactionBlock(),
		calculateGas,
	}: CreateZkSendLinkOptions = {}) {
		const gasEstimateFromDryRun = await this.#estimateClaimGasFee();
		const baseGasAmount = calculateGas
			? await calculateGas({
					mist: this.#mist,
					objects: [...this.#objects],
					gasEstimateFromDryRun,
			  })
			: gasEstimateFromDryRun * 2n;

		// Ensure that rounded gas is not less than the calculated gas
		const gasWithBuffer = baseGasAmount + 1013n;
		// Ensure that gas amount ends in 987
		const roundedGasAmount = gasWithBuffer - (gasWithBuffer % 1000n) - 13n;

		const address = this.#keypair.toSuiAddress();
		const objectsToTransfer = [...this.#objects].map((id) => txb.object(id));
		txb.setSenderIfNotSet(this.#sender);

		if (this.#mist) {
			const [gas, sui] = txb.splitCoins(txb.gas, [roundedGasAmount, this.#mist]);
			objectsToTransfer.push(gas, sui);
		} else {
			const [gas] = txb.splitCoins(txb.gas, [roundedGasAmount]);
			objectsToTransfer.push(gas);
		}

		txb.transferObjects(objectsToTransfer, address);

		return txb;
	}

	async #estimateClaimGasFee(): Promise<bigint> {
		const txb = new TransactionBlock();
		txb.setSender(this.#sender);
		txb.setGasPayment([]);

		if (this.#mist) {
			const allCoins = await this.#client.getCoins({
				owner: this.#sender,
				coinType: SUI_COIN_TYPE,
				limit: 1,
			});

			if (!allCoins.data.length) {
				throw new Error('Sending account does not contain any Sui');
			}

			txb.transferObjects(
				[txb.object(allCoins.data[0].coinObjectId)],
				this.#keypair.toSuiAddress(),
			);
		}

		txb.transferObjects(
			[...this.#objects].map((id) => txb.object(id)),
			this.#keypair.toSuiAddress(),
		);

		const result = await this.#client.dryRunTransactionBlock({
			transactionBlock: await txb.build({ client: this.#client }),
		});

		return (
			BigInt(result.effects.gasUsed.computationCost) +
			BigInt(result.effects.gasUsed.storageCost) -
			BigInt(result.effects.gasUsed.storageRebate)
		);
	}
}

export interface ZkSendLinkOptions {
	keypair?: Keypair;
	client?: SuiClient;
}
export class ZkSendLink {
	#client: SuiClient;
	#keypair: Keypair;
	#initiallyOwnedObjects = new Set<string>();
	#ownedObjects: Array<{
		objectId: string;
		version: string;
		digest: string;
		type: string;
	}> = [];
	#gasCoin?: CoinStruct;
	#creatorAddress?: string;

	constructor({
		client = DEFAULT_ZK_SEND_LINK_OPTIONS.client,
		keypair = new Ed25519Keypair(),
	}: ZkSendLinkOptions) {
		this.#client = client;
		this.#keypair = keypair;
	}

	static async fromUrl(url: string, options?: Omit<ZkSendLinkOptions, 'keypair'>) {
		const parsed = new URL(url);
		const keypair = Ed25519Keypair.fromSecretKey(fromB64(parsed.hash.slice(1)));

		const link = new ZkSendLink({
			...options,
			keypair,
		});

		await link.loadOwnedData();

		return link;
	}

	async loadOwnedData() {
		await Promise.all([this.#loadInitialTransactionData(), this.#loadOwnedObjects()]);
	}

	async listClaimableAssets(
		address: string,
		options?: {
			claimObjectsAddedAfterCreation?: boolean;
			coinTypes?: string[];
			objects?: string[];
		},
	) {
		const normalizedAddress = normalizeSuiAddress(address);
		const txb = this.createClaimTransaction(normalizedAddress, options);

		const dryRun = await this.#client.dryRunTransactionBlock({
			transactionBlock: await txb.build({ client: this.#client }),
		});

		const balances: {
			coinType: string;
			amount: bigint;
		}[] = [];

		const nfts: {
			objectId: string;
			type: string;
			version: string;
			digest: string;
		}[] = [];

		dryRun.balanceChanges.forEach((balanceChange) => {
			if (BigInt(balanceChange.amount) > 0n && isOwner(balanceChange.owner, normalizedAddress)) {
				balances.push({ coinType: balanceChange.coinType, amount: BigInt(balanceChange.amount) });
			}
		});

		dryRun.objectChanges.forEach((objectChange) => {
			if ('objectType' in objectChange) {
				const type = parseStructTag(objectChange.objectType);

				if (
					type.address === normalizeSuiAddress('0x2') &&
					type.module === 'coin' &&
					type.name === 'Coin'
				) {
					return;
				}
			}

			if (ownedAfterChange(objectChange, normalizedAddress)) {
				nfts.push(objectChange);
			}
		});

		return {
			balances,
			nfts,
		};
	}

	async claimAssets(
		address: string,
		options?: {
			claimObjectsAddedAfterCreation?: boolean;
			coinTypes?: string[];
			objects?: string[];
		},
	) {
		return this.#client.signAndExecuteTransactionBlock({
			transactionBlock: await this.createClaimTransaction(address, options),
			signer: this.#keypair,
		});
	}

	createClaimTransaction(
		address: string,
		options?: {
			claimObjectsAddedAfterCreation?: boolean;
			coinTypes?: string[];
			objects?: string[];
		},
	) {
		const claimAll = !options?.coinTypes && !options?.objects;
		const txb = new TransactionBlock();
		txb.setSender(this.#keypair.toSuiAddress());
		const coinTypes = new Set(
			options?.coinTypes?.map((type) => normalizeStructTag(`0x2::coin::Coin<${type}>`)) ?? [],
		);

		const objectsToTransfer = this.#ownedObjects
			.filter((object) => {
				if (this.#gasCoin) {
					if (object.objectId === this.#gasCoin.coinObjectId) {
						return false;
					}
				} else if (object.type === SUI_COIN_OBJECT_TYPE) {
					return false;
				}

				if (coinTypes?.has(object.type) || options?.objects?.includes(object.objectId)) {
					return true;
				}

				if (
					!options?.claimObjectsAddedAfterCreation &&
					!this.#initiallyOwnedObjects.has(object.objectId)
				) {
					return false;
				}

				return claimAll;
			})
			.map((object) => txb.object(object.objectId));

		if (this.#gasCoin && this.#creatorAddress) {
			txb.transferObjects([txb.gas], this.#creatorAddress);
		} else if (claimAll || coinTypes?.has(SUI_COIN_TYPE)) {
			objectsToTransfer.push(txb.gas);
		}

		txb.transferObjects(objectsToTransfer, address);

		return txb;
	}

	async #loadOwnedObjects() {
		this.#ownedObjects = [];
		let nextCursor: string | null | undefined;
		do {
			const ownedObjects = await this.#client.getOwnedObjects({
				cursor: nextCursor,
				owner: this.#keypair.toSuiAddress(),
				options: {
					showType: true,
				},
			});

			// RPC response returns cursor even if there are no more pages
			nextCursor = ownedObjects.hasNextPage ? ownedObjects.nextCursor : null;
			for (const object of ownedObjects.data) {
				if (object.data) {
					this.#ownedObjects.push({
						objectId: normalizeSuiObjectId(object.data.objectId),
						version: object.data.version,
						digest: object.data.digest,
						type: normalizeStructTag(object.data.type!),
					});
				}
			}
		} while (nextCursor);
	}

	async #loadInitialTransactionData() {
		const result = await this.#client.queryTransactionBlocks({
			limit: 1,
			order: 'ascending',
			filter: {
				ToAddress: this.#keypair.toSuiAddress(),
			},
			options: {
				showObjectChanges: true,
				showInput: true,
			},
		});

		const address = this.#keypair.toSuiAddress();

		result.data[0]?.objectChanges?.forEach((objectChange) => {
			if (ownedAfterChange(objectChange, address)) {
				this.#initiallyOwnedObjects.add(normalizeSuiObjectId(objectChange.objectId));
			}
		});

		this.#creatorAddress = result.data[0]?.transaction?.data.sender;
	}
}

function ownedAfterChange(
	objectChange: SuiObjectChange,
	address: string,
): objectChange is Extract<SuiObjectChange, { type: 'created' | 'transferred' }> {
	if (objectChange.type === 'transferred' && isOwner(objectChange.recipient, address)) {
		return true;
	}

	if (objectChange.type === 'created' && isOwner(objectChange.owner, address)) {
		return true;
	}

	return false;
}

function isOwner(owner: ObjectOwner, address: string): owner is { AddressOwner: string } {
	return (
		owner &&
		typeof owner === 'object' &&
		'AddressOwner' in owner &&
		normalizeSuiAddress(owner.AddressOwner) === address
	);
}
