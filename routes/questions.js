const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer'); 


const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

// event를 만들 때 입력폼이 모두 입력되었는지 검사
function validateForm(form, options) {

  if (!form.title) {
    return '이벤트 타이틀을 입력 해 주세요.';
  }

  if (!form.location) {
    return '이벤트 장소를 입력 해 주세요.';
  }

  if (!form.event_description) {
    return '이벤트 상세 설명을 입력 해 주세요.';
  }

  if (!form.organizer_name) {
    return '이벤트 등록 조직 이름을 입력 해 주세요.';
  }

  if (!form.organizer_description) {
    return '이벤트 등록 조직 설명을 입력 해 주세요.';
  }

  if (!form.tags) {
    return '태그를 입력 해 주세요.';
  }

  //if (!form.price) {
    //return '이벤트 티켓 종류를 선택 하고 가격을 입력 해 주세요.';
  //}

  if (!form.event_type) {
    return '이벤트 종류를 선택 해 주세요.';
  }

  if (!form.event_topic) {
    return '이벤트 분야를 선택 해 주세요.';
  }

  return null;
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {start: {'$regex': term, '$options': 'i'}},
      {starttime: {'$regex': term, '$options': 'i'}},
      {end: {'$regex': term, '$options': 'i'}},
      {endtime: {'$regex': term, '$options': 'i'}},
      {event_description: {'$regex': term, '$options': 'i'}},
      {organizer_name: {'$regex': term, '$options': 'i'}},
      {organizer_description: {'$regex': term, '$options': 'i'}},
      {price: {'$regex': term, '$options': 'i'}},
      {event_type: {'$regex': term, '$options': 'i'}},
      {event_topic: {'$regex': term, '$options': 'i'}},
    ]};
  }
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('questions/index', {questions: questions, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('questions/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('questions/edit', {question: question});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');
  const answers = await Answer.find({question: question.id}).populate('author');
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await question.save();
  res.render('questions/show', {question: question, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.location = req.body.location;
  question.start = req.body.start;
  question.starttime = req.body.starttime;
  question.end = req.body.end;
  question.endtime = req.body.endtime;
  question.event_description = req.body.event_description;
  question.organizer_name = req.body.organizer_name;
  question.organizer_description = req.body.organizer_description;
  question.tags = req.body.tags.split(" ").map(e => e.trim());
  question.price = req.body.price;
  question.event_type = req.body.event_type;
  question.event_topic = req.body.event_topic;


  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/questions');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/questions');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  
  const user = req.user;
  var question = new Question({
    title: req.body.title,
    location: req.body.location,
    start: req.body.start,
    starttime: req.body.starttime,
    end: req.body.end,
    endtime: req.body.endtime,
    author: user._id,
    event_description: req.body.event_description,
    organizer_name: req.body.organizer_name,
    organizer_description: req.body.organizer_description,   
    tags: req.body.tags.split(" ").map(e => e.trim()),
    price: req.body.price,
    event_type: req.body.event_type,
    event_topic: req.body.event_topic,
  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/questions');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/questions/${req.params.id}`);
}));



module.exports = router;
