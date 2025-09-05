
const dbConfig = require('../config/confi');

const AdminDashboard = (req, res) => {
   
const query = 'SELECT * FROM queries'; // Example query to fetch all users
dbConfig.query(query, (error, results) => {
    if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Database error during fetching dashboard data' });
    }
  
    res.status(200).json({users: results });   
}
    
);

}

module.exports = { AdminDashboard };