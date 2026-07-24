import app from './server'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`Database: ${process.env.DATABASE_URL}`)
})
