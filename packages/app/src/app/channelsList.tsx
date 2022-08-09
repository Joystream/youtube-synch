import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { bool } from 'aws-sdk/clients/redshiftdata'
import axios from 'axios'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { Channel } from './app'
import { User } from './usersList'

export function ChannelsList({ user, onSelect }: { user: User; onSelect: (channel: Channel) => void }) {
  const { isLoading, error, data } = useQuery('channels', ({ signal }) =>
    axios.get<Channel[]>(`http://localhost:3001/users/${user.id}/channels`, { signal }).then((resp) => resp.data)
  )
  const handleSelect = (c: Channel) => {
    setSelected(c)
    onSelect(c)
  }
  const [selected, setSelected] = useState<Channel>()
  return (
    <List sx={{ width: '100%' }}>
      {isLoading
        ? 'Loading...'
        : data?.map((ch) => <ChannelItem channel={ch} isSelected={selected?.id === ch.id} onSelect={handleSelect} />)}
    </List>
  )
}

function ChannelItem({
  channel,
  isSelected,
  onSelect,
}: {
  channel: Channel
  isSelected: bool
  onSelect: (channel: Channel) => void
}) {
  return (
    <ListItem onClick={() => onSelect(channel)} selected={isSelected}>
      <ListItemAvatar>
        <Avatar src={channel.thumbnails.default}></Avatar>
      </ListItemAvatar>
      <ListItemText primary={channel.title} secondary={channel.description}></ListItemText>
    </ListItem>
  )
}
