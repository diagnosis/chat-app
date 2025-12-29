import Router from "../services/Router.js";

let ws
let reconnectTimer
let username

export function setupChat(){
	const params = new URLSearchParams(location.search)
	username = params.get("username")

	if(!username){
		Router.go("/")
		return
	}

	// Start connection
	connect()

	// Toggle users sidebar on mobile
	const toggleBtns = document.querySelectorAll('.toggle-users')
	const sidebar = document.querySelector('.user-sidebar')

	toggleBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			sidebar.classList.toggle('hidden')
		})
	})

	// Send message handlers (set up once)
	document.querySelector(".send-btn").addEventListener("click", sendMessage)
	document.querySelector(".message-input").addEventListener("keypress", (e)=>{
		if(e.key === "Enter"){
			sendMessage()
		}
	})
}
let reconnectAttempts = 0
const MAX_RECONNECTS = 5  // Stop after 5 tries

function connect() {
	if (reconnectAttempts >= MAX_RECONNECTS) {
		console.log("Max reconnection attempts reached. Please refresh.")
		showStatus("Connection failed. Refresh page.", "red")
		return
	}
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	const host = window.location.host
	const wsUrl = `${protocol}//${host}/ws?username=${username}`

	console.log("Connecting to:", wsUrl)

	ws = new WebSocket(wsUrl)

	ws.onopen = ()=>{
		reconnectAttempts = 0
		console.log("✅ WebSocket CONNECTED")
		showStatus("Connected", "green")
	}

	ws.onmessage = (e)=>{
		console.log("📨 Message received:", e.data)
		const data = JSON.parse(e.data)

		if (data.message_type === 0 || data.message_type === 1){
			displaySystemMessage(data)
			updateUserList(data.online_users, username)
		}else if(data.message_type === 2){
			displayChatMessage(data, username)
		}
	}

	ws.onerror = (err) => {
		console.error("❌ WebSocket ERROR:", err)
		showStatus("Error", "red")
	}

	ws.onclose = (event)=>{
		reconnectAttempts++
		console.log(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECTS}`)
		console.log("🔌 WebSocket CLOSED")
		console.log("Close code:", event.code)
		showStatus("Reconnecting...", "orange")

		// Auto-reconnect after 2 seconds
		clearTimeout(reconnectTimer)
		reconnectTimer = setTimeout(connect, 2000)
	}
}

function sendMessage(){
	const input = document.querySelector(".message-input")
	const content = input.value.trim()

	if(!content){
		return
	}

	if(ws && ws.readyState === WebSocket.OPEN){
		ws.send(JSON.stringify({action: "chat", content: content}))
		input.value = ""
	} else {
		console.log("WebSocket not ready")
		showStatus("Connecting...", "orange")
	}
}

function showStatus(text, color) {
	const status = document.querySelector('.connection-status')
	if (status) {
		status.textContent = text
		status.className = `connection-status text-xs px-2 py-1 rounded ${
			color === 'green' ? 'bg-green-100 text-green-700' :
				color === 'orange' ? 'bg-orange-100 text-orange-700' :
					'bg-red-100 text-red-700'
		}`
	}
}

function updateUserList(onlineUsers, currentUsername){
	const counts = document.querySelectorAll(".user-count, .user-count-mobile")
	counts.forEach(count => {
		count.innerText = onlineUsers.length.toString()
	})

	const userList = document.querySelector(".user-list")
	userList.innerHTML = ""

	onlineUsers.forEach(user=>{
		const li = document.createElement("li")
		li.classList.add("rounded-lg", "px-3", "py-2.5", "shadow-sm", "text-sm", "md:text-base", "transition-colors")

		if(user === currentUsername){
			li.classList.add("bg-blue-600", "text-white", "font-medium")
			li.innerHTML = `${user} <span class="text-xs opacity-75">(you)</span>`
		} else {
			li.classList.add("bg-white", "text-gray-700", "hover:bg-gray-100")
			li.innerText = user
		}
		userList.append(li)
	})
}

function displayChatMessage(data, currentUsername){
	const isOwnMessage = data.sender === currentUsername
	const timestamp = new Date().toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	})

	const msgContainer = document.createElement("div")
	msgContainer.classList.add("flex", "mb-3")

	if (isOwnMessage) {
		msgContainer.classList.add("justify-end")
	} else {
		msgContainer.classList.add("justify-start")
	}

	const msgWrapper = document.createElement("div")
	msgWrapper.classList.add("max-w-[85%]", "sm:max-w-[75%]", "md:max-w-[65%]", "lg:max-w-[55%]")

	if (!isOwnMessage) {
		const senderName = document.createElement("div")
		senderName.classList.add("text-xs", "font-semibold", "text-gray-600", "mb-1", "px-1")
		senderName.innerText = data.sender
		msgWrapper.appendChild(senderName)
	}

	const msgBubble = document.createElement("div")
	msgBubble.classList.add("rounded-2xl", "px-3", "py-2", "md:px-4", "md:py-2.5", "break-words")

	if (isOwnMessage) {
		msgBubble.classList.add("bg-blue-500", "text-white", "rounded-br-md")
	} else {
		msgBubble.classList.add("bg-gray-200", "text-gray-800", "rounded-bl-md")
	}

	const contentDiv = document.createElement("div")
	contentDiv.classList.add("text-sm", "md:text-base", "whitespace-pre-wrap", "mb-1")
	contentDiv.innerText = data.content

	const timeDiv = document.createElement("div")
	timeDiv.classList.add("text-xs", "opacity-70", "text-right")
	timeDiv.innerText = timestamp

	msgBubble.appendChild(contentDiv)
	msgBubble.appendChild(timeDiv)
	msgWrapper.appendChild(msgBubble)
	msgContainer.appendChild(msgWrapper)

	document.querySelector(".message").append(msgContainer)

	const messagesDiv = document.querySelector(".message")
	messagesDiv.scrollTop = messagesDiv.scrollHeight
}

function displaySystemMessage(data){
	let msgTxt
	if (data.message_type === 0){
		msgTxt = `${data.sender} joined the chat`
	}else{
		msgTxt = `${data.sender} left the chat`
	}
	const msgContainer = document.createElement("div")
	msgContainer.classList.add("flex", "justify-center", "my-2")

	const msg = document.createElement("div")
	msg.classList.add("text-xs", "md:text-sm", "text-gray-500", "italic", "bg-gray-100", "px-3", "py-1", "rounded-full")
	msg.innerText = msgTxt

	msgContainer.appendChild(msg)
	document.querySelector(".message").append(msgContainer)
}

export function renderChat(){
	return `
    <div class="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">

  <!-- CHAT AREA -->
  <div class="flex flex-col flex-1 bg-white min-w-0">

    <!-- Header -->
    <div class="bg-blue-600 text-white p-3 md:p-4 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-2">
        <h1 class="font-semibold text-base md:text-lg">Chat Room</h1>
        <span class="connection-status text-xs px-2 py-1 rounded bg-green-100 text-green-700">Connecting...</span>
      </div>
      <button class="toggle-users text-xs md:text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-md transition-colors">
        Users (<span class="user-count-mobile md:hidden">0</span><span class="hidden md:inline user-count">0</span>)
      </button>
    </div>

    <!-- Messages -->
    <div class="message flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50">
      <!-- Messages appear here -->
    </div>

    <!-- Input -->
    <div class="flex items-center gap-2 border-t p-3 md:p-4 bg-white shadow-lg">
      <input
        type="text"
        placeholder="Type a message..."
        class="message-input flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        class="send-btn rounded-full bg-blue-600 px-5 md:px-6 py-2 text-white text-sm md:text-base font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap"
      >
        Send
      </button>
    </div>

  </div>

  <!-- ONLINE USERS SIDEBAR -->
  <div class="user-sidebar fixed md:relative inset-0 md:inset-auto z-50 md:z-auto hidden md:block w-full md:w-64 bg-gray-50">

    <div class="h-full flex flex-col">
      <!-- Mobile close button -->
      <div class="md:hidden bg-blue-600 text-white p-3 flex items-center justify-between">
        <h2 class="font-semibold">Online Users</h2>
        <button class="toggle-users text-xl">&times;</button>
      </div>

      <div class="p-4 flex-1 overflow-y-auto">
        <div class="mb-4 font-semibold text-sm md:text-base">
          Online: <span class="user-count text-green-600">0</span>
        </div>

        <ul class="user-list space-y-2">
          <!-- Users appear here -->
        </ul>
      </div>
    </div>

  </div>

</div>
    `
}