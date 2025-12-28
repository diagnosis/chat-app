import Router from "../services/Router.js";

export function setupChat(){
	const params = new URLSearchParams(location.search)
	const username = params.get("username")

	if(!username){
		Router.go("/")
	}

	// Dynamic WebSocket URL based on current host
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	const host = window.location.host
	const wsUrl = `${protocol}//${host}/ws?username=${username}`

	console.log("Connecting to:", wsUrl)

	const ws = new WebSocket(wsUrl)

	ws.onopen = ()=>{
		console.log("connected!")
	}

	// Toggle users sidebar on mobile
	const toggleBtn = document.querySelector('.toggle-users')
	const sidebar = document.querySelector('.user-sidebar')

	if (toggleBtn) {
		toggleBtn.addEventListener('click', () => {
			sidebar.classList.toggle('hidden')
		})
	}

	ws.onmessage = (e)=>{
		const data = JSON.parse(e.data)
		if (data.message_type === 0 || data.message_type === 1){
			console.log(data)
			displaySystemMessage(data)
			updateUserList(data.online_users, username)
		}else if(data.message_type === 2){
			console.log("new message:", data)
			const isOwnMessage = data.sender === username
			const msgDiv = document.createElement("div")
			msgDiv.classList.add("max-w-[85%]", "md:max-w-[70%]", "rounded-lg", "px-3", "md:px-4", "py-2", "text-sm", "md:text-base")

			if (isOwnMessage) {
				msgDiv.classList.add("ml-auto", "bg-blue-500", "text-white")
			} else {
				msgDiv.classList.add("bg-gray-200", "text-gray-800")
			}
			msgDiv.innerText = data.content
			document.querySelector(".message").append(msgDiv)

			// Auto scroll to bottom
			const messagesDiv = document.querySelector(".message")
			messagesDiv.scrollTop = messagesDiv.scrollHeight
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
	const countMobile = document.querySelector(".user-count-mobile")

	count.innerText = onlineUsers.length.toString()
	if (countMobile) countMobile.innerText = onlineUsers.length.toString()

	const userList = document.querySelector(".user-list")
	userList.innerHTML = ""

	onlineUsers.forEach(user=>{
		const li = document.createElement("li")
		li.classList.add("rounded", "px-3", "py-2", "shadow-sm")
		li.innerText = user

		if(user === currentUsername){
			li.classList.add("bg-blue-600", "text-white")
		} else {
			li.classList.add("bg-white")
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
	const msgContainer = document.createElement("div")
	msgContainer.classList.add("flex", "justify-center")

	const msg = document.createElement("div")
	msg.classList.add("text-xs", "md:text-sm", "text-gray-500", "italic", "bg-gray-100", "px-3", "py-1", "rounded-full")
	msg.innerText = msgTxt

	msgContainer.appendChild(msg)
	document.querySelector(".message").append(msgContainer)
}

export function renderChat(){
	return `
    <div class="flex flex-col md:flex-row h-screen bg-gray-100">

  <!-- CHAT AREA -->
  <div class="flex flex-col flex-1 bg-white">

    <!-- Header (mobile only) -->
    <div class="md:hidden bg-blue-600 text-white p-3 flex items-center justify-between">
      <h1 class="font-semibold">Chat Room</h1>
      <button class="toggle-users text-sm bg-blue-700 px-3 py-1 rounded">
        Users (<span class="user-count-mobile">0</span>)
      </button>
    </div>

    <!-- Messages -->
    <div class="message flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
      <!-- Messages appear here -->
    </div>

    <!-- Input -->
    <div class="flex items-center gap-2 border-t p-3 md:p-4 bg-white">
      <input
        type="text"
        placeholder="Type a message..."
        class="flex-1 rounded-md border px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        class="rounded-md bg-blue-600 px-4 md:px-5 py-2 text-white text-sm md:text-base hover:bg-blue-700 whitespace-nowrap"
      >
        Send
      </button>
    </div>

  </div>

  <!-- ONLINE USERS SIDEBAR (hidden on mobile by default) -->
  <div class="user-sidebar hidden md:block w-full md:w-64 bg-gray-50 p-4 border-t md:border-t-0 md:border-l">

    <div class="mb-4 font-semibold">
      Online: <span class="user-count text-green-600">0</span>
    </div>

    <ul class="user-list space-y-2">
      <!-- Users appear here -->
    </ul>

  </div>

</div>
    `
}