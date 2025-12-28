import Router from "../services/Router.js";

export function renderHome() {
	return `
      <div class="home-container flex min-h-screen items-center justify-center bg-gray-100">

  <div class="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

    <h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">
      Welcome to Chat App!
    </h1>

    <p class="mb-6 text-center text-gray-500">
      Please enter a username to join the chat
    </p>

    <form class="flex flex-col gap-4">

      <div class="flex flex-col gap-1">
        <label for="username" class="text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          placeholder="Your name..."
          class="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        class="rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition"
      >
        Join Chat
      </button>

    </form>

  </div>

</div>
    `
}

export function setupHome(){
	const form = document.querySelector("form")
	let input = document.querySelector("#username")
	form.addEventListener("submit", (e)=>{
		e.preventDefault()
		Router.go(`/chat?username=${input.value}`)
	})
}