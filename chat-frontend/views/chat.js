import Router from "../services/Router.js";




export function setupChat(){
	const params = new URLSearchParams(location.search)
	const username = params.get("username")

	if(!username){
		Router.go("/")
	}

	// Dynamic WebSocket URL based on current host
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	const host = window.location.host  // e.g., "chat-app-sd.fly.dev" or "localhost:8080"
	const wsUrl = `${protocol}//${host}/ws?username=${username}`

	console.log("Connecting to:", wsUrl)  // Debug

	const ws = new WebSocket(wsUrl)
	ws.onopen = ()=>{
		console.log("connected!")
	}
	ws.onmessage = (e)=>{
		const data = JSON.parse(e.data)
		if (data.message_type === 0 || data.message_type === 1){
			console.log(data)
			displaySystemMessage(data)
			updateUserList(data.online_users, data.sender)
		}else if(data.message_type === 2){
			console.log("new message:", data)
			const isOwnMessage = data.sender === username
			const msgDiv = document.createElement("div")
			msgDiv.classList.add("max-w-[70%]", "rounded-lg", "px-4", "py-2")

			if (isOwnMessage) {
				msgDiv.classList.add("ml-auto", "bg-blue-500", "text-white")
			} else {
				msgDiv.classList.add("bg-gray-200", "text-gray-800")
			}
			msgDiv.innerText = data.content
			document.querySelector(".message").append(msgDiv)
		}
	}
	function sendMessage(){
		const input = document.querySelector("input")
		const content = input.value.trim()
		if(!content){
			return
		}
		ws.send(JSON.stringify({action: "chat", content:content}))
		input.value = ""
	}
	document.querySelector("button").addEventListener("click", sendMessage)
	document.querySelector("input").addEventListener("keypress", (e)=>{
		if(e.key === "Enter"){
			sendMessage()
		}
	})

	ws.onclose = ()=>{
		console.log("disconnected!")
	}
}

function updateUserList(onlineUsers, currentUsername){
	const count = document.querySelector(".user-count")
	count.innerText = onlineUsers.length.toString()
	const userList = document.querySelector(".user-list")
	userList.innerHTML = ""
	onlineUsers.forEach(user=>{
		const li = document.createElement("li")
		li.innerText = user
		if(user === currentUsername){
			li.classList.add("bg-blue-600", "text-white")
		}
		userList.append(li)
	})
}
function displaySystemMessage(data){
	let msgTxt
	if (data.message_type === 0){
		msgTxt = `${data.sender} joined the chat`
	}else{
		msgTxt = `${data.sender} left the chat`
	}
	const msg = document.createElement("div")
	msg.classList.add("text-sm", "text-gray-500", "italic", "bg-gray-100", "px-3", "py-1", "rounded-full")
	msg.innerText = msgTxt
	document.querySelector(".message").append(msg)
}


export function renderChat(){
	return `
	<div class="flex h-screen bg-gray-100">

  <!-- LEFT: CHAT AREA -->
  <div class="flex flex-col flex-1 bg-white border-r">

    <!-- Messages -->
    <div class="message flex-1 overflow-y-auto p-4 space-y-3">
<!--      <div class="max-w-[70%] rounded-lg bg-gray-200 px-4 py-2">-->
<!--        Hello everyone!-->
<!--      </div>-->
<!--      <div class="ml-auto max-w-[70%] rounded-lg bg-blue-500 text-white px-4 py-2">-->
<!--        Hi 👋-->
<!--      </div>-->
    </div>

    <!-- Input -->
    <div class="flex items-center gap-2 border-t p-4">
      <input
        type="text"
        placeholder="Type a message..."
        class="flex-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        class="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Send
      </button>
    </div>

  </div>

  <!-- RIGHT: ONLINE USERS -->
  <div class="w-64 bg-gray-50 p-4">

    <div class="mb-4 font-semibold">
      Online: <span class="user-count text-green-600">0</span>
    </div>

    <ul class="user-list space-y-2">
      <li class="rounded bg-white px-3 py-2 shadow-sm">Alice</li>
      <li class="rounded bg-white px-3 py-2 shadow-sm">Bob</li>
      <li class="rounded text-white bg-blue-600 px-3 py-2 shadow-sm">You</li>
    </ul>

  </div>

</div>
	`
}




