function fetchm(){


    app.get("/", (req, res)=>{


        conn.query("SELECT * FROM menu",(err,result)=>{
    
    
            if(err) throw err;
            else{
                res.end(JSON.stringify(result));
            }
    
        });
    
        
    
    
    });
    
    

}

export default fetchm;
