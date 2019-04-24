module.exports = {
  port: 9001,
  session: {   // => *1000 /1000 express-session
    name: 'SID',
    secret: 'SID',
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 5 * 60 * 60 * 1000,  // 5hours -> millisecondes
    }
  },
  url: 'mongodb://localhost:27017/mygirls'
}
