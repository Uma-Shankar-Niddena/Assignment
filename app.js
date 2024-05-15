const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const datefrns = require('date-fns')
var isValid = require('date-fns/isValid')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'todoApplication.db')

let db = null
const initializeTheserverDb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started. enjoy pandagow')
    })
  } catch (e) {
    console.log(`issue at ${e.message}`)
    process.exit(1)
  }
}
initializeTheserverDb()

const statusValues = ['TO DO', 'IN PROGRESS', 'DONE']
const priorityValues = ['HIGH', 'MEDIUM', 'LOW']
const categoryValues = ['WORK', 'HOME', 'LEARNING']

//// GET method for all scenarios 

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q, category} = request.query

  if (statusValues.includes(status)) {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE status="${status}"`
    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (priorityValues.includes(priority)) {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE priority="${priority}"`
    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (priority === 'HIGH' && status === 'IN PROGRESS') {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE status="${status} " AND priority="${priority}"`
    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (search_q === 'Buy') {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE todo LIKE "%${search_q}%"`

    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (category === 'HOME') {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE category="${category}"`

    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (category === 'WORK' && status === 'DONE') {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE category="${category}" AND status="${status}"`

    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (category === 'LEARNING' && priority === 'HIGH') {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE category="${category}" AND priority="${priority}"`

    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else if (status !== undefined && !statusValues.includes(status)) {
    response.status(400)

    response.send('Invalid Todo Status')
  } else if (priority !== undefined && !priorityValues.includes(priority)) {
    response.status(400)

    response.send('Invalid Todo Priority')
  } else if (category !== undefined && !categoryValues.includes(category)) {
    response.status(400)

    response.send('Invalid Todo Category')
  }
})
//// Using Get method to get a specific todo With todo Id ///

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE id=${todoId}`
  const resfromDb = await db.get(query)
  response.send(resfromDb)
})

/// GET for to check the valid Date///

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  var result = isValid(new Date(date))

  if (result) {
    const query = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE due_date="${date}"`
    const resfromDb = await db.all(query)
    response.send(resfromDb)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

//// api -- 4
app.post('/todos/', async (request, response) => {
  const reqdetails = request.body
  const {id, todo, priority, status, category, dueDate} = reqdetails

  const resultdate = isValid(new Date(dueDate))
  if (status !== undefined && !statusValues.includes(status)) {
    response.status(400)
    response.send('Invalid Todo Status')
  } else if (priority !== undefined && !priorityValues.includes(priority)) {
    response.status(400)
    response.send('Invalid Todo Priority')
  } else if (category !== undefined && !categoryValues.includes(category)) {
    response.status(400)
    response.send('Invalid Todo Category')
  } else if (dueDate !== undefined && !isValid(new Date(dueDate))) {
    response.status(400)
    response.send('Invalid Due Date')
  } else if (
    status !== undefined &&
    priority !== undefined &&
    id !== undefined &&
    dueDate !== undefined &&
    todo !== undefined &&
    category !== undefined
  ) {
    const query = `INSERT INTO todo(id,todo,priority,status,category,due_date) VALUES(${id},"${todo}","${priority}","${status}","${category}","${dueDate}")`
    const resfromDb = await db.run(query)
    response.send('Todo Successfully Added')
  }
})

//// Updting todo with PUT Method///

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const updateDetails = request.body
  const {id, todo, status, priority, category, dueDate} = updateDetails
  if (status !== undefined && !statusValues.includes(status)) {
    response.status(400)
    response.send('Invalid Todo Status')
  } else if (priority !== undefined && !priorityValues.includes(priority)) {
    response.status(400)
    response.send('Invalid Todo Priority')
  } else if (category !== undefined && !categoryValues.includes(category)) {
    response.status(400)
    response.send('Invalid Todo Category')
  } else if (dueDate !== undefined && !isValid(new Date(dueDate))) {
    response.status(400)
    response.send('Invalid Due Date')
  } else if (
    status !== undefined ||
    priority !== undefined ||
    id !== undefined ||
    dueDate !== undefined ||
    todo !== undefined ||
    category !== undefined
  ) {
    let resValues = ''
    switch (true) {
      case updateDetails.status !== undefined:
        resValues = 'Status'
        break
      case updateDetails.todo !== undefined:
        resValues = 'Todo'
        break
      case updateDetails.priority !== undefined:
        resValues = 'Priority'
        break
      case updateDetails.category !== undefined:
        resValues = 'Category'
        break
      case updateDetails.dueDate !== undefined:
        resValues = 'Due Date'
        break
    }

    const finalquery = `UPDATE todo SET 
     status = CASE
        WHEN ${statusValues.includes(status)} THEN "${status}"
        ELSE status
    END,
    priority = CASE
        WHEN ${priorityValues.includes(priority)} THEN "${priority}"
        ELSE priority
    END,
    category = CASE
        WHEN ${categoryValues.includes(category)} THEN "${category}"
        ELSE category
    END
     WHERE id=${todoId}`
    const findalres = await db.run(finalquery)

    response.send(`${resValues} Updated`)
  }
})
//// DELETE
app.delete("/todos/:todoId/", async (request,response)=>{
  const {todoId}=request.params
  const query=`DELETE FROM todo WHERE id=${todoId}`
  const resfromDb=await db.run(query)
  response.send("Todo Deleted")
})
module.exports = app
