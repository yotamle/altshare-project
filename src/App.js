import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    // render rooms to the application
    sortAndSetRooms()
  }, [])

  const sortAndSetRooms = async () => { // Set rooms to the state after connect the user into their rooms
    const rooms = await getRooms()
    setRooms(rooms)
  }
  const getRooms = async () => {
    //fetch data and return JSON
    const usersRaw = await fetch(
      'https://61f992ba69307000176f7330.mockapi.io/users'
    )
    const users = await usersRaw.json()
    const roomsRaw = await fetch(
      'https://61f992ba69307000176f7330.mockapi.io/rooms'
    )
    const rooms = await roomsRaw.json()

    const roomsMap = rooms.reduce((acc, currentRoom) => {
      // set Key to Room ID
      acc[currentRoom.id] = currentRoom
      return acc
    }, {})

    users.forEach((user) => {
      // check if user is already existed or need to create new
      if (roomsMap[user.roomId]) {
        if (roomsMap[user.roomId].users) {
          roomsMap[user.roomId].users.push(user)
        } else {
          roomsMap[user.roomId].users = [user]
        }
      }
    })
    return Object.values(roomsMap) // return the object with key: values
  }

  const removeUserHandle = (id, idx) => {
    // remove users and check if there is one admin left in the room
    const admins = rooms[idx].users.filter((user) => user.isAdmin) // check if user is admin
    if (admins.length === 1 && admins[0].id === id) return // check if there is one admin left in the room and if the admin ID is the right admin
    const filteredUsers = rooms[idx].users.filter((user) => user.id !== id) // delete the user from the room
    const roomsCopy = [...rooms] // spread the copy of the rooms are left
    roomsCopy[idx].users = filteredUsers
    setRooms(roomsCopy) //set new room array to the State
  }

  return (
    <div className='App'>
      <div className='container'>
        {rooms &&
          rooms.map((room, idx) => {
            const status = room.users.every((user) => user.isAdmin) // if every user is a admin, change room to inactive
              ? 'inactive'
              : room.isActive
              ? 'active'
              : 'inactive'
            return (
              <div key={room.id} className={`rooms ${room.id}`}>
                <div className='room-title'>
                  <span>ROOM ID: {room.id}</span>
                  {room.users && <span>{room.users.length}</span>}
                  <p className={status}>{status}</p>
                </div>
                <div className='room-content'>
                  {room.users &&
                    room.users.map((user) => (
                      <div key={user.id} className='user'>
                        <span>{user.firstName}</span>
                        <span>{user.lastName}</span>
                        <span>{user.email}</span>
                        <p>{user.isAdmin ? 'Admin' : 'User'}</p>
                        <span>{user.roomId}</span>
                        <button
                          onClick={
                            (e) => removeUserHandle(user.id, idx) // remove user handle
                          }
                          className='remove-btn'
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default App
