/**
 * @name developerMode
 * @description enable Disord's developer mode
 * @author DoggyBootsy
 * @version 1.0.0
 * @authorId 515780151791976453
 */

const { webpack, plugins, Patcher } = DrApi
const developerModule = webpack.getModuleByProps("isDeveloper")
const currentUserStore = webpack.getModuleByProps("getCurrentUser")
const dispatcher = webpack.getModuleByProps("dirtyDispatch", "dispatch")

return class developerMode {
  onLoad() {
    const user = currentUserStore.getCurrentUser()
    this.originalFlag = user.flags

    dispatcher.subscribe("CONNECTION_OPEN", ({ user }) => this.originalFlag = user.flags)

    try {
      Object.defineProperty(developerModule, "isDeveloper", {
        configurable: true,
        get: () => plugins.isEnabled(this.constructor.name)
      })
    } 
    catch (error) {}
  }
  onStart() {
    currentUserStore.getCurrentUser().flags = 1

    Patcher.after(this.constructor.name, currentUserStore, "getCurrentUser", (that, args, res) => {
      res.flags = 1
      return res
    })
  }
  onStop() {
    DrApi.Patcher.unpatchAll(this.constructor.name)

    currentUserStore.getCurrentUser().flags = this.originalFlag
  }
}
