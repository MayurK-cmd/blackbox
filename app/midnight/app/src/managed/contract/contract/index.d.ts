import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  set_registry_open(context: __compactRuntime.CircuitContext<PS>,
                    is_open_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  submit_proof(context: __compactRuntime.CircuitContext<PS>,
               submitter_public_key_0: Uint8Array,
               proof_hash_0: Uint8Array,
               pub_inputs_hash_0: Uint8Array,
               image_id_0: Uint8Array,
               reveal_provider_0: boolean,
               provider_code_0: bigint,
               reveal_input_0: boolean,
               input_code_0: bigint,
               reveal_output_0: boolean,
               output_code_0: bigint,
               reveal_timestamp_0: boolean,
               timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  check_verification(context: __compactRuntime.CircuitContext<PS>,
                     submitter_public_key_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  set_registry_open(context: __compactRuntime.CircuitContext<PS>,
                    is_open_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  submit_proof(context: __compactRuntime.CircuitContext<PS>,
               submitter_public_key_0: Uint8Array,
               proof_hash_0: Uint8Array,
               pub_inputs_hash_0: Uint8Array,
               image_id_0: Uint8Array,
               reveal_provider_0: boolean,
               provider_code_0: bigint,
               reveal_input_0: boolean,
               input_code_0: bigint,
               reveal_output_0: boolean,
               output_code_0: bigint,
               reveal_timestamp_0: boolean,
               timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  check_verification(context: __compactRuntime.CircuitContext<PS>,
                     submitter_public_key_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  set_registry_open(context: __compactRuntime.CircuitContext<PS>,
                    is_open_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  submit_proof(context: __compactRuntime.CircuitContext<PS>,
               submitter_public_key_0: Uint8Array,
               proof_hash_0: Uint8Array,
               pub_inputs_hash_0: Uint8Array,
               image_id_0: Uint8Array,
               reveal_provider_0: boolean,
               provider_code_0: bigint,
               reveal_input_0: boolean,
               input_code_0: bigint,
               reveal_output_0: boolean,
               output_code_0: bigint,
               reveal_timestamp_0: boolean,
               timestamp_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  check_verification(context: __compactRuntime.CircuitContext<PS>,
                     submitter_public_key_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly registry_open: boolean;
  readonly total_submissions: bigint;
  readonly total_checks: bigint;
  readonly nonce: bigint;
  is_verified: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  proof_hashes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  pub_inputs_hashes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  image_ids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  reveal_provider_flags: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  reveal_input_flags: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  reveal_output_flags: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  reveal_timestamp_flags: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  provider_codes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  input_codes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  output_codes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  proof_timestamps: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly last_checked_key: Uint8Array;
  readonly last_check_verified: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
