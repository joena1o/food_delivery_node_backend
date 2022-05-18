var express = require("express");
var app = express();
var cors = require("cors");
var mysql = require("mysql");
var multe = require("multer");
const path = require('path');



app.use(express.json())
app.use(cors());


const conn = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bigbite'
    }
);


app.get("/fetchimg/:file", (req, res)=>{


    res.download("./images/"+req.params.file);

    
});


var storage = multe.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
 
var upload = multe({
    storage: storage
});


app.post("/newMenu", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {

        const imgsrc = req.file.filename;
        const item = req.body.item;
        const desc = req.body.desc;
        const price = req.body.price;
        const cat = req.body.cat;


        var insertData = "INSERT INTO menu(item_name,item_price,item_desc,item_cat,image) VALUES(?,?,?,?,?)";
        conn.query(insertData, [item, price, desc, cat, imgsrc], (err, result) => {
            if (err) throw err
            res.end("uploaded");
        })
    }
});



app.post("/EditMenu", upload.single('file'), (req, res) => {


        
        const item = req.body.item;
        const desc = req.body.desc;
        const price = req.body.price;
        const cat = req.body.cat;
        const status = req.body.status;
        const id = req.body.id;

    if (!req.file) {

        var updateData = "UPDATE menu SET item_name = ?, item_price = ?, item_desc = ?, item_cat = ?, status = ? WHERE item_id = ? ";
        conn.query(updateData, [item, price, desc, cat, status,  id], (err, result) => {
            if (err) throw err
            res.end("uploaded");
        });

        console.log("No file upload");


    } else {

        const imgsrc = req.file.filename;

        var updateData = "UPDATE menu SET item_name = ?, item_price = ?, item_desc = ?, item_cat = ?, status = ?, image = ? WHERE item_id = ? ";
        conn.query(updateData, [item, price, desc, cat, status, imgsrc, id], (err, result) => {
            if (err) throw err
            res.end("uploaded");
        })
    }
});





app.get("/getUsers", (req, res)=>{

    conn.query("SELECT * FROM users", (err, result)=>{

        if(err) throw err;
        else{
            res.send(JSON.stringify(result));
        }

    });


});


app.get("/getOrders/:order", (req, res)=>{

    const val = req.params.order;

    conn.query("SELECT * FROM myorder WHERE order_status = ?", [val], (err, result)=>{

        if(err) throw err;
        else{
            res.send(JSON.stringify(result));
        }

    });


});


app.post("/replyRev", (req, res)=>{


    const reply = req.body.reply;
    const id = req.body.reply_id;

    console.log(reply + " " + id);

    conn.query("INSERT INTO review_replay(reply, reply_id) VALUES(?,?)", [reply, id], (err, result)=>{

        if(err) throw err;
        else{
            res.send("sent");
        }

    });

})

app.get("/deleterev/:num", (req, res)=>{

    const id = req.params.num;


    conn.query("DELETE FROM user_review WHERE review_id = ? ",[id],(err,result)=>{


        if(err) throw err;
        else{
            res.end("deleted");
        }

    });

});


app.get("/deleteItem/:num", (req, res)=>{

    const id = req.params.num;


    conn.query("DELETE FROM menu WHERE item_id = ? ",[id],(err,result)=>{


        if(err) throw err;
        else{
            res.end("deleted");
        }

    });

});


app.get("/fetchmenu/:num", (req, res)=>{


    conn.query("SELECT * FROM menu ORDER BY item_id ASC",(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

});


//APIS APIS

app.post("/reg",(req,res)=>{

    const name = req.body.name;
    const lname = req.body.lname;
    const phone = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;


    conn.query("INSERT INTO users(name,lastname,phone,email,password) VALUES(?,?,?,?,?)",
    [name,lname,phone,email,password], (err,result)=>{

        if(err) throw err;
        else{

            res.end("success");

        }

    });


});


app.get("/fetchFav/:user", (req, res)=>{

    const user = req.params.user;


    conn.query("SELECT * FROM favourite INNER JOIN menu on favourite.menu_id = menu.item_id WHERE user = ?", [user], (err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

});


app.post("/login", (req,res)=>{

    const email = req.body.email;
    const password = req.body.password;

    conn.query("SELECT * FROM users WHERE email =? and password =? ", [email,password],
    (err,result)=>{


        if(err) throw err;
        else{

            if(result.length>0){
                res.end("clear");
            }else{
                res.end("deny");
            }

        }


    });

});



app.post("/addToFav", (req, res)=>{

    const id = req.body.id;
    const user = req.body.user;

   

    conn.query("SELECT * FROM favourite WHERE menu_id = ? and user = ?", [id,user],(err,result)=>{


        if(err) throw err
        else{

            if(result.length > 0){


                conn.query("DELETE FROM favourite WHERE menu_id = ? and user = ?",[id,user],(err,result)=>{


                    if(err) throw err;
                    else{
                        res.end("removed");
                    }
            
                });



            }else{

                conn.query("INSERT INTO favourite(menu_id,user) VALUES(?,?)",[id,user],(err,result)=>{


                    if(err) throw err;
                    else{
                        res.end("success");
                    }
            
                });


            }


        }


    });


    

    


});


app.post("/checkout", (req, res)=>{

    const date = new Date();
    const items = req.body.items;
    const user = req.body.user;
    const cost = req.body.cost;
    const phone = req.body.phone;
    const qty = req.body.qty;
    const loc = req.body.location;
    const address = req.body.addr;
    const lat = req.body.lat;
    const long = req.body.lng;
    const date_ = date.toJSON().slice(0,10);
    const status = "pending";



    conn.query("INSERT INTO myorder(order_items, user, cost, phone, quantity, location, address, lat, lng, date, order_status) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    [items, user, cost, phone, qty, loc, address, lat, long, date_, status], (err, result)=>{

        if(err) {
            console.log(err);
        }
        else{

            if(result){

                conn.query("DELETE FROM mycart WHERE user = ?", [user], (err, result2)=>{

                    if(result){
                        res.send("Successful");
                    }else{
                        res.send("Failed");
                    }

                });

                
            }else{

                res.send("failed");

            }

        }


        } 

    );



});



app.post("/review", (req, res)=>{


    const user = req.body.user;
    const product_id = req.body.id;
    const review = req.body.review;
    const rating = req.body.rating;


    conn.query("INSERT INTO user_review(user,review,rating,item_id) VALUES(?,?,?,?)", [user,review, rating, product_id],
    (err, result)=>{

        if(err) throw err;
        else{

            res.send("Posted");


        }
        
    });


});


app.get("/getReviews", (req, res)=>{

    conn.query("SELECT * FROM user_review", (err, result)=>{

        if(err) throw err;
        else{
            res.send(JSON.stringify(result));
        }
        
    });
    
});


app.post("/addToCart", (req, res)=>{

    const id = req.body.id;
    const user = req.body.user;
    const qty = req.body.quantity;

   

    conn.query("SELECT * FROM mycart WHERE product_id = ? and user = ?", [id,user],(err,result)=>{


        if(err) throw err
        else{

            if(result.length > 0){


                conn.query("UPDATE mycart SET quantity = ?  WHERE product_id = ? and user = ?",[qty,id,user],(err,result)=>{


                    if(err) throw err;
                    else{
                        res.end("done");
                    }
            
                });



            }else{

                conn.query("INSERT INTO mycart(product_id,user,quantity) VALUES(?,?,?)",[id,user,qty],(err,result)=>{


                    if(err) throw err;
                    else{
                        res.end("success");
                    }
            
                });


            }


        }


    });


    

    


});

app.get("/searchmenu/:val", (req, res)=>{


    const val = req.params.val;


    conn.query("SELECT * FROM menu WHERE item_name LIKE ?", '%'+val+'%',(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

    


});


app.post("/searchcat", (req, res)=>{


    const val = req.body.val;
    const cat = req.body.cat;


    conn.query("SELECT * FROM menu WHERE item_cat = ? and item_name LIKE ?", [cat,'%'+val+'%'],(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

    


});



app.get("/fetchcart/:user", (req, res)=>{


    const val = req.params.user;


    conn.query("SELECT * FROM mycart INNER JOIN menu on mycart.product_id = menu.item_id WHERE user = ?", [val] ,(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

    


});


app.get("/fetchNotice/:user", (req, res)=>{


    const val = req.params.user;


    conn.query("SELECT * FROM user_notice INNER JOIN myorder on user_notice.id_ = myorder.order_id WHERE user_notice.user = ? ORDER BY notice_id DESC", [val] ,(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

    


});


app.get("/seenStat/:user", (req, res)=>{


    const val = req.params.user;


    conn.query("UPDATE user_notice SET read_ = ? WHERE user = ?", ["true",val] ,(err,result)=>{


        if(err) throw err;
        else{
            res.end("updated");
        }

    });

    


});


app.get("/fetchPending/:user", (req, res)=>{


    const val = req.params.q;
    const user = req.params.user;


    conn.query("SELECT * FROM myorder WHERE user = ? ORDER BY order_id DESC", [user] ,(err,result)=>{


        if(err) throw err;
        else{
            res.end(JSON.stringify(result));
        }

    });

    


});


app.get("/removecart/:id", (req, res)=>{


    const val = req.params.id;


    conn.query("DELETE FROM mycart WHERE cart_id = ?", [val] ,(err,result)=>{


        if(err) throw err;
        else{
            res.end("success");
        }

    });

    


});


app.get("/processorder/:id/:act/:user", (req, res)=>{


    const val = req.params.act;
    const id = req.params.id;
    const user = req.params.user;

   
    conn.query("UPDATE myorder set order_status = ? WHERE order_id = ?", [val, id] ,(err,result)=>{


        if(err) throw err;
        else{       

                conn.query("INSERT INTO user_notice(notice_type,user,id_) VALUES(?,?,?)", [val, user, id],
                (err, result)=>{

                    if(err) throw err;
                    else{

                        res.end("success");

                    }


                }
                );

            
        }

    });

    


});







// app.post("/reg",(req, res)=>{

//     const name = req.body.name;
//     const surname = req.body.surname;
//     const email = req.body.email;
//     const password = req.body.password;
//     const username = req.body.username;

     
//     conn.query("INSERT INTO user(name, surname, email, username,  password) VALUES(?,?,?,?,?)", [
//         name, surname, email, username, password
//     ], (err, result) => {
//         if(err)
//             res.end("Failed");
//         else{
//             res.end("Success");
//         }
//     })

// });

// app.post("/comment",(req, res)=>{

//     const user = req.body.user;
//     const postid = req.body.post_id;
//     const comment = req.body.comment;

//     // res.end(user + postid + comment);
    

     
//     conn.query("INSERT INTO comments(user,post_id,comment) VALUES(?,?,?)", [
//         user, postid, comment
//     ], (err, result) => {
//         if(err)
//             res.end(JSON.stringify(err));
//         else{
//             res.end("commented");
//         }
//     })

// });


// app.post("/getimages", (req, res) => {

//     conn.query("SELECT * FROM posts WHERE user = ?", [req.body.user], (err, result)=>{

//         if(err){
//             console.log(err);
//         }else{
//             res.end(JSON.stringify(result));
//         }

//     });

// }); 


// app.post("/getstatus", (req, res) => {

//     conn.query("SELECT * FROM status INNER JOIN user on status.user = user.username", [req.body.user], (err, result)=>{

//         if(err){
//             console.log(err);
//         }else{
//             res.end(JSON.stringify(result));
//         }

//     });

// }); 

// app.post("/fetchcomm", (req, res) => {

//     conn.query("SELECT * FROM comments INNER JOIN user on comments.user = user.username WHERE post_id =? ", [req.body.postid], (err, result)=>{

//         if(err){
//             console.log(err);
//         }else{
//             res.end(JSON.stringify(result));
//         }

//     });

// }); 

// app.post("/search", (req, res) => {

//     console.log(req.body.search);

//     conn.query("SELECT * FROM user WHERE username = ?", [req.body.search], (err, result)=>{

//         if(err){
//             console.log(err);
//         }else{
//             // res.end(JSON.stringify(result));
//            // console.log(JSON.stringify(result))
//         }

//     });

// }); 

// app.post("/usersstatus", (req, res) => {

    

//     conn.query("SELECT * FROM statuses INNER JOIN user on statuses.user = user.username WHERE user = ?", [req.body.user], (err, result)=>{

//         if(err){
//             console.log(err);
//         }else{
            
//             res.end(JSON.stringify(result));
//         }

//     });

// }); 


// app.post("/login", (req, res)=>{

//     const email = req.body.email;
//     const pass = req.body.pass;

//     conn.query("SELECT * FROM user WHERE email = ? and password = ? ", [email,pass], (err, result)=>{

//             if(err){
//                 res.end("Failed");
//             }else{
               
//                 if(result.length > 0){

//                     res.end(JSON.stringify([result[0].username, result[0].profile_pic]));

//                     console.log(JSON.stringify([result[0].username, result[0].profile_pic]));

//                 }else{

//                     res.end("invalid");

//                 }

                

//             }

//     });

// });



// app.post("/like", (req, res)=>{

//     const user = req.body.user;
//     const post_id = req.body.post_id;

//     var likes = 0;


//     conn.query("SELECT * FROM posts WHERE id = ?", [post_id], (err, result)=>{

//         if(err) throw err;
//         else{

//             likes = parseInt(result[0].likes);

//             console.log(result);
//         }

//     });

//     conn.query("SELECT * FROM likes WHERE user = ? AND post_id = ?", [user,post_id], (err, result)=>{

//         if(err){
//             res.end("Failed");

//         }else{

//             console.log(result);


//             if(result.length < 1){

//                 conn.query("INSERT INTO likes(user,post_id)VALUE(?,?)", [user,post_id], (err, result)=>{

//                     if(err){
//                         res.end("Failed");
//                     }else{
            
                        
        
//                     }
        
//                 });


//                 conn.query("UPDATE posts SET likes = ? WHERE id = ?", [likes+1, post_id],
//                 (err, result)=>{

//                     if(err){

//                     }else{
//                         res.end("liked");
//                     }

//                 });

//         }else{


//             conn.query("DELETE FROM likes WHERE user = ? and post_id = ?", [user,post_id], (err, result)=>{

//                 if(err){
//                     res.end("Failed");
//                 }else{
                   
                    
    
//                 }
    
//             });

//             conn.query("UPDATE posts SET likes = ? WHERE id = ?", [likes-1, post_id],
//                 (err, result)=>{

//                     if(err){

//                     }else{
//                         res.end("disliked");
//                     }

//                 });


//         }
           
            

//         }

//     });

    

// });

// app.post("/fetch", (req, res)=>{

//     const user = req.body.user;
  

//     conn.query("SELECT * FROM posts INNER JOIN user on posts.user = user.username", [user], (err, result)=>{

//             if(err){
//                 console.log(err);
//                 res.end("Failed");
//             }else{

//                 // console.log(JSON.stringify(result));
               
//                 res.end(JSON.stringify(result));

//             }

//     });

// });

// app.post("/fetchuser", (req, res)=>{

//     const user = req.body.user;
  

//     conn.query("SELECT * FROM user WHERE username = ?", [user], (err, result)=>{

//             if(err){
//                 console.log(err);
//                 res.end("Failed");
//             }else{

//                 // console.log(JSON.stringify(result));
               
//                 res.end(JSON.stringify(result));

//             }

//     });

// });

// app.get("/fetchimg/:file", (req, res)=>{


//     res.download("./images/"+req.params.file);

    
// });


// var storage = multer.diskStorage({
//     destination: (req, file, callBack) => {
//         callBack(null, './images/')     // './public/images/' directory name where save the file
//     },
//     filename: (req, file, callBack) => {
//         callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })
 
// var upload = multer({
//     storage: storage
// });



// app.post("/upload", upload.single('file'), (req, res) => {
//     if (!req.file) {
//         console.log("No file upload");
//     } else {

//         const imgsrc = req.file.filename;
//         const caption = req.body.caption;
//         const user = req.body.user;

//         var insertData = "INSERT INTO posts(user,caption,image)VALUES(?,?,?)"
//         conn.query(insertData, [user,caption,imgsrc], (err, result) => {
//             if (err) throw err
//             res.end("uploaded");
//         })
//     }
// });





// app.post("/uploadstat", upload.single('file'), (req, res) => {
//     if (!req.file) {
//         console.log("No file upload");
//     } else {

//         const imgsrc = req.file.filename;
//         const user = req.body.user;


//         conn.query("SELECT * FROM status WHERE user = ? ", [user], (err, result)=>{


//             if(result.length > 0){


//                 var update = "UPDATE status SET updated=?  WHERE user = ?";

//                 conn.query(update, ["true", user], (err, result)=>{

//                     if(err) throw err
                    
//                     else{

//                         var insertData = "INSERT INTO statuses(user,image)VALUES(?,?)"
//                         conn.query(insertData, [user,imgsrc], (err, result) => {
//                             if (err) throw err
//                             res.end("uploaded");
//                         })


//                     }


//                 });




//             }else{


//                 var insertStat = "INSERT INTO status(updated,user) VALUES(?,?)";

//                 conn.query(insertStat, ["true", user], (err, result)=>{

//                     if(err) throw err
                    
//                     else{

//                         var insertData = "INSERT INTO statuses(user,image)VALUES(?,?)"
//                         conn.query(insertData, [user,imgsrc], (err, result) => {
//                             if (err) throw err
//                             res.end("uploaded");
//                         })


//                     }


//                 });



//             }


//         });


        

        
//     }
// });



app.listen(3001,()=>{
    console.log("Server is running")
});