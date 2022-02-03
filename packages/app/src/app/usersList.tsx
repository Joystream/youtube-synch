import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { useState } from "react";
import { useQuery } from "react-query";
import axios from 'axios'

export interface User{
    id: string,
    email: string,
    youtubeUsername: string,
    avatarUrl: string,
}

export function UsersList({onSelect}: {onSelect: (user: User) => void}){
    const {isLoading, error, data} = useQuery('users', ({signal}) => axios
        .get<User[]>('http://localhost:3001/users', {signal})
        .then(resp => resp.data))
    const [selected, setSelected] = useState<User>()
    const handleSelecction = (user: User) => {
        setSelected(user)
        onSelect(user)
    }
    return <List sx={{width: '100%'}} >
        {isLoading ? "Loading..." : data?.map(user => <UserItem 
            user={user} 
            isSelected={user.id===selected?.id ?? false}
            onSelect={handleSelecction}/>)}
    </List>
}

export function UserItem({user, isSelected, onSelect}: {user: User, isSelected: boolean, onSelect:(user: User) => void}){
    return <ListItem selected={isSelected} onClick={(e) => onSelect(user)}>
        <ListItemAvatar>
            <Avatar src={user.avatarUrl}>
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={user.youtubeUsername} secondary={user.email}></ListItemText>
    </ListItem>
}