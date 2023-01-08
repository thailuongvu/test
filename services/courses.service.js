import db from "../utils/db.js";

export default {
  findAll() {
    return db("courses");
  },
  async countByCatId(catId) {
    const list = await db("courses")
      .where("CatID", catId)
      .count({ amount: "CourID" });

    return list[0].amount;
  },
  async findById(id) {
    const list = await db("courses").where("CourID", id);
    if (list.length === 0) return null;

    return list[0];
  },
  async findCourMostViews(id)
  {
    const Id=await db('courses').select('CatID').where('CourID',id);
    
    const list=await db('courses').where('CatID',+Id[0].CatID).whereNot('CourID',id).orderBy('Views').limit(5);
    if (list.length === 0) return null;

    return list;
  },

  findPageByCatId(catId, limit, offset) {
    return db("courses").where("CatID", catId).limit(limit).offset(offset);
  },

  findByCatId(catID) {
    return db("courses").where("CatID", catID);
  },

  async findNewestCourses() {
    return db("courses").limit(10).orderBy("dob", "desc");
  },

  async findPopularCourses() {
    const sql = `SELECT rated.CourID, courses.CourName, CONVERT(AVG(rated.Rating), float) as score
                 FROM coursesrating rated, courses
                 WHERE rated.CourID = courses.CourID
                 GROUP BY rated.CourID
                 ORDER BY score DESC
                 LIMIT 3`;
    const ret = await db.raw(sql);
    return ret[0];
  },
  async searchByName(name) {
    const ret = await db.raw(
      "select  linhvuc.CatName , khoahoc.*  from categories as linhvuc, courses as khoahoc where linhvuc.CatID=khoahoc.CatID and match(linhvuc.CatName,khoahoc.CourName) against(? IN BOOLEAN MODE )",
      name
    );
    console.log(ret[0]);
    return ret[0];
  },

  async countsearch(name) {
    const ret = await db.raw(
      "select linhvuc.CatName,count(khoahoc.CourID) as CourCount from categories as linhvuc, courses as khoahoc where linhvuc.CatID=khoahoc.CatID and match(linhvuc.CatName,khoahoc.CourName) against(? IN BOOLEAN MODE ) group by linhvuc.CatName",
      name
    );
    console.log(ret[0]);
    return ret[0];
  },

  async increaseView(id) {
    const list = await db("courses").where("CourID", id);
    return db("courses")
      .where("CourID", id)
      .update({ Views: list[0].Views + 1 });
  },

  async getNextID(){
    const sql = `SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = 'courses' and table_schema = 'sus';`
    const ret = await db.raw(sql);
    return ret[0];
  },
  addNew(courses) {
    return db("courses").insert(courses);
  },

  del(id) {
    return db("courses").where("CourID", id).del();
  },

  patch(courses) {
    const id = courses.CourID;
    delete courses.CourID;

    return db("courses").where("CourID", id).update(courses);
  },
  async addEnroll(entity){
    console.log(entity);
    delete entity.FeedBack;
    delete entity.Rating;
    const check=await db('enroll').where('CourID',entity.CourID).where('StudentID',entity.StudentID);
    if(check.length===0)
    {
      return await db('enroll').insert(entity);
    }else{
    return null;}
  },
  async checkEnroll(Courid,id){
    
    const check=await db('enroll').where('CourID',Courid).where('StudentID',id);
    let flag = true;
    if(check.length===0)
    {
      flag = false    
    }
    return flag;
  },

  async chapter(id){
    return await db('chapter').where('CourID',id);

  },
  async ratingCourses(id){
    const rate= await db('coursesrating').avg('Rating as rate').count('RatingID as cnt').where('CourID',id);
    return rate[0];
  },
  async review(id){
    const ret =await db.raw('SELECT c.RatingID,c.Rating,c.FeedBack,c.dob,s.username from coursesrating  c, users  s where c.StudentID=s.id and  CourID=?',id);
    return ret[0];
  },
  async addFB(entity)
  {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;
    entity.dob=formattedToday;
    return await db('coursesrating').insert(entity);


  }
};
