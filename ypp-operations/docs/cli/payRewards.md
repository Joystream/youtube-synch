# `youtube-synch payRewards`

Pays reward to all Verified YPP channels for the latest reward cycle based on the calculated rewards in hubspot

- [`youtube-synch payRewards`](#youtube-synch-payrewards)

## `youtube-synch payRewards`

Pays reward to all Verified YPP channels for the latest reward cycle based on the calculated rewards in hubspot

```
USAGE
  $ youtube-synch payRewards

OPTIONS
  -b, --batchSize=batchSize              [default: 1] Number of channels to pay rewards to in a single transaction,
                                         should be a number b/w 1-100

  -d, --rationale=rationale              Reason why payment is being made

  -p, --joyPrice=joyPrice                (required) Price of JOY token

  -y, --yes                              Answer "yes" to any prompt, skipping any manual confirmations

  --payerMemberId=payerMemberId          (required) Joystream member Id of Reward payer account

  --queryNodeEndpoint=queryNodeEndpoint  [default: https://query.joystream.org/graphql] Query node endpoint to use

  --rpcEndpoint=rpcEndpoint              [default: wss://rpc.joystream.org] RPC endpoint of the Joystream node to
                                         connect to
```
