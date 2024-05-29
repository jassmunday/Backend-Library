import app from "./app.js";
import { dbConnection } from "./db/database.js";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 3003;


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});

dbConnection();
