`youtube-synch payRewards`
==========================

Pays reward to all Verified channels for the latest reward cycle

* [`youtube-synch payRewards`](#youtube-synch-payrewards)

## `youtube-synch payRewards`

Pays reward to all Verified channels for the latest reward cycle

```
USAGE
  $ youtube-synch payRewards

OPTIONS
  -d, --rationale=rationale              Reason why payment is being made
  -p, --joyPrice=joyPrice                (required) Price of JOY token
  -y, --yes                              Answer "yes" to any prompt, skipping any manual confirmations
  --payerMemberId=payerMemberId          (required) Joystream member Id of Reward payer account
  --queryNodeEndpoint=queryNodeEndpoint  [default: https://query.joystream.org/graphql] Query node endpoint to use

  --rpcEndpoint=rpcEndpoint              [default: wss://rpc.joystream.org:9944] RPC endpoint of the Joystream node to
                                         connect to
```
