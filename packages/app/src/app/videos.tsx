import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material"
import axios from "axios"
import { useState } from "react"
import { useQuery } from "react-query"
import { Channel, Video } from "./app"
import { generateTestVideos } from "./generateVideos"
import { User } from "./usersList"


export function Videos({channel, user}: {channel: Channel, user: User}){
    const {isLoading, error, data} = useQuery('videos', ({signal}) => axios
        .get<Video[]>(`http://localhost:3001/users/${user.id}/channels/${channel.id}/videos`, {signal})
        .then(resp => resp.data))
    return <Grid container spacing={4} direction={'row'}
     justifyContent={'flex-start'}
     alignItems={'flex-start'}
     sx={{py: 1, height:'100%', overflow: 'auto'}}>
        {isLoading ? "Loading..." : data?.map(video => <Grid item>
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
                {video.state}
            </Typography>
        </CardContent>
    </Card>
}