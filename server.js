const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/ping', (req, res) => res.status(200).send('OK'));

// ১. একক ভিডিও ডেটা
app.get('/api/video', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const response = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
    const data = await response.json();
    if (data && data.code === 0 && data.data) {
      res.json({ success: true, data: data.data });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ২. ইউজারনেম দিয়ে সব ভিডিও (Discover User)
app.get('/api/user', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const response = await fetch(`https://tikwm.com/api/user/posts?unique_id=${username}&count=50`);
    const data = await response.json();
    if (data.code === 0 && data.data && data.data.videos) {
      const videos = data.data.videos.map(v => ({
        title: v.title || 'No Title',
        link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`,
        thumbnail: v.cover || v.origin_cover
      }));
      res.json({ success: true, videos });
    } else {
      res.json({ success: false, error: 'User not found or no videos' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ৩. হ্যাশট্যাগ দিয়ে সব ভিডিও
app.get('/api/hashtag', async (req, res) => {
  const tag = req.query.tag;
  if (!tag) return res.status(400).json({ error: 'Hashtag required' });
  try {
    const response = await fetch(`https://tikwm.com/api/challenge/posts?ch_name=${encodeURIComponent(tag)}&count=50`);
    const data = await response.json();
    if (data.code === 0 && data.data && data.data.videos) {
      const videos = data.data.videos.map(v => ({
        title: v.title || 'No Title',
        link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`,
        thumbnail: v.cover || v.origin_cover
      }));
      res.json({ success: true, videos });
    } else {
      res.json({ success: false, error: 'Hashtag not found' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ৪. রিলেটেড ভিডিও (Music)
app.get('/api/music', async (req, res) => {
  const musicId = req.query.music_id;
  if (!musicId) return res.status(400).json({ error: 'Music ID required' });
  try {
    const response = await fetch(`https://tikwm.com/api/music/posts?music_id=${musicId}&count=30`);
    const data = await response.json();
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
