import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { bool } from "aws-sdk/clients/redshiftdata";
import { useState } from "react";
import { Channel } from "./app";
import { User } from "./usersList";

export function ChannelsList({user, onSelect}: {user: User, onSelect:(channel: Channel) => void}){
    const [channels, setChannels] = useState<Channel[]>([
        {
            id: '1',
            title: '808',
            description:'this is description',
            thumbnails: {
                default: 'https://i.pravatar.cc/300'
            },
            statistics:{
                videoCount: 100,
                commentCount: 1232313123123,
                subscriberCount: 1321000000,
                viewCount: 131231243412
            },
        }
    ])
    const handleSelect = (c: Channel) => {
        setSelected(c);
        onSelect(c);
    }
    const [selected, setSelected] = useState<Channel>()
    return <List sx={{width: '100%'}}>
        {channels.map(ch => <ChannelItem channel={ch} isSelected={selected?.id === ch.id} onSelect={handleSelect}/>)}
    </List>
}

function ChannelItem({channel, isSelected, onSelect}: {channel: Channel, isSelected: bool, onSelect:(channel: Channel) => void}){
    return <ListItem onClick={() => onSelect(channel)} selected={isSelected}>
        <ListItemAvatar>
            <Avatar src={channel.thumbnails.default}></Avatar>
        </ListItemAvatar>
        <ListItemText primary={channel.title} secondary={channel.description}></ListItemText>
    </ListItem>
}