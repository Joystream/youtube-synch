import { Video } from "./app";

export function generateTestVideos(n: number): Video[]{
    return [...Array(n).keys()].map(n => {
        return {
            id: `${n}`,
            description: 'This is a nice video',
            state: 'new',
            thumbnails: {
                default: 'https://i.pravatar.cc/600'
            },
            title: 'Cool cats',
            url: 'https://joystream.org'
        } as Video
    });
}