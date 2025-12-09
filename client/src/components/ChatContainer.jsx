import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {

    const { selectedUser, setSelectedUser, messages, getMessages, sendMessage } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)

    const scrollEnd = useRef(null)
    const [input, setInput] = useState('')

    const handleSendMessage = async(e)=>{
          e.preventDefault()
          if(input.trim() === "") return null
          await sendMessage({text: input.trim()})
          setInput("")
    }

    const handleSendImage = async(e)=>{
          const file = e.target.files[0]
          if(!file  || !file.type.startsWith("image/")){
              toast.error("Select an image file")
              return
          }
          const reader = new FileReader()
          reader.onloadend = async()=>{
              await sendMessage({image: reader.result})
              e.target.value = ""
          }
          reader.readAsDataURL(file)
    }

    useEffect(()=>{
        if(selectedUser){
            getMessages(selectedUser._id)
        }
    },[selectedUser])

    useEffect(() => {
         if(scrollEnd.current && messages){
            scrollEnd.current.scrollIntoView({behavior: "smooth"})
         }
    },[messages])

    return selectedUser ? (
        <div className='h-full overflow-scroll backdrop-blur-lg relative'>
            {/* header  */}
            <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
                <img src={ selectedUser.profilePic || assets.avatar_icon} alt="profile_martin" className='w-8 h-8 object-cover rounded-full' />
                <p className="flex-1 text-lg text-white flex gap-2 items-center">
                    {selectedUser.fullName}
                    {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="arrow_icon" className='md:hidden max-w-7' />
                <img src={assets.help_icon} alt="help_icon" className='max-md:hidden max-w-5' />
            </div>
            {/* chat area  */}
            <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
                {
                    messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
                            {
                                msg.image ? (
                                    <img src={msg.image} alt="image" className='max-w-[230px] border border-gray-700  rounded-lg overflow-hidden mb-8' />
                                ) : (
                                    <p className={`max-w-[200px] p-2 md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'} `}>{msg.text}</p>
                                )
                            }
                            <div className="text-xs text-center">
                                <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} alt="profile_martin" className='w-7 h-7 object-cover rounded-full'/>
                                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                            </div>
                        </div>
                    ))
                }
                <div ref={scrollEnd}></div>
            </div>
            {/* bottom area  */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                 <div className="flex flex-1 items-center bg-gray-100/12 px-3 rounded-full">
                    <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder="Send a message..." onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null}
                      className='text-sm flex-1 p-3 border-none outline-none rounded-lg text-white placeholder-gray-400' />
                    <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden/>
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="gallery_icon" className='cursor-pointer w-5 mr-2 ' />
                    </label>
                 </div>
                 <div className="">
                    <img onClick={handleSendMessage} src={assets.send_button} alt="send_button" className="w-7 cursor-pointer" />
                 </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 max-md:hidden bg-white/10">
            <img src={assets.logo_icon} alt="logo_icon" className='max-w-16' />
            <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
        </div>
    )
}

export default ChatContainer
