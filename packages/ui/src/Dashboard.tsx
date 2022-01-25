import React from 'react'
import {useState, useEffect} from 'react'
import { User, Video } from '../../ytube/src'
import axios from 'axios'
import {Stack, Container, Avatar, Box, List, ListItem, ListItemAvatar, ListItemText} from '@mui/material'
interface DashboardProps{
    user: User
}
const Dashboard: React.FC<DashboardProps> = (props) => {
    const [videos, setVideos] = useState<Video[]>();
    useEffect(() => {
        if(props.user)
          axios.get<Video[]>(`http://localhost:3001/users/${props.user.id}/videos`)
          .then(response => setVideos(response.data))
      }, [props.user]);
    return  <Stack direction="column" spacing={4}>
                <Box display={'flex'} flexDirection='column'>
                    <Avatar alt={props.user.youtubeUsername} src={props.user.avatarUrl}></Avatar>
                    <h2>{props.user.youtubeUsername}</h2>
                </Box>
                <Box>
                {videos ? <VideosList videos={videos}></VideosList> : <h2> No videos yet </h2>}
                </Box>
        </Stack>
}
const VideosList:React.FC<{videos: Video[]}> = (props) => {
    return <List>
    {props.videos.map(video => {
        return <ListItem>
            <ListItemAvatar>
                <Avatar alt={video.title} src={video.thumbnails.default}></Avatar>
            </ListItemAvatar>
            <ListItemText primary={video.title} secondary={video.state}/>
        </ListItem>
    })}
    </List>
}
export default Dashboard