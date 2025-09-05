
dbConfig = require('../config/confi');

const LodgeQuery = (req, res) => {
   
const {querytype,querydescription} = req.body;



if(!querytype || !querydescription){
    return res.status(400).json({error: 'Please provide all required fields'});
}

const id = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit ID

const query = 'INSERT INTO queries (id, querytype, querydescription) VALUES (?, ?, ?)';

dbConfig.query(query, [id, querytype, querydescription], (error, results) => {
    if (error) {
        console.error('Database insert error:', error);
        return res.status(500).json({ error: 'Database error during inserting query' });
    }


    res.status(201).json({ message: 'Query lodged successfully', queryId: results.insertId });   

})

}


module.exports = { LodgeQuery };

