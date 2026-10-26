if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ExpressError, catchAsync } = require('./utils');
const { optionalAuth } = require('./middleware/auth');
const home = require('./controllers/home');

const app = express();

// ---------- database ----------
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/NewProject', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

// ---------- middleware ----------
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- API ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.get('/api/home', catchAsync(home.home));
app.get('/api/search', catchAsync(home.search));
app.use('/api', require('./routes/items'));

app.all('/api/*', (req, res, next) => next(new ExpressError('Page Not Found', 404)));

// ---------- React build (production) ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// ---------- errors ----------
app.use((err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || 'Oh No, Something Went Wrong!';

    if (err.name === 'CastError') { status = 404; message = 'Cannot find that item'; }
    else if (err.name === 'UserExistsError') { status = 400; }
    else if (err.name === 'ValidationError') { status = 400; }
    else if (err.code === 11000) {
        status = 400;
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
        message = field ? `That ${field} is already in use` : 'That value is already in use';
    }
    if (status === 500) console.error(err);
    res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serving on port ${PORT}`));
