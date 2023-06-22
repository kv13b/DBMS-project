var mysql = require("mysql");
const bodyparser = require("body-parser");
const express = require("express");
const session = require("express-session");
const ejs = require('ejs');
const path = require('path');    
const app = express();
const port = 5000;

app.set("views",__dirname+"/views");
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));


app.use(
    session({
      secret:"karthik",
      resave: false,
      saveUninitialized: false,
    })
  );
var con = mysql.createConnection({
    port: 3306,
    host: "localhost",
    user: "root",
    password: "",
    database: "badminton",
  });
  con.connect(function (err) {
    if (err) throw err;
    console.log("connected");
  });


app.get("/",(req,res)=>{
  res.render("home.ejs")
})
app.post("/signup",(req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const password = req.body.password;
    var sql="insert into customer(c_name,c_email,c_password)values(?,?,?)";
    con.query(sql,[name,email,password],(err,results)=>{
        if(err){
            throw err;
        }
        res.redirect("/")
        console.log("created");
    })
})
app.post("/login",(req,res)=>{
    const email=req.body.email;
    const password = req.body.password;

    var sql1="select * from customer where c_email=? and c_password=?";
    con.query(sql1,[email,password],(err,results)=>{
        if(results!=null){
            req.session.loggedin=true;
            req.session.email=email;
            req.session.userid=results[0].c_id;
        res.redirect("/");
        }else{
            res.redirect("/")
            console.log("no user found")
        }
    })
})

app.get("/products",(req,res)=>{
    var sql="select * from products";
    con.query(sql,(err,results)=>{
        try{
        res.render("products",{result:results});//should ask
                                                //body
    }catch(err){
        console.log(err)
        res.redirect("/")
    }
    })

})
app.get("/seller",(req,res)=>{
    res.render("seller.ejs",{displayOrders:"",result:[]})//should ask
})
app.post("/addproducts",(req,res)=>{
    const pname=req.body.pname;
    const pprice=req.body.pprice;
    const pdesc=req.body.pdesc;
    var sql1="insert into products(p_name,p_desc,p_price)values(?,?,?)";
    con.query(sql1,[pname,pdesc,pprice],(err,results)=>{
        try{
            res.redirect("seller");
        }catch(err){
            console.log(err)
            res.redirect("seller")
        }
    })

})
app.post("/products/:id",(req,res)=>{
     console.log(req.params.id,req.session.userid)
    var sql="insert into cart_items(p_id,c_id)values(?,?)";
    con.query(sql,[req.params.id,req.session.userid],(err,results)=>{
        if(err)throw(err)
        res.redirect("/products")
    })
})

app.get("/cart_items",(req,res)=>{
   var sql="select p.p_id,p.p_name from products p,cart_items c where p.p_id=c.p_id and c.c_id=?"
   con.query(sql,[req.session.userid],(err,results)=>{
    if(err) throw err;
        res.render("cart_items.ejs",{result:results})
   })
    
})
app.post("/ordernw",(req,res)=>{
    var sql1="select p.p_id from products p,cart_items c where p.p_id=c.p_id and c.c_id=?"
    con.query(sql1,[req.session.userid],(err,results)=>{
        if(err) throw err;
        var sql2="insert into orders(p_id,c_id)values(?,?)";
        results.forEach((item,index)=>{
            con.query(sql2,[item.p_id,req.session.userid],(err,results)=>{
                if(err) throw err;
            })
        })
        con.query("delete from cart_items where c_id=?",[req.session.userid],(err,results)=>{
            if(err) throw err
            res.redirect("cart_items");
        })
        

    })
})
app.get("/seller/orders",(req,res)=>{
    var sql="select o.o_id,p.p_id,p.p_name,o.c_id from orders o,products p where o.p_id=p.p_id"
    con.query(sql,(err,results)=>{
        res.render("seller.ejs",{displayOrders:"block",result:results})
    })
})

app.get("/orders",(req,res)=>{
    var sql="select p.p_id,p.p_name from products p,orders o where o.c_id=? and o.p_id=p.p_id"
    con.query(sql,[req.session.userid],(err,results)=>{
        res.render("orders.ejs",{result:results})
    })
})


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

