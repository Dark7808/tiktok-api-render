const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// ১. ভিডিও ডেটা
app.get('/api/video', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data && data.code === 0 && data.data) {
      res.json({ success: true, data: data.data });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ২. ইউজারের অন্যান্য ভিডিও
app.get('/api/user', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const apiUrl = `https://tikwm.com/api/user/posts?unique_id=${username}&count=30`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ৩. গানের অন্যান্য ভিডিও
app.get('/api/music', async (req, res) => {
  const musicId = req.query.music_id;
  if (!musicId) return res.status(400).json({ error: 'Music ID required' });
  try {
    const apiUrl = `https://tikwm.com/api/music/posts?music_id=${musicId}&count=30`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
