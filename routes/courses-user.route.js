import express from "express";
import coursesService from "../services/courses.service.js";
import userService from"../services/user.service.js";
import * as bodyParser from "express";

const router = express.Router();

router.get("/", async function (req, res) {
  const list = await coursesService.findAll();
  res.render("vwCourses/byCat", {
    courses: list,
    empty: list.length === 0,
  });
});

router.get("/byCat/:id", async function (req, res) {
  const catId = req.params.id || 0;

  for (let c of res.locals.lcCategories) {
    if (c.CatID === +catId) c.isActive = true;
  }

  const curPage = req.query.page || 1;
  const limit = 5;
  const offset = (curPage - 1) * limit;

  const total = await coursesService.countByCatId(catId);
  const nPages = Math.ceil(total / limit);
  
  const pageNumbers = [];
  for (let i = 1; i <= nPages; i++) {
    pageNumbers.push({
      value: i,
      isCurrent: i === +curPage,
      isCurPage:curPage,
      nPages,
    });
  }

  const list = await coursesService.findPageByCatId(catId, limit, offset);
  res.render("vwCourses/byCat", {
    courses: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
  });
});

router.get('/search',async function (req,res){
  res.render('vwCourses/search');
});

router.post('/search', async function (req, res) {
  const ret=req.body.Search;
  console.log(ret);
  console.log(req.body);
  const product = await coursesService.searchByName(ret);
const CourCount= await coursesService.countsearch(ret);
  if (product === null) {
    return res.redirect('/');
  }
  res.render('vwCourses/search', {
    product: product,
    CourCount:CourCount
  });

});

router.get('/detail/:id', async function (req, res) {
  const proId = req.params.id || 0;
  const user = req.session.authUser;
  const product = await coursesService.findById(proId);
  const listMost=await coursesService.findCourMostViews(proId);
  await coursesService.increaseView(proId);
  const chap=await coursesService.chapter(proId);
  const rating=await coursesService.ratingCourses(proId);
  const teacherId=product.TeacherID; 
  const teacher=await userService.findById(teacherId);
  const rev=await coursesService.review(proId);
  let flag;
  if(user == null){

  } else {
   flag = await coursesService.checkEnroll(proId,user.id);
  }
  console.log(req.session.auth);
  
  if (product === null) {

    return res.redirect('/');
  }

  res.render('vwCourses/detail', {
    product: product,
    listMost,
    chap,
    rating,
    teacher,
    rev,
    flag,
  });
});
router.post('/add', async function (req, res) {
  
  const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;
    
  const user = req.session.auth;
  let ret=null;
  req.body.dob=formattedToday;
  
  //console.log(req.body);
  if(user){
   ret= await coursesService.addEnroll(req.body);
  res.render('vwCourses/add',{
    ret:ret,
    layout: false,
  });

  }else{
    res.redirect("/account/login");
  }
  

 

});
router.post('/wishcourses', async function (req, res) {
  
 
  console.log(req.body);
  const ret= await coursesService.addWishCourses(req.body);
  console.log(ret);
  const id=req.body.CourID;
  if(ret==null)
  {
    return res.redirect('/')
  }else{
  return res.redirect('/courses');}


});
router.post('/comment', async function (req, res) {
  
  console.log(req.body)
  const c=await coursesService.addFB(req.body);
  return res.redirect('/courses')
  


});

export default router;
