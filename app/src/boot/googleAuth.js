import vue3GoogleLogin from 'vue3-google-login'

// import GAuth from 'vue3-google-oauth2'

const vue3GoogleLoginOPtions = {
    clientId: '447929018043-ms8imgr00m90hnun31pno4gm5psfacgi.apps.googleusercontent.com',
    // scope: 'email',
    // prompt: 'consent',
}
const GAuthOptions = {
    clientId: '447929018043-ms8imgr00m90hnun31pno4gm5psfacgi.apps.googleusercontent.com',
    scope: 'email',
    prompt: 'consent',
    fetch_basic_profile: false 
}
export default ({ app }) => {
  app.use(vue3GoogleLogin , vue3GoogleLoginOPtions)
  // app.use(GAuth , GAuthOptions)
}
