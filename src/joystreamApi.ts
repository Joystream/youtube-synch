import { WsProvider, ApiPromise } from "@polkadot/api";
import { types } from "@joystream/types";

const WSEndpoint = "wss://rome-rpc-endpoint.joystream.org:9944";

const joystreamApi = async () => {
  const api = await new ApiPromise({ provider: new WsProvider(WSEndpoint), types: types });

  await api.isReady;

  return api;
};

export default joystreamApi;
