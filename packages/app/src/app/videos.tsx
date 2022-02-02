import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material"
import { useState } from "react"
import { Channel, Video } from "./app"
import { generateTestVideos } from "./generateVideos"
import { User } from "./usersList"


export function Videos({channel, user}: {channel: Channel, user: User}){
    const [videos, setVideos] = useState<Video[]>(generateTestVideos(100))
    return <Grid container spacing={4} direction={'row'}
     justifyContent={'flex-start'}
     alignItems={'flex-start'}
     sx={{py: 1, maxHeight:'100%', overflow: 'scroll'}}>
        {videos.map(video => <Grid item>
            <VideoCard video={video}></VideoCard>
        </Grid>)}
    </Grid>
}

function VideoCard({video}: {video: Video}){
    return <Card sx={{maxWidth: 320}}>
        <CardMedia component={'img'} height={120} image={video.thumbnails.default}/>
        <CardContent>
            <Typography variant="h5" component="div">{video.title}</Typography>
            <Typography variant="body2" color="text.secondary">
                {video.description}
            </Typography>
        </CardContent>
    </Card>
}