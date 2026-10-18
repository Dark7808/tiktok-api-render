const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

app.get('/ping', (req, res) => res.status(200).send('OK'));

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

// ২. ইউজারের ভিডিও (Discover)
app.get('/api/user', async (req, res) => {
  const secUid = req.query.secUid;
  if (!secUid) return res.status(400).json({ error: 'secUid required' });
  try {
    const apiUrl = `https://www.tiktok.com/api/post/item_list/?aid=1988&count=30&secUid=${secUid}&cursor=0`;
    const response = await fetch(apiUrl, {
       headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.tiktok.com/'
       }
    });
    const text = await response.text();
    let itemList = [];
    try {
        const data = JSON.parse(text);
        itemList = data.itemList || [];
    } catch (e) {}

    if (itemList.length > 0) {
        const links = itemList.map(v => `https://www.tiktok.com/@${v.author.uniqueId}/video/${v.id}`);
        return res.json({ success: true, links: links });
    }
    const fallbackRes = await fetch(`https://tikwm.com/api/user/posts?sec_uid=${secUid}&count=30`);
    const fallbackData = await fallbackRes.json();
    let fallbackLinks = [];
    if (fallbackData.code === 0 && fallbackData.data && fallbackData.data.videos) {
        fallbackLinks = fallbackData.data.videos.map(v => `https://www.tiktok.com/@${v.author.unique_id}/video/${v.id}`);
    }
    res.json({ success: true, links: fallbackLinks });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ৩. গানের ভিডিও (Discover)
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

// ৪. ফিড (Explore)
app.get('/api/feed', async (req, res) => {
  const region = req.query.region || 'BD';
  try {
    const apiUrl = `https://tikwm.com/api/feed/list?region=${region}&count=20`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data && data.code === 0 && data.data) {
        const videos = data.data.map(v => ({
            title: v.title, link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`, author: v.author.unique_id
        }));
        res.json({ success: true, data: videos });
    } else {
        res.json({ success: false, error: 'Not found' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ৫. লাইভ (Live)
app.get('/api/live', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const apiUrl = `https://tikwm.com/api/live/info?unique_id=${username}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data && data.code === 0 && data.data) {
        res.json({ success: true, data: data.data });
    } else {
        res.json({ success: false, error: 'Not live' });
    }
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
