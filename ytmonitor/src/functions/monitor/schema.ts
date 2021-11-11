export default {
    type: "object",
    properties: {
        username: { type: 'string' },
        playlistId: { type: 'string' },
        channelId: { type: 'string' }
    },
    required: ['username']
} as const;
