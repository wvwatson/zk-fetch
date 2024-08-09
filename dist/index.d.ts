import * as _reclaimprotocol_witness_sdk_lib_proto_api from '@reclaimprotocol/witness-sdk/lib/proto/api';

declare enum HttpMethod {
    GET = "GET",
    POST = "POST"
}
declare enum LogType {
    VERIFICATION_STARTED = "VERIFICATION_STARTED",
    PROOF_GENERATED = "PROOF_GENERATED",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
type ProofRequestOptions = {
    log?: boolean;
    sessionId?: string;
};
type ApplicationId = string;
type ApplicationSecret = string;
type RequestUrl = string;
type ProviderId = string;
type NoReturn = void;
type SessionId = string;

interface Options {
    method: string;
    body?: string;
    headers?: {
        [key: string]: string;
    };
    geoLocation?: string;
}
interface secretOptions {
    body?: string;
    headers?: {
        [key: string]: string;
    };
}

declare class ReclaimClient {
    applicationId: string;
    applicationSecret: string;
    logs?: boolean;
    sessionId: string;
    constructor(applicationId: string, applicationSecret: string, logs?: boolean);
    zkFetch(url: string, options?: Options, secretOptions?: secretOptions, retries?: number, retryInterval?: number): Promise<_reclaimprotocol_witness_sdk_lib_proto_api.ClaimTunnelResponse | undefined>;
}

export { type ApplicationId, type ApplicationSecret, HttpMethod, LogType, type NoReturn, type ProofRequestOptions, type ProviderId, ReclaimClient, type RequestUrl, type SessionId };
