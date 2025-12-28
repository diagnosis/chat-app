import {renderHome,setupHome} from "../views/home.js";
import {renderChat, setupChat} from "../views/chat.js"


const Router = {
    routes : {
        "/": () =>{
            return renderHome()
        },
        "/chat": ()=>{
            return renderChat()
        },
    },
    afterRender : {
        "/" : () =>setupHome(),
        "/chat": () =>setupChat(),
    },
    init :()=> {
        window.addEventListener("popstate", ()=>{
            Router.go(location.pathname + location.search, false)
        })
        Router.go(location.pathname + location.search)
    },
    go :(path, addToHistory = true)=>{
      try {
          if(addToHistory){
              history.pushState({path}, null, path)
          }
          const pathName = path.split("?")[0]

          const view = Router.routes[pathName]
          if(!view){
              throw new Error("404 not found!")
          }

          const app = document.getElementById("app")
          app.innerHTML = view()

          const afterRender = Router.afterRender[pathName]

          if(afterRender){
              afterRender()
          }else{
              console.log("⚠️ no afterRender for:", pathName)
          }

      } catch (e) {
          console.log("❌ Routing error")
      }
    },
}

export default Router