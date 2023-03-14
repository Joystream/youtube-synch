export const SyncMultipleChannelsInputSchema = {
  type: 'array',
  additionalProperties: false,
  items: {
    type: 'object',
    properties: {
      channelUrl: {
        type: 'string',
      },
      videosLimit: {
        type: 'integer',
      },
    },
  },
}
