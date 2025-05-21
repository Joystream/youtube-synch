`youtube-synch payRewardForChannel`
===================================

Pays reward to all Verified channels for the latest reward cycle

* [`youtube-synch payRewardForChannel`](#youtube-synch-payrewardforchannel)

## `youtube-synch payRewardForChannel`

Pays reward to all Verified channels for the latest reward cycle

```
USAGE
  $ youtube-synch payRewardForChannel

OPTIONS
  -c, --channelId=channelId              (required) Gleev channel Id
  -d, --rationale=rationale              Reason why payment is being made
  -p, --joyPrice=joyPrice                (required) Price of JOY token
  -y, --yes                              Answer "yes" to any prompt, skipping any manual confirmations
  --payerMemberId=payerMemberId          (required) Joystream member Id of Reward payer account
  --queryNodeEndpoint=queryNodeEndpoint  [default: https://query.joystream.org/graphql] Query node endpoint to use

  --rpcEndpoint=rpcEndpoint              [default: wss://rpc.joystream.org] RPC endpoint of the Joystream node to
                                         connect to
```
