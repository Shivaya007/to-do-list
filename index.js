import express from "express";
import bodyParser from "body-parser";
import path from "path"; 
import { fileURLToPath } from 'url'; 
import pg from 'pg';
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
const db = new pg.Client({
  user: "postgres",
  host:"localhost",
  database: "world",
  password:"shivaya123",
  port: 5432,
});
db.connect();

async function checkVisited() {
  try {
    const result = await db.query('SELECT task_list, task_time FROM todoList');
    return result.rows; // Return rows directly
    
  } catch (err) {
    console.error('Query error', err.stack);
    return [];
  }
}

app.get('/', async (req, res) => {
  try {
    const tasks = await checkVisited();
    res.render('index', { todoo: tasks });
  } catch (err) {
    console.error('Get request error', err.stack);
    res.status(500).send('Server error');
  }
});

  app.post('/add', async (req, res) => {
    const task = req.body.task;
    const time = req.body.time;
    if (task && time) {
      try {
        await db.query(
          'INSERT INTO todoList (task_list, task_time) VALUES ($1, $2)',
          [task, time]
        );
      } catch (err) {
        console.error('Insert error', err.stack);
      }
    }
    res.redirect('/');
  });
  app.post('/delete', async (req, res) => {
    const task = req.body.task;
  
    if (!task) {
      return res.status(400).send('Task is required');
    }
  
    try {
      const result = await db.query('DELETE FROM todoList WHERE task_list = $1', [task]);
      
      if (result.rowCount === 0) {
        return res.status(404).send('Task not found');
      }
  
      res.redirect('/');
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).send('Server error');
    }
  });
  
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
